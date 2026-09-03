import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

const DEFAULT_FROM_EMAIL = "no-reply@notifications.tamilulagam.in";
const DEFAULT_FROM_NAME = "Tamil Ulagam";

export interface SendEmailInput {
  readonly eventType: string;
  readonly to: string;
  readonly subject: string;
  readonly html: string;
  readonly text: string;
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
