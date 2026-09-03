import { createClient } from "npm:@supabase/supabase-js@2";

import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { escapeHtml, renderEmail } from "../_shared/email-template.ts";
import { sendTransactionalEmail } from "../_shared/resend-client.ts";
import { createServiceRoleClient } from "../_shared/service-client.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ ok: false, reason: "error" }, 405);
  }

  let body: { organizationId?: string; redirectPath?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ ok: false, reason: "error" }, 400);
  }
  const organizationId = body.organizationId;
  const redirectPath = body.redirectPath;
  if (!organizationId || !redirectPath) {
    return jsonResponse({ ok: false, reason: "error" }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const authorization = req.headers.get("Authorization") ?? "";

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
  });

  const { data: authorized, error: authorizationError } =
    await callerClient.rpc("can_manage_organization", {
      target_organization_id: organizationId,
    });
  if (authorizationError || authorized !== true) {
    return jsonResponse({ ok: false, reason: "error" }, 403);
  }

  if (!Deno.env.get("RESEND_API_KEY")) {
    return jsonResponse({ ok: false, reason: "not_configured" });
  }

  const { data: organization, error: organizationError } = await callerClient
    .from("organizations")
    .select("name, official_email")
    .eq("id", organizationId)
    .maybeSingle();
  if (organizationError || !organization?.official_email) {
    return jsonResponse({ ok: false, reason: "error" }, 404);
  }

  let serviceClient: ReturnType<typeof createClient>;
  try {
    serviceClient = createServiceRoleClient(supabaseUrl);
  } catch {
    return jsonResponse({ ok: false, reason: "error" }, 500);
  }

  const { data: rawToken, error: issueError } = await serviceClient.rpc(
    "issue_organization_email_verification_token",
    { target_organization_id: organizationId },
  );
  if (issueError || !rawToken) {
    return jsonResponse({ ok: false, reason: "error" }, 500);
  }

  const verificationUrl = new URL(redirectPath);
  verificationUrl.searchParams.set("verify_org_email", rawToken);
  verificationUrl.searchParams.set("organisation", organizationId);

  const entityName = escapeHtml(organization.name);
  const { html, text } = renderEmail({
    heading: "Confirm your organisation's official email",
    paragraphs: [
      `A Tamil Ulagam account requested organisation-email verification for <strong>${entityName}</strong>.`,
    ],
    cta: {
      label: "Confirm this email address",
      url: verificationUrl.toString(),
    },
    footnote:
      "This link is single-use and expires in 24 hours. If you did not request this, no action is needed.",
  });

  const idempotencyKey = `org-email-verification:${organizationId}:${Math.floor(Date.now() / 60_000)}`;

  const result = await sendTransactionalEmail(serviceClient, {
    eventType: "organization_email_verification",
    to: organization.official_email,
    subject: "Confirm your organisation's official email",
    html,
    text,
    idempotencyKey,
    relatedTable: "organizations",
    relatedId: organizationId,
  });

  if (!result.ok) {
    return jsonResponse(result, result.reason === "not_configured" ? 200 : 502);
  }
  return jsonResponse({ ok: true });
});
