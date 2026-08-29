// Sends "Affiliation confirmed" or "Affiliation could not be confirmed"
// after a manager has already decided a membership (decide_organization_
// membership already ran — this function only notifies about a decision
// that already exists in trusted DB state).
//
// The outcome (confirmed vs not confirmed) is read from the
// organization_memberships row itself, never from the request body — a
// client cannot choose which email gets sent, only which already-decided
// membership to notify about, and only for an organisation it manages.
import { createClient } from "npm:@supabase/supabase-js@2";

import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { escapeHtml, renderEmail } from "../_shared/email-template.ts";
import { sendTransactionalEmail } from "../_shared/resend-client.ts";

const SITE_URL =
  Deno.env.get("PUBLIC_SITE_URL") ?? "https://tamil-ulagam-staging.pages.dev";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ ok: false, reason: "error" }, 405);
  }

  let body: { membershipId?: string; organizationId?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ ok: false, reason: "error" }, 400);
  }
  const membershipId = body.membershipId;
  const organizationId = body.organizationId;
  if (!membershipId || !organizationId) {
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

  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const serviceClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: membership, error: membershipError } = await serviceClient
    .from("organization_memberships")
    .select("id, organization_id, status, member_email")
    .eq("id", membershipId)
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (membershipError || !membership) {
    return jsonResponse({ ok: false, reason: "error" }, 404);
  }
  if (membership.status !== "approved" && membership.status !== "rejected") {
    // Nothing to notify about yet (still pending) or not an outcome this
    // notification exists for (e.g. revoked) — a safe no-op, not an error.
    return jsonResponse({ ok: true, skipped: true });
  }
  if (!membership.member_email) {
    return jsonResponse({ ok: false, reason: "error" }, 404);
  }

  const { data: organization, error: organizationError } = await serviceClient
    .from("organizations")
    .select("name")
    .eq("id", organizationId)
    .maybeSingle();
  if (organizationError || !organization) {
    return jsonResponse({ ok: false, reason: "error" }, 404);
  }
  const entityName = escapeHtml(organization.name);

  const confirmed = membership.status === "approved";
  const { html, text } = renderEmail({
    heading: confirmed
      ? "Affiliation confirmed"
      : "Affiliation could not be confirmed",
    paragraphs: [
      confirmed
        ? `<strong>${entityName}</strong> confirmed your membership.`
        : `<strong>${entityName}</strong> could not confirm your membership at this time.`,
    ],
    cta: {
      label: confirmed ? "Open Member Workspace" : "Review affiliations",
      url: `${SITE_URL}/workspace/member`,
    },
  });

  const result = await sendTransactionalEmail(serviceClient, {
    eventType: "affiliation_outcome",
    to: membership.member_email,
    subject: confirmed ? "Affiliation confirmed" : "Update on your affiliation",
    html,
    text,
    idempotencyKey: `affiliation-outcome:${membership.id}:${membership.status}`,
    relatedTable: "organization_memberships",
    relatedId: membership.id,
  });

  if (!result.ok) return jsonResponse(result);
  return jsonResponse({ ok: true });
});
