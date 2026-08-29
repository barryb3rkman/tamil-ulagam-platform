-- Phase H4 — Member Registration V2 + affiliation verification.
--
-- This is deliberately NOT a rebuild of the membership domain. The A1/C2
-- lifecycle (organization_memberships / organization_membership_history,
-- request_organization_membership / invite_organization_member /
-- decide_organization_membership / revoke_organization_membership /
-- leave_organization_membership, and every RLS policy protecting them)
-- is already secure, already tested, and already implements exactly the
-- model H4 asks for: server-side verified-only eligibility, cross-tenant
-- decision denial, an immutable history trail, a duplicate-active-
-- relationship constraint that still allows re-request after rejection,
-- and structural separation from organization_managers (membership never
-- grants management). None of that is touched here.
--
-- What was genuinely missing, additively added below:
--   1. `profiles.region`/`profiles.city` — the common Member profile
--      (H4 brief section 4) needs a full location; profiles already had
--      country but not region/city.
--   2. Three new columns on organization_memberships carrying exactly
--      what a manager needs to confirm a real affiliation claim without
--      a live auth.users join: the applicant's own email (server-
--      evaluated at request time, the same pattern
--      organization_applications.representative_email already
--      established for the Organisation journey), and a minimal
--      typed connection-type/context pair for the category-aware
--      question (H4 brief sections 9-17) — never an untyped blob.

-- ---------------------------------------------------------------------
-- 1. profiles — region/city.
-- ---------------------------------------------------------------------

alter table public.profiles
  add column if not exists region text not null default '',
  add column if not exists city text not null default '';

alter table public.profiles
  add constraint profiles_location_lengths
  check (char_length(region) <= 160 and char_length(city) <= 160);

-- The existing column-level grant (full_name, phone, country) does not
-- automatically extend to new columns — a separate grant statement is
-- required, and accumulates alongside the original one.
grant update (region, city) on table public.profiles to authenticated;

-- ---------------------------------------------------------------------
-- 2. organization_memberships — applicant email + connection context.
-- ---------------------------------------------------------------------

alter table public.organization_memberships
  add column if not exists member_email text not null default '',
  add column if not exists connection_type text not null default '',
  add column if not exists connection_context text not null default '',
  add column if not exists connection_context_extra text not null default '';

alter table public.organization_memberships
  add constraint organization_memberships_connection_lengths
  check (
    char_length(member_email) <= 320
    and char_length(connection_type) <= 160
    and char_length(connection_context) <= 240
    and char_length(connection_context_extra) <= 240
  );

-- ---------------------------------------------------------------------
-- 3. request_organization_membership — carry the caller's own email
-- (server-evaluated, never client-supplied) and the optional category-
-- aware connection fields. The existing idempotent-return-existing-row
-- behaviour, the eligibility check, and the advisory lock are otherwise
-- byte-for-byte unchanged.
--
-- `create or replace function` does NOT replace a function whose
-- declared parameter list differs in length, even when the new
-- parameters are all defaulted — it silently creates a second,
-- separate overload instead, leaving the original signature (and its
-- own, now-stale revoke/grant) still callable. That second overload
-- also inherits Postgres's default "PUBLIC may execute" privilege,
-- since it was never explicitly revoked — a real regression this
-- migration caught on itself during local testing. The old signature is
-- therefore dropped explicitly first.
-- ---------------------------------------------------------------------

drop function public.request_organization_membership(
  uuid, public.organization_membership_type
);

create function public.request_organization_membership(
  target_organization_id uuid,
  requested_membership_type public.organization_membership_type default null,
  applicant_connection_type text default null,
  applicant_connection_context text default null,
  applicant_connection_context_extra text default null
)
returns public.organization_memberships
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  current_user_email text;
  existing_membership public.organization_memberships;
  new_membership public.organization_memberships;
begin
  if current_user_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  if not public.is_organization_membership_eligible(target_organization_id) then
    raise exception 'This organisation is not open for membership requests.'
      using errcode = '42501';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      current_user_id::text || ':' || target_organization_id::text, 0
    )
  );

  select * into existing_membership
  from public.organization_memberships
  where organization_id = target_organization_id
    and user_id = current_user_id
    and status in ('pending', 'approved')
  order by created_at desc
  limit 1;

  -- Idempotent by design: a caller who already has an active (pending or
  -- approved) relationship gets that relationship back unchanged, rather
  -- than an error or a duplicate row. A prior rejected/revoked row does
  -- NOT block a fresh request — circumstances change, and re-deciding is
  -- a manager's call to make again, not something the schema forecloses.
  if existing_membership.id is not null then
    return existing_membership;
  end if;

  select email into current_user_email from auth.users where id = current_user_id;

  insert into public.organization_memberships (
    organization_id, user_id, status, membership_type, requested_at,
    member_email, connection_type, connection_context, connection_context_extra
  ) values (
    target_organization_id, current_user_id, 'pending',
    requested_membership_type, now(),
    coalesce(current_user_email, ''),
    coalesce(nullif(btrim(applicant_connection_type), ''), ''),
    coalesce(nullif(btrim(applicant_connection_context), ''), ''),
    coalesce(nullif(btrim(applicant_connection_context_extra), ''), '')
  ) returning * into new_membership;

  insert into public.organization_membership_history (
    membership_id, actor_user_id, previous_status, new_status
  ) values (
    new_membership.id, current_user_id, null, 'pending'
  );

  return new_membership;
end;
$$;

revoke all on function public.request_organization_membership(
  uuid, public.organization_membership_type, text, text, text
) from public, anon;
grant execute on function public.request_organization_membership(
  uuid, public.organization_membership_type, text, text, text
) to authenticated;

-- ---------------------------------------------------------------------
-- 4. invite_organization_member — same email-capture treatment, for the
-- invited user rather than the caller. Connection-context parameters are
-- also accepted for consistency (a manager inviting a known member may
-- already know their role), but stay optional/empty by default — the
-- invite direction is not part of H4's own redesigned UX. Same
-- drop-then-create treatment as above, for the same reason.
-- ---------------------------------------------------------------------

drop function public.invite_organization_member(
  uuid, uuid, public.organization_membership_type
);

create function public.invite_organization_member(
  target_organization_id uuid,
  target_user_id uuid,
  invited_membership_type public.organization_membership_type default null,
  applicant_connection_type text default null,
  applicant_connection_context text default null,
  applicant_connection_context_extra text default null
)
returns public.organization_memberships
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  target_user_email text;
  existing_membership public.organization_memberships;
  new_membership public.organization_memberships;
begin
  if current_user_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  if not public.can_manage_organization(target_organization_id) then
    raise exception 'You cannot invite members for this organisation.'
      using errcode = '42501';
  end if;

  select email into target_user_email from auth.users where id = target_user_id;
  if target_user_email is null then
    raise exception 'The invited user could not be found.' using errcode = 'P0002';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      target_user_id::text || ':' || target_organization_id::text, 0
    )
  );

  select * into existing_membership
  from public.organization_memberships
  where organization_id = target_organization_id
    and user_id = target_user_id
    and status in ('pending', 'approved')
  order by created_at desc
  limit 1;

  if existing_membership.id is not null then
    return existing_membership;
  end if;

  insert into public.organization_memberships (
    organization_id, user_id, status, membership_type, invited_at, invited_by,
    member_email, connection_type, connection_context, connection_context_extra
  ) values (
    target_organization_id, target_user_id, 'pending',
    invited_membership_type, now(), current_user_id,
    coalesce(target_user_email, ''),
    coalesce(nullif(btrim(applicant_connection_type), ''), ''),
    coalesce(nullif(btrim(applicant_connection_context), ''), ''),
    coalesce(nullif(btrim(applicant_connection_context_extra), ''), '')
  ) returning * into new_membership;

  insert into public.organization_membership_history (
    membership_id, actor_user_id, previous_status, new_status
  ) values (
    new_membership.id, current_user_id, null, 'pending'
  );

  return new_membership;
end;
$$;

revoke all on function public.invite_organization_member(
  uuid, uuid, public.organization_membership_type, text, text, text
) from public, anon;
grant execute on function public.invite_organization_member(
  uuid, uuid, public.organization_membership_type, text, text, text
) to authenticated;
