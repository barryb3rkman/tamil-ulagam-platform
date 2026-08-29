-- Phase H5 — Resend transactional email infrastructure.
--
-- Two additive pieces:
--
-- 1. Closes a real gap in the existing (pre-H5) organisation-email
--    verification feature: changing `organizations.official_email` never
--    reset `official_email_verified_at` or the outstanding unconsumed
--    verification token, so a previously verified organisation could
--    change its official email and still show as "verified" for an
--    inbox nobody had proven control of, or a stale link for the OLD
--    address could still mark the NEW one verified.
--
-- 2. `email_deliveries` — a small, generic delivery log every new
--    transactional Edge Function writes to. Records operational metadata
--    only (event type, recipient, a loose reference to the entity the
--    email is about, provider message id, status, failure category,
--    timestamp) — never a full HTML body, never secret material. A
--    unique `idempotency_key` is the single mechanism preventing a
--    double-click, RPC retry, or Edge Function retry from sending the
--    same notification twice: every sender upserts its key with
--    ignoreDuplicates before attempting delivery, so a duplicate attempt
--    is a fast, safe no-op rather than a second email.
--
-- No existing column, table, policy, or grant is narrowed or removed.

-- ---------------------------------------------------------------------
-- 1. Invalidate organisation-email verification when the email changes.
-- ---------------------------------------------------------------------

create function public.reset_official_email_verification_on_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.official_email is distinct from old.official_email then
    new.official_email_verified_at := null;
    new.official_email_verification_sent_at := null;
    -- Any link already emailed for the OLD address must not be able to
    -- silently verify the NEW one.
    delete from public.organization_email_verifications
    where organization_id = old.id
      and consumed_at is null;
  end if;
  return new;
end;
$$;

create trigger organizations_reset_email_verification
before update on public.organizations
for each row
execute function public.reset_official_email_verification_on_change();

-- ---------------------------------------------------------------------
-- 2. Delivery log.
-- ---------------------------------------------------------------------

create table public.email_deliveries (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  recipient_email text not null,
  related_table text,
  related_id uuid,
  provider_message_id text,
  status text not null default 'pending',
  failure_category text,
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  constraint email_deliveries_event_type_length
    check (char_length(event_type) between 1 and 100),
  constraint email_deliveries_recipient_email_length
    check (char_length(recipient_email) between 1 and 320),
  constraint email_deliveries_status_valid
    check (status in ('pending', 'sent', 'failed', 'skipped')),
  constraint email_deliveries_idempotency_key_length
    check (char_length(idempotency_key) between 1 and 200)
);

create unique index email_deliveries_idempotency_key_idx
  on public.email_deliveries (idempotency_key);

create index email_deliveries_related_idx
  on public.email_deliveries (related_table, related_id, created_at desc);

alter table public.email_deliveries enable row level security;

-- No policies for anon/authenticated at all, combined with the revoke
-- below, makes this table completely unreachable from the browser in
-- either direction. service_role bypasses RLS once it has a table
-- grant, but a grant is not implicit — this project's service_role has
-- no privileges on a table until one is stated explicitly (confirmed
-- while writing this migration's own integration tests: a direct
-- service-role .insert() against a table with no such grant fails with
-- "permission denied", not a silent bypass). Every other table a
-- service-role Edge Function touches directly already carries this
-- exact grant (see e.g. organization_manager_invitations,
-- partnership_enquiries); this repeats that established pattern rather
-- than assuming implicit access.
revoke all on table public.email_deliveries from anon, authenticated;
grant select, insert, update on table public.email_deliveries to service_role;

-- Pre-existing gap, closed here rather than by editing the accepted
-- migration that created this table: organization_email_verifications'
-- own comment already documented the intent that "service_role" could
-- touch it directly, but (like email_deliveries above) no grant ever
-- backed that — invisible until now because every existing code path
-- only ever went through the table's two SECURITY DEFINER functions,
-- which run as the function owner regardless of the caller's own table
-- grants. A service-role Edge Function or admin script reading or
-- correcting a row directly (as this migration's own tests, and any
-- future operational debugging, need to) requires this explicitly.
grant select, update on table public.organization_email_verifications
  to service_role;
