// Sends a notification email when an Organisation or Tamil Sangam
// application's review decision becomes needs_changes, verified, or
// rejected — review_organization_application already made that decision;
// this function only notifies about a status that already exists in
// trusted DB state. No email for submitted/under_review/suspended (see
// H5 brief section 23 — default toward in-app confirmation only).
//
// Authorization here is role-level, not per-organisation: the caller
// must already be a reviewer (is_application_reviewer(), the exact same
// check review_organization_application itself makes), matching how
// only a reviewer could have caused this status change in the first
// place.
import { createClient } from "npm:@supabase/supabase-js@2";

import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { escapeHtml, renderEmail } from "../_shared/email-template.ts";
import { sendTransactionalEmail } from "../_shared/resend-client.ts";
import { createServiceRoleClient } from "../_shared/service-client.ts";

const SITE_URL =
  Deno.env.get("PUBLIC_SITE_URL") ?? "https://tamil-ulagam-staging.pages.dev";

const NOTIFIABLE_STATUSES = new Set(["needs_changes", "verified", "rejected"]);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ ok: false, reason: "error" }, 405);
  }

  let body: { applicationId?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ ok: false, reason: "error" }, 400);
  }
  const applicationId = body.applicationId;
  if (!applicationId) {
    return jsonResponse({ ok: false, reason: "error" }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const authorization = req.headers.get("Authorization") ?? "";

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
  });

  const { data: isReviewer, error: authorizationError } =
    await callerClient.rpc("is_application_reviewer");
  if (authorizationError || isReviewer !== true) {
    return jsonResponse({ ok: false, reason: "error" }, 403);
  }

  let serviceClient: ReturnType<typeof createClient>;
  try {
    serviceClient = createServiceRoleClient(supabaseUrl);
  } catch {
    return jsonResponse({ ok: false, reason: "error" }, 500);
  }

  const { data: application, error: applicationError } = await serviceClient
    .from("organization_applications")
    .select("id, organization_id, status, representative_email, admin_feedback")
    .eq("id", applicationId)
    .maybeSingle();
  if (applicationError || !application) {
    return jsonResponse({ ok: false, reason: "error" }, 404);
  }
  if (!NOTIFIABLE_STATUSES.has(application.status)) {
    return jsonResponse({ ok: true, skipped: true });
  }
  if (!application.representative_email) {
    return jsonResponse({ ok: false, reason: "error" }, 404);
  }

  const { data: organization, error: organizationError } = await serviceClient
    .from("organizations")
    .select("name, category, organization_tamil_community_details(subtype)")
    .eq("id", application.organization_id)
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
  const entityName = escapeHtml(organization.name);
  const resumePath = isSangam ? "/join/sangam" : "/join/organisation";
  const workspacePath = isSangam
    ? `/workspace/sangam?sangam=${application.organization_id}`
    : `/workspace/organisation?organization=${application.organization_id}`;
  const feedback = application.admin_feedback
    ? escapeHtml(application.admin_feedback)
    : null;

  let heading: string;
  let paragraphs: string[];
  let cta: { label: string; url: string };
  let subject: string;

  if (application.status === "needs_changes") {
    heading = "Your registration needs changes";
    paragraphs = [
      `Reviewing <strong>${entityName}</strong>'s registration, Tamil Ulagam needs a few changes before it can continue.`,
      ...(feedback ? [feedback] : []),
    ];
    cta = { label: "Continue registration", url: `${SITE_URL}${resumePath}` };
    subject = `Action needed: ${organization.name}'s registration`;
  } else if (application.status === "verified") {
    heading = "Registration verified";
    paragraphs = [
      `<strong>${entityName}</strong> is now verified on Tamil Ulagam.`,
    ];
    cta = { label: "Open workspace", url: `${SITE_URL}${workspacePath}` };
    subject = `${organization.name} is verified on Tamil Ulagam`;
  } else {
    heading = "An update on your registration";
    paragraphs = [
      `Tamil Ulagam was unable to verify <strong>${entityName}</strong>'s registration at this time.`,
      ...(feedback ? [feedback] : []),
    ];
    cta = { label: "Review registration", url: `${SITE_URL}${resumePath}` };
    subject = `An update on ${organization.name}'s registration`;
  }

  const { html, text } = renderEmail({ heading, paragraphs, cta });

  const result = await sendTransactionalEmail(serviceClient, {
    eventType: "registration_status",
    to: application.representative_email,
    subject,
    html,
    text,
    idempotencyKey: `registration-status:${application.id}:${application.status}`,
    relatedTable: "organization_applications",
    relatedId: application.id,
  });

  if (!result.ok) return jsonResponse(result);
  return jsonResponse({ ok: true });
});
