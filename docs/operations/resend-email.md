# Resend transactional email (Phase H5)

Two independent channels, never conflated:

- **Supabase Auth** owns signup confirmation, password recovery, and any
  other Auth-native email. Resend is only its SMTP _delivery_ provider —
  Supabase still generates and validates every token. This repository
  does not rebuild that security.
- **The application** sends its own event-specific notifications
  (organisation-email verification, management invitations, affiliation
  outcomes, registration status) through the Resend HTTP API, called only
  from trusted Supabase Edge Functions — never from browser code.

## What already existed before this phase

Organisation-email verification (`supabase/functions/organization-email-verification`,
`issue_organization_email_verification_token` / `verify_organization_email`,
the `organization_email_verifications` table) predates H5 and was already a
complete, correctly-designed feature: random 32-byte token, sha256-hashed
at rest, 24-hour expiry, single-use, anon-callable verification (the
person clicking the link may have no session). H5 closed two real gaps in
it (see migration `20260901000000_resend_email_infrastructure.sql`):
changing `official_email` never invalidated a prior verification, and the
Edge Function itself never escaped the organisation name in its HTML.

## Architecture — application email

```
UI  →  platform/domain service (management-service.ts,
       membership-service.ts, supabase-services.ts)
    →  the RPC that makes the real change (unchanged, existing)
    →  fire-and-forget call to an event-specific Edge Function
    →  Edge Function re-derives recipient/content from trusted DB state
    →  Resend HTTP API
```

Every Edge Function follows the same two-layer authorization the
pre-existing verification function established: the caller's own JWT is
checked against the real authorization rule (`can_manage_organization`,
or `is_application_reviewer` for registration status) _before_ a
service-role client re-reads the entity from the database. **A client
can never choose the recipient, subject, or HTML — only which
already-decided entity to notify about**, and only one it is actually
authorized to act on. There is no generic `sendEmail(to, subject, html)`
endpoint anywhere.

A delivery failure never rolls back the domain action that already
happened — every call site wraps the notification in
`.catch(() => {})` after the real RPC has already succeeded.

### Edge Functions

| Function                          | Notifies about                                          | Authorization             |
| --------------------------------- | ------------------------------------------------------- | ------------------------- |
| `organization-email-verification` | Sends the verification link itself                      | `can_manage_organization` |
| `send-management-invitation`      | A pending manager invitation                            | `can_manage_organization` |
| `send-affiliation-outcome`        | A membership decided `approved`/`rejected`              | `can_manage_organization` |
| `send-registration-status`        | An application at `needs_changes`/`verified`/`rejected` | `is_application_reviewer` |

Shared code lives in `supabase/functions/_shared/`:

- `email-template.ts` — one function renders both HTML and a plain-text
  fallback from a heading/paragraphs/optional CTA. Table-based, inline
  styles only, no `<script>`, no `<style>` block, no web fonts — readable
  with images off, in dark mode, and in plain-text clients.
  `escapeHtml()` must be applied by the caller to every user-controlled
  string (organisation name, member name, reviewer feedback) before it
  reaches the template.
- `resend-client.ts` — `sendTransactionalEmail()`. Claims a unique
  `idempotency_key` in `email_deliveries` _before_ calling Resend at all
  (a double click, RPC retry, or function retry that reuses the same key
  hits the table's unique index and is treated as an already-handled
  duplicate, never a second send); applies `EMAIL_RECIPIENT_OVERRIDE` to
  the _actual_ Resend "to" address while still logging the _intended_
  recipient; returns `{ ok: false, reason: "not_configured" }` — never an
  error — when `RESEND_API_KEY` is absent, so every caller degrades the
  same well-understood way the pre-existing verification feature already
  did.

### Delivery log

`email_deliveries` (new table): `event_type`, `recipient_email` (the
intended one), `related_table`/`related_id`, `provider_message_id`,
`status` (`pending`/`sent`/`failed`/`skipped`), `failure_category`,
`idempotency_key` (unique), `created_at`. No HTML body, no secret
material. Unreachable from `anon`/`authenticated` (no RLS policy grants
either direction); `service_role` has an explicit `select, insert,
update` grant — **this project's `service_role` does not implicitly
bypass table grants**, confirmed while writing this phase's own
integration tests (a direct `service_role` `.insert()` against a table
with no explicit grant fails with `permission denied`, not a silent
bypass). The same gap existed, undiscovered, on the pre-existing
`organization_email_verifications` table and is closed in the same
migration.

## Domain and sender

**Not formally documented or DNS-verified anywhere before this phase.**
The one existing signal is the pre-existing Edge Function's hardcoded
sender: `Tamil Ulagam <no-reply@notifications.tamilulagam.org>`. H5
preserves and centralizes that exact address (`RESEND_FROM_EMAIL`/
`RESEND_FROM_NAME`, defaulted in `resend-client.ts`, overridable by
secret) rather than inventing a different one — but this is an
**inferred working assumption, not a confirmed decision**. A single
sender is used everywhere; no `membership@`/`registrations@`/`admin@`
addresses were created.

## What a human needs to do (nothing here was fabricated)

1. **Create a Resend account** (if one doesn't already exist) and add
   the sending domain — `notifications.tamilulagam.org`, or whichever
   domain is actually confirmed as correct; this phase could not confirm
   it against any other documentation.
2. **Add the DNS records Resend's own dashboard displays** for that
   domain (SPF/DKIM, and DMARC if desired) — copy them verbatim from
   Resend once the domain is added there. This document does not state
   record values because none exist yet; Resend generates them
   per-domain at creation time, and inventing plausible-looking ones
   would be actively unsafe.
3. **Wait for Resend to show the domain as Verified.** Nothing here
   should be treated as working before that.
4. **Create an API key** in Resend (sending-only scope is sufficient).
5. **Set it as an Edge Function secret on the staging project only:**
   ```
   supabase secrets set RESEND_API_KEY=<the key> --project-ref ybqpdatqcuuvotjkdlcc
   ```
   Optionally also `RESEND_FROM_EMAIL`, `RESEND_FROM_NAME`,
   `PUBLIC_SITE_URL` (defaults to `https://tamil-ulagam-staging.pages.dev`
   already), and `EMAIL_RECIPIENT_OVERRIDE` — see below. Never put any of
   these in `.env.local`/`.env.example`/`NEXT_PUBLIC_*`; they are
   Edge-Function-only secrets, not Next.js app configuration.
6. **Deploy the Edge Functions** (safe to do _before_ step 5 — every
   function degrades to `not_configured` without the secret):
   ```
   supabase functions deploy organization-email-verification --project-ref ybqpdatqcuuvotjkdlcc
   supabase functions deploy send-management-invitation --project-ref ybqpdatqcuuvotjkdlcc
   supabase functions deploy send-affiliation-outcome --project-ref ybqpdatqcuuvotjkdlcc
   supabase functions deploy send-registration-status --project-ref ybqpdatqcuuvotjkdlcc
   ```
7. **Auth SMTP — via the Dashboard, not `supabase config push`.** This
   project's `supabase/config.toml` already has a ready, commented
   `[auth.email.smtp]` block using Resend's own published SMTP relay
   (host `smtp.resend.com`, port `587`, username literally `resend`,
   password = the API key — stable Resend product documentation, not
   fabricated). **Do not run `supabase config push`** to apply it: that
   command pushes this _entire_ file, including `auth.site_url` and
   `auth.additional_redirect_urls`, which are deliberately set to local
   values (`http://127.0.0.1:3000`) here — pushing as-is would silently
   break staging's real Auth redirect configuration. Configure SMTP
   directly in the staging project's Dashboard instead: **Authentication
   → Providers → SMTP**, using the same four values.
8. **Auth email templates** — same reasoning: apply via **Authentication
   → Email Templates** in the Dashboard, pasting the contents of
   `supabase/templates/confirm-signup.html` (subject: "Confirm your
   Tamil Ulagam account") and `supabase/templates/reset-password.html`
   (subject: "Reset your Tamil Ulagam password") into the "Confirm
   signup" and "Reset password" templates respectively. Both were
   verified locally in this phase — real signup/recovery flow, real
   rendered HTML captured from the local mail catcher, correct
   `{{ .ConfirmationURL }}` substitution producing a working
   `redirect_to=…/auth/callback?flow=confirmation|recovery` link — so
   only the delivery layer (steps 5-7) remains to prove end-to-end on
   staging.
9. **Staging recipient safety.** Before sending anything real, set
   `EMAIL_RECIPIENT_OVERRIDE` (as an Edge Function secret, same command
   as step 5) to a real test inbox you control. While set, every
   transactional email's _actual_ delivery goes to that address
   regardless of the real recipient — the intended recipient is still
   what gets recorded in `email_deliveries`. Never set this in
   production. Provide the test inbox address; do not let anyone guess
   or hard-code a personal address.

Once steps 1-9 are done, the live tests in H5's own brief (signup
confirmation, password recovery, and the seven custom transactional
scenarios) can run for real, using disposable staging fixtures cleaned
up exactly afterward, matching every prior phase's own precedent.

## Decisions made, not built

- **Affiliation submission acknowledgement:** not sent. The Member
  Workspace already shows "Pending confirmation" immediately; an email
  for the submission itself would add volume without a corresponding
  need for action, verification, or attention — the three qualifying
  reasons this phase used to decide _for_ an email everywhere else.
- **Registration submission acknowledgement:** not sent, for the same
  reason — in-app "Registration submitted" confirmation already exists
  and is immediate.
- **Partnership enquiry acknowledgement:** not implemented. Documented
  here as plausible future work, not built now — the existing
  partnership lifecycle has no email touchpoint today and adding one
  wasn't clearly justified against Resend's free-tier volume within this
  phase's scope.

## Testing this layer

- `pnpm test:functions` — `email-template.ts`'s escaping and rendering,
  pure TypeScript, runs directly under Node's own test runner (no Deno
  needed, zero Deno-specific APIs in that one file).
- `pnpm test:supabase` (`local-integration-email.test.ts`) — the actual
  security boundary: token issuance/verification/expiry/replay,
  email-change invalidation, `email_deliveries`' idempotency unique
  constraint and its complete unreachability from `anon`/`authenticated`,
  and that only `service_role` can issue a verification token.
- **Not covered by an automated test in this phase:** the Edge
  Functions' own HTTP layer (their `Deno.serve` handlers). Neither Deno
  nor a live `RESEND_API_KEY` is available in this environment —
  `supabase functions serve` would start the functions locally, but
  every meaningful assertion beyond "it returns `not_configured`" needs
  a real Resend account to observe. The functions' actual security
  boundary (the RPCs and table grants they call into) _is_ fully covered
  above; the HTTP handlers themselves are thin, reviewed-by-hand wrappers
  around that boundary. Re-verify this specifically as part of the live
  test pass once credentials exist (H5 brief section 37).

## Never do this

- Never call Resend from browser code, ever.
- Never let a client choose recipient, subject, HTML, or sender.
- Never put `RESEND_API_KEY` in `.env.local`, `.env.example`, a
  `NEXT_PUBLIC_*` variable, migration SQL, a log line, or a code comment.
- Never run `supabase config push` against a project whose
  `auth.site_url`/`auth.additional_redirect_urls` haven't been reconciled
  first — prefer the Dashboard for Auth email/SMTP settings on a hosted
  project.
- Never set `EMAIL_RECIPIENT_OVERRIDE` in production.
