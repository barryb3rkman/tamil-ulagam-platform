// Shared transactional-email sender for every trusted, event-specific
// Edge Function in this project (send-management-invitation,
// send-affiliation-outcome, send-registration-status, and the
// organisation-email-verification function). Never imported by, or
// reachable from, browser code — this file only runs inside Supabase
// Edge Functions, which already have RESEND_API_KEY as a server-only
// secret unavailable to any client bundle.
//
// This module owns three responsibilities every caller would otherwise
// duplicate:
//   1. Idempotency — claim a unique idempotency_key in email_deliveries
//      BEFORE calling Resend at all. A double click, an RPC retry, or an
//      Edge Function retry that reuses the same key hits the table's
//      unique index and is treated as an already-handled duplicate, not
//      a second send.
//   2. Staging recipient safety — when EMAIL_RECIPIENT_OVERRIDE is set,
//      the INTENDED recipient is still what gets recorded in the
//      delivery log (so operational history stays meaningful), but the
//      actual Resend "to" address is always the override. Production
//      never sets this variable.
//   3. Delivery logging — one row per attempt, operational metadata
//      only: event type, recipient, a loose reference to the entity the
//      email is about, provider message id, status, failure category.
//      Never a full HTML body, never secret material.
//
// A missing RESEND_API_KEY is not an error: it returns
// { ok: false, reason: "not_configured" } exactly like the pre-existing
// organization-email-verification function already does, so every
// caller degrades the same, well-understood way.
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

const DEFAULT_FROM_EMAIL = "no-reply@notifications.tamilulagam.org";
const DEFAULT_FROM_NAME = "Tamil Ulagam";

export interface SendEmailInput {
  readonly eventType: string;
  /** The intended recipient — recorded in the delivery log even when
   * EMAIL_RECIPIENT_OVERRIDE redirects actual delivery elsewhere. */
  readonly to: string;
  readonly subject: string;
  readonly html: string;
  readonly text: string;
  /** A stable key unique to this exact notification (e.g.
   * `affiliation-outcome:<membershipId>:<status>`) — the sole mechanism
   * preventing a duplicate send. */
  readonly idempotencyKey: string;
  readonly relatedTable?: string;
  readonly relatedId?: string;
}

export type SendEmailResult =
  | { readonly ok: true; readonly status: "sent" }
  | { readonly ok: true; readonly status: "skipped_duplicate" }
  | { readonly ok: false; readonly reason: "not_configured" }
  | { readonly ok: false; readonly reason: "send_failed" };

export async function sendTransactionalEmail(
  // deno-lint-ignore no-explicit-any
  serviceClient: SupabaseClient<any>,
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    return { ok: false, reason: "not_configured" };
  }

  const { error: claimError } = await serviceClient
    .from("email_deliveries")
    .insert({
      event_type: input.eventType,
      recipient_email: input.to,
      related_table: input.relatedTable ?? null,
      related_id: input.relatedId ?? null,
      status: "pending",
      idempotency_key: input.idempotencyKey,
    });
  if (claimError) {
    // Postgres unique_violation — another attempt already claimed this
    // exact notification. Safe, expected, not an error.
    if (claimError.code === "23505") {
      return { ok: true, status: "skipped_duplicate" };
    }
    return { ok: false, reason: "send_failed" };
  }

  const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || DEFAULT_FROM_EMAIL;
  const fromName = Deno.env.get("RESEND_FROM_NAME") || DEFAULT_FROM_NAME;
  const override = Deno.env.get("EMAIL_RECIPIENT_OVERRIDE")?.trim();
  const actualRecipient = override || input.to;

  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [actualRecipient],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });
  } catch {
    await markFailed(serviceClient, input.idempotencyKey, "network_error");
    return { ok: false, reason: "send_failed" };
  }

  if (!response.ok) {
    await markFailed(
      serviceClient,
      input.idempotencyKey,
      `http_${response.status}`,
    );
    return { ok: false, reason: "send_failed" };
  }

  const body = (await response.json().catch(() => null)) as {
    id?: string;
  } | null;
  await serviceClient
    .from("email_deliveries")
    .update({ status: "sent", provider_message_id: body?.id ?? null })
    .eq("idempotency_key", input.idempotencyKey);

  return { ok: true, status: "sent" };
}

async function markFailed(
  // deno-lint-ignore no-explicit-any
  serviceClient: SupabaseClient<any>,
  idempotencyKey: string,
  failureCategory: string,
): Promise<void> {
  await serviceClient
    .from("email_deliveries")
    .update({ status: "failed", failure_category: failureCategory })
    .eq("idempotency_key", idempotencyKey);
}
