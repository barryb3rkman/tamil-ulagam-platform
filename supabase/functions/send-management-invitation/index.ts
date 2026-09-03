import { createClient } from "npm:@supabase/supabase-js@2";

import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { escapeHtml, renderEmail } from "../_shared/email-template.ts";
import { sendTransactionalEmail } from "../_shared/resend-client.ts";
import { createServiceRoleClient } from "../_shared/service-client.ts";

const SITE_URL =
  Deno.env.get("PUBLIC_SITE_URL") ?? "https://tamil-ulagam-staging.pages.dev";

const roleLabel: Record<string, string> = {
  admin: "Admin",
  representative: "Representative",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ ok: false, reason: "error" }, 405);
  }

  let body: { invitationId?: string; organizationId?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ ok: false, reason: "error" }, 400);
  }
  const invitationId = body.invitationId;
  const organizationId = body.organizationId;
  if (!invitationId || !organizationId) {
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

  let serviceClient: ReturnType<typeof createClient>;
  try {
    serviceClient = createServiceRoleClient(supabaseUrl);
  } catch {
    return jsonResponse({ ok: false, reason: "error" }, 500);
  }

  const { data: invitation, error: invitationError } = await serviceClient
    .from("organization_manager_invitations")
    .select("id, email, role, status, expires_at, organization_id")
    .eq("id", invitationId)
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (invitationError || !invitation || invitation.status !== "pending") {
    return jsonResponse({ ok: false, reason: "error" }, 404);
  }

  const { data: organization, error: organizationError } = await serviceClient
    .from("organizations")
    .select("name, category, organization_tamil_community_details(subtype)")
    .eq("id", organizationId)
    .maybeSingle();
  if (organizationError || !organization) {
    return jsonResponse({ ok: false, reason: "error" }, 404);
  }
  const details = (
    organization as {
      organization_tamil_community_details?: { subtype?: string }[] | null;
    }
  ).organization_tamil_community_details;
  const subtype = Array.isArray(details) ? (details[0]?.subtype ?? "") : "";
  const isSangam =
    organization.category === "tamil_community" &&
    subtype.trim().toLowerCase() === "tamil sangam";
  const entityLabel = isSangam ? "Tamil Sangam" : "Organisation";
  const entityName = escapeHtml(organization.name);
  const role = roleLabel[invitation.role] ?? invitation.role;
  const expires = new Date(invitation.expires_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const { html, text } = renderEmail({
    heading: "You've been invited to help manage " + entityName,
    paragraphs: [
      `You've been invited as <strong>${escapeHtml(role)}</strong> for the ${escapeHtml(entityLabel)} <strong>${entityName}</strong> on Tamil Ulagam.`,
      "This is a management invitation, not a membership — it gives you administrative access to this entity's Tamil Ulagam workspace.",
      "Sign in or create a Tamil Ulagam account with this email address to review and accept it.",
    ],
    cta: {
      label: "Review invitation",
      url: `${SITE_URL}/workspace/invitations`,
    },
    footnote: `This invitation expires ${expires}. If you weren't expecting it, no action is needed.`,
  });

  const result = await sendTransactionalEmail(serviceClient, {
    eventType: "management_invitation",
    to: invitation.email,
    subject: `You've been invited to manage ${organization.name} on Tamil Ulagam`,
    html,
    text,
    idempotencyKey: `management-invitation:${invitation.id}`,
    relatedTable: "organization_manager_invitations",
    relatedId: invitation.id,
  });

  if (!result.ok) return jsonResponse(result);
  return jsonResponse({ ok: true });
});
