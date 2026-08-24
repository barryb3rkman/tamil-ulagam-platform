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

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

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

  const providerApiKey = Deno.env.get("RESEND_API_KEY");
  if (!providerApiKey) {
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

  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const serviceClient = createClient(supabaseUrl, serviceRoleKey);

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

  const sendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${providerApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Tamil Ulagam <no-reply@notifications.tamilulagam.org>",
      to: [organization.official_email],
      subject: "Confirm your organisation's official email",
      html: `<p>A Tamil Ulagam account requested organisation-email verification for <strong>${organization.name}</strong>.</p><p><a href="${verificationUrl.toString()}">Confirm this email address</a></p><p>This link is single-use and expires in 24 hours. If you did not request this, no action is needed.</p>`,
    }),
  });

  if (!sendResponse.ok) {
    return jsonResponse({ ok: false, reason: "error" }, 502);
  }

  return jsonResponse({ ok: true });
});
