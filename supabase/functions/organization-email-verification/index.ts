// Sends an organisation-email verification link.
//
// Two authorization layers, deliberately separate:
//  1. A user-scoped client (the caller's own JWT) checks
//     can_manage_organization() exactly as RLS would — this function
//     never trusts the request body's organizationId on its own.
//  2. Only after that check passes does a service-role client (available
//     automatically inside every Edge Function, never shipped to the
//     browser) generate the token and send the email.
//
// The raw verification token is generated here and only ever leaves this
// function inside the outgoing email — it is never returned to the
// caller's HTTP response.
//
// If no email provider secret is configured, this returns a clear
// { ok: false, reason: "not_configured" } instead of fabricating a sent
// state. No token is created in that case.
//
// H5: rebuilt on the shared template/delivery-log/idempotency layer used
// by every other transactional Edge Function in this project (previously
// this function hand-built its own HTML with no escaping of the
// organisation name, no plain-text fallback, and no delivery log). The
// request/response contract to the frontend is unchanged.

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

  // Checked before issuing a token: a missing provider secret must never
  // burn a single-use token the email that would have carried it can
  // never actually be sent.
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

  // No stable entity id spans repeated attempts here (each send issues a
  // fresh single-use token, by design — the "Resend verification"
  // button is a legitimate, expected repeat action). Minute-granularity
  // keying absorbs an accidental double-click without blocking a
  // deliberate resend moments later.
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
