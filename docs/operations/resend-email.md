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

**Confirmed.** The real Tamil Ulagam domain is `tamilulagam.in`; the
Resend sending subdomain is `notifications.tamilulagam.in`. The earlier
`notifications.tamilulagam.org` was an inferred, unconfirmed guess (the
only signal available at the time was a pre-existing Edge Function's
hardcoded sender) and has been corrected everywhere it appeared in H5's
own code and docs — never touched two genuinely unrelated pre-existing
`.org` strings elsewhere in the codebase (a Tamil ID concept page's
illustrative example URL, and a mock-backend demo fixture email), since
neither is part of email-sending infrastructure and the correction here
is scoped to that. Confirmed sender:
`Tamil Ulagam <no-reply@notifications.tamilulagam.in>`
(`RESEND_FROM_EMAIL`/`RESEND_FROM_NAME`, defaulted in
`resend-client.ts`, overridable by secret). A single sender is used
everywhere; no `membership@`/`registrations@`/`admin@` addresses exist.

## Current status (as of Phase H5.1)

- Resend account and domain: **done** — `notifications.tamilulagam.in`
  exists in Resend, generating DNS records.
- DNS for `tamilulagam.in`: **blocked** — controlled by the user's
  manager, who was unavailable as of this phase. Nothing was invented or
  guessed; see the runbook below for the exact steps once they return.
- Resend API key: **not yet created** (see step 2 of "human actions
  needed," below).
- Staging Edge Function secrets: **none set** — every function still
  returns `{ ok: false, reason: "not_configured" }`.
- `EMAIL_RECIPIENT_OVERRIDE` test inbox: **not yet known.**
- Auth SMTP / Auth email templates: **prepared, not activated** — the
  commented `[auth.email.smtp]` block and the two template files are
  ready; nothing has been applied to the staging Dashboard.
- All four Edge Functions: **deployed and ACTIVE** on staging with the
  corrected `.in` sender baked in, confirmed via `supabase functions
list`.
- Staging migration history: **in sync** — `supabase migration list
--linked` shows every local migration through
  `20260901000000_resend_email_infrastructure.sql` already applied
  remotely.

## Human actions needed (in order)

1. **Create a Resend API key** — Resend → API Keys → Create API Key.
   Name: `Tamil Ulagam Staging`. Permission: sending access only, if
   Resend's key-creation screen offers that scope (a full-access key
   works too if a narrower one isn't offered — just don't grant more
   than sending). Do not paste the key into chat. Once created, either:
   - run this yourself, exactly as written, in a terminal with the
     Supabase CLI logged in and this repo checked out (nothing here ever
     sees or logs the value):
     ```
     supabase secrets set RESEND_API_KEY=<paste-key-here> --project-ref ybqpdatqcuuvotjkdlcc
     ```
   - or tell this session "the key is set" once you've run it, and a
     future session can verify (name-only, never value) via
     `supabase secrets list --project-ref ybqpdatqcuuvotjkdlcc`.
2. **Provide a test inbox** you control, for `EMAIL_RECIPIENT_OVERRIDE`.
   No staging email should ever go to a real member while this project
   is in this state — every send must land in that inbox regardless of
   the real recipient. Once both this and step 1 exist, the remaining
   secrets (`RESEND_FROM_EMAIL`, `RESEND_FROM_NAME`, `PUBLIC_SITE_URL`,
   `EMAIL_RECIPIENT_OVERRIDE`) can be set the same way — see the DNS
   runbook's step 11 for why SMTP/template activation still waits for
   domain verification even after this.

### DNS runbook (for when the manager returns)

Nothing below is a value this repository invented — every DNS value
comes from Resend's own dashboard at the time these steps are actually
run.

1. Open Resend → Domains → `notifications.tamilulagam.in`.
2. Copy the exact DNS records Resend displays there (typically one DKIM
   TXT/CNAME and one SPF-related record; Resend may also show an
   optional DMARC recommendation).
3. Open the real DNS provider for `tamilulagam.in` (not the Cloudflare
   account already authenticated for this repo's own Pages/Workers
   deploys — confirmed in Phase H5 that `tamilulagam.in` is not a zone
   under that account).
4. Check for existing SPF/DKIM/DMARC records on the domain before adding
   anything, so the new records extend rather than conflict with
   whatever's already there.
5. Add the Resend records exactly as shown — don't retype or "clean up"
   the values.
6. If the provider is Cloudflare, keep any mail-auth CNAME DNS-only
   (grey-clouded), never proxied.
7. If a DMARC TXT record already exists, do not add a second one —
   merge Resend's recommendation into the existing policy instead, or
   leave it and report the conflict.
8. Return to Resend.
9. Trigger/check domain verification.
10. Wait until Resend shows `notifications.tamilulagam.in` as
    **Verified** — DNS propagation can take anywhere from minutes to
    (rarely) a day; don't treat anything as working before this.
11. Only then activate staging Supabase Auth SMTP (values below) and
    paste the two Auth email templates into the Dashboard.
12. Run the live staging test matrix below.

### Prepared staging Dashboard values (Auth → Providers → SMTP)

Ready to paste once domain verification (runbook step 10) is complete —
do not activate before then, and never via `supabase config push` (see
"Never do this," below, for why).

```
Host: smtp.resend.com
Port: 587
Username: resend
Password: <the Resend API key from step 1 above>
Sender name: Tamil Ulagam
Sender email: no-reply@notifications.tamilulagam.in
```

### Auth email templates — reviewed this phase, no changes needed

Both `supabase/templates/confirm-signup.html` and
`supabase/templates/reset-password.html` were re-checked against every
H5.1 requirement: `{{ .ConfirmationURL }}` present exactly once each,
Tamil Ulagam branding present, zero `localhost`/`127.0.0.1` references,
zero `.org` references, and (already proven in H5 via a real local
signup/recovery round trip) the confirmation/recovery callback behaviour
is unchanged — the rendered link correctly carries
`redirect_to=…/auth/callback?flow=confirmation|recovery` through to
`AuthCallbackPanel`. Ready to paste into the Dashboard's Auth → Email
Templates screen once activation is appropriate (runbook step 11) —
subjects: "Confirm your Tamil Ulagam account" and "Reset your Tamil
Ulagam password".

### Post-DNS-verification live test matrix

Run once domain verification, the API key secret, and
`EMAIL_RECIPIENT_OVERRIDE` are all in place. Every row uses disposable,
exact-ID staging fixtures cleaned up immediately after, matching every
prior phase's precedent — no real member is ever contacted.

| #   | Scenario                                 | Trigger                                                                 | Verify                                                                                                                                                                                                                                      |
| --- | ---------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A   | Signup confirmation                      | Sign up a disposable staging user                                       | Delivered via Resend SMTP; sender `Tamil Ulagam <no-reply@notifications.tamilulagam.in>`; override inbox receives it, not the fake address; subject "Confirm your Tamil Ulagam account"; link confirms the account; plain-text part present |
| B   | Password recovery                        | `resetPasswordForEmail` on that user                                    | Same delivery/sender/override checks; subject "Reset your Tamil Ulagam password"; link reaches the real recovery form; login works with the new password                                                                                    |
| C   | Organisation official-email verification | Manager clicks "Send verification" for a disposable org                 | Sender/override/subject "Confirm your organisation's official email"; CTA link verifies the org; `email_deliveries` row with `status=sent` and a `provider_message_id`; no duplicate on a second click within the idempotency window        |
| D   | Management invitation                    | Owner invites a disposable email to manage a disposable org             | Subject mentions the org name; CTA → `/workspace/invitations`; correct role in the body; delivery-log row recorded                                                                                                                          |
| E   | Affiliation confirmed                    | Manager clicks "Confirm member" on a disposable pending affiliation     | Subject/heading "Affiliation confirmed"; CTA "Open Member Workspace" → staging URL only; membership stays `approved` even if this send were to fail                                                                                         |
| F   | Affiliation not confirmed                | Manager clicks "Not a member"                                           | Restrained subject/copy, no accusatory language; CTA "Review affiliations"; membership stays `rejected` regardless of delivery outcome                                                                                                      |
| G   | Registration needs changes               | Reviewer sets a disposable application to `needs_changes` with feedback | Feedback text appears verbatim (escaped) in the email; CTA back to the correct `/join/organisation` or `/join/sangam` route; no internal-only reviewer notes leak                                                                           |
| H   | Registration verified                    | Reviewer verifies a disposable application                              | CTA "Open workspace" → the correct `/workspace/organisation` or `/workspace/sangam` URL; no Sangam official-email-verification language for Sangam entities                                                                                 |
| I   | Registration rejected                    | Reviewer rejects a disposable application with feedback                 | Restrained copy; feedback included when present; no internal-only notes                                                                                                                                                                     |

For every row, also confirm: the actual Resend "to" is always the
override inbox regardless of the row's real intended recipient; the
intended recipient is still what's recorded in `email_deliveries`;
`RESEND_API_KEY` never appears in any response body, log, or the static
build; a second identical trigger (double-click / retry) produces no
second email, only a `status=sent` row already present or a
`skipped_duplicate` outcome.

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
