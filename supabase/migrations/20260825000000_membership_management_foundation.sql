-- Phase A1: MEMBERSHIP vs MANAGEMENT domain foundation.
--
-- Corrects a domain ambiguity: every existing `organization_members` row
-- is actually a MANAGEMENT GRANT (owner/admin/representative), not an
-- ordinary affiliation. This migration is purely additive:
--   - `organization_members` is NOT dropped, altered, or reinterpreted.
--     Its rows keep their existing management meaning throughout rollout.
--   - a new `organization_managers` table becomes the canonical home for
--     management grants going forward, backfilled 1:1 from the old table.
--   - a new `organization_memberships` table (+ history) introduces the
--     genuinely new concept: "I belong to this Organisation/Sangam",
--     fully independent of management authority.
-- No historical migration is modified. No existing policy is dropped.

-- ---------------------------------------------------------------------
-- 1. New enums
-- ---------------------------------------------------------------------

create type public.organization_membership_status as enum (
  'pending',
  'approved',
  'rejected',
  'revoked'
);

-- Deliberately small and nullable-by-design (see organization_memberships
-- below): NULL and 'general' are domain-equivalent. This lets the first
-- Member Registration implementation ship without forcing every
-- organisation to expose a membership-type choice immediately, while the
-- schema still carries the vocabulary the product brief asked for.
create type public.organization_membership_type as enum (
  'general',
  'student',
  'lifetime',
  'honorary'
);

-- ---------------------------------------------------------------------
-- 2. organization_managers — the new canonical MANAGEMENT GRANT table.
--
-- Conceptually equivalent to today's organization_members, using the
-- same fixed role vocabulary (no generic permission-engine). Kept
-- separate from organization_members rather than replacing it in place,
-- so the historical table can keep working, unmodified, for the whole
-- transition window (see section 5 below).
-- ---------------------------------------------------------------------

create table public.organization_managers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.organization_membership_role not null,
  granted_at timestamptz not null default now(),
  granted_by uuid references auth.users (id) on delete set null,
  constraint organization_managers_unique_user unique (organization_id, user_id)
);

create index organization_managers_user_idx
  on public.organization_managers (user_id, organization_id);

-- Owner-safety guard: an organisation may never end up with zero owners
-- through a manager-table delete or role change. This applies to every
-- writer (including service_role, since BEFORE triggers fire regardless
-- of row-level security), which matters because in this phase the table
-- is only writable by service_role and SECURITY DEFINER functions — the
-- product has no client-facing manager editor yet (see section 13/14 of
-- the brief), but the invariant is enforced at the data layer from day
-- one rather than left to whichever caller eventually gets write access.
create function public.protect_last_organization_owner()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  target_organization_id uuid := coalesce(old.organization_id, new.organization_id);
  remaining_owners integer;
begin
  if tg_op = 'DELETE' and old.role <> 'owner' then
    return old;
  end if;
  if tg_op = 'UPDATE' and (old.role <> 'owner' or new.role = 'owner') then
    return new;
  end if;

  select count(*) into remaining_owners
  from public.organization_managers
  where organization_id = target_organization_id
    and role = 'owner'
    and id <> old.id;

  if remaining_owners = 0 then
    raise exception 'An organisation must always retain at least one owner.'
      using errcode = '23514';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger organization_managers_protect_last_owner
before delete or update of role on public.organization_managers
for each row execute function public.protect_last_organization_owner();

-- ---------------------------------------------------------------------
-- 3. organization_memberships — the new AFFILIATION table.
--
-- One lifecycle serves both directions (person requests / organisation
-- invites) rather than two parallel state machines: exactly one of
-- requested_at/invited_at is set at creation and never changes after;
-- decided_at/decided_by are set once, atomically, by the RPCs below.
-- ---------------------------------------------------------------------

create table public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  status public.organization_membership_status not null default 'pending',
  membership_type public.organization_membership_type,
  requested_at timestamptz,
  invited_at timestamptz,
  invited_by uuid references auth.users (id) on delete set null,
  decided_at timestamptz,
  decided_by uuid references auth.users (id) on delete set null,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organization_memberships_request_xor_invite check (
    (requested_at is not null and invited_at is null)
    or (invited_at is not null and requested_at is null)
  ),
  constraint organization_memberships_decision_consistency check (
    (status = 'pending') = (decided_at is null)
  )
);

-- Prevents a duplicate *active* relationship (belt); the RPCs below also
-- take a per-user+organisation advisory lock before check-then-insert
-- (suspenders), so a race can never surface this constraint as a raw
-- error under normal use. A rejected/revoked row does NOT block a fresh
-- request — see request_organization_membership below.
create unique index organization_memberships_active_unique
  on public.organization_memberships (organization_id, user_id)
  where status in ('pending', 'approved');

create index organization_memberships_user_idx
  on public.organization_memberships (user_id, status);

create index organization_memberships_organization_idx
  on public.organization_memberships (organization_id, status, created_at desc);

create trigger organization_memberships_set_updated_at
before update on public.organization_memberships
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 4. organization_membership_history — audit trail.
--
-- Same philosophy as the existing application_review_history: every
-- status transition is an immutable, appended row rather than only ever
-- overwriting organization_memberships.status, so "who decided this and
-- when" is never lost even across repeated request/decide cycles.
-- ---------------------------------------------------------------------

create table public.organization_membership_history (
  id uuid primary key default gen_random_uuid(),
  membership_id uuid not null references public.organization_memberships (id) on delete cascade,
  actor_user_id uuid references auth.users (id) on delete set null,
  previous_status public.organization_membership_status,
  new_status public.organization_membership_status not null,
  note text,
  created_at timestamptz not null default now(),
  constraint organization_membership_history_note_length check (
    note is null or char_length(note) <= 2000
  )
);

create index organization_membership_history_membership_idx
  on public.organization_membership_history (membership_id, created_at desc);

-- ---------------------------------------------------------------------
-- 5. Backfill organization_managers 1:1 from organization_members.
--
-- Mapping: organization_id/user_id/role carry over unchanged.
-- `granted_at` <- `created_at` (the only timestamp organization_members
-- has). `granted_by` <- NULL: organization_members never recorded who
-- granted a role (every existing row was self-created by
-- create_organization_application_draft for the applicant themselves),
-- so there is no "granted by" actor to preserve — NULL is the accurate
-- representation of "not recorded", not a loss of real information.
--
-- `is_primary` is deliberately NOT copied into organization_managers: it
-- is a user-scoped *workspace selection* preference ("which of my
-- organisations is my current dashboard context"), not a management-grant
-- property. It has no equivalent concept in a management-grant table and
-- conflating the two would misrepresent what organization_managers means.
-- organization_members (and its is_primary column) remains the system of
-- record for this UI preference for the remainder of the transition
-- window — see section 5 of the completion report for the full analysis.
-- ---------------------------------------------------------------------

insert into public.organization_managers (
  id, organization_id, user_id, role, granted_at, granted_by
)
select id, organization_id, user_id, role, created_at, null
from public.organization_members
on conflict (organization_id, user_id) do nothing;

-- ---------------------------------------------------------------------
-- 6. Dual-write during the transition window.
--
-- The one existing code path that CREATES a management grant
-- (create_organization_application_draft, run when a user starts a new
-- organisation) now writes to both tables in the same transaction.
-- organization_members keeps working exactly as before (nothing reads it
-- differently); organization_managers becomes populated for every new
-- organisation going forward without waiting for a later cutover.
-- Behaviourally and functionally identical to the 20260821000000
-- version otherwise — only the extra insert is new.
-- ---------------------------------------------------------------------

create or replace function public.create_organization_application_draft(
  initial_category public.organization_category default null
)
returns public.organization_applications
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  new_organization_id uuid;
  new_application public.organization_applications;
  profile_record public.profiles;
  auth_email text;
  make_primary boolean;
begin
  if current_user_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(current_user_id::text, 0)
  );

  select application.* into new_application
  from public.organization_applications as application
  join public.organization_members as membership
    on membership.organization_id = application.organization_id
  where membership.user_id = current_user_id
    and membership.is_primary
  order by application.created_at desc
  limit 1;

  if new_application.id is not null then
    return new_application;
  end if;

  select * into profile_record
  from public.profiles
  where id = current_user_id;

  select email into auth_email
  from auth.users
  where id = current_user_id;

  select not exists (
    select 1 from public.organization_members
    where user_id = current_user_id and is_primary
  ) into make_primary;

  insert into public.organizations (category)
  values (initial_category)
  returning id into new_organization_id;

  insert into public.organization_members (
    organization_id,
    user_id,
    role,
    is_primary
  ) values (
    new_organization_id,
    current_user_id,
    'owner',
    make_primary
  );

  insert into public.organization_managers (
    organization_id,
    user_id,
    role,
    granted_by
  ) values (
    new_organization_id,
    current_user_id,
    'owner',
    current_user_id
  )
  on conflict (organization_id, user_id) do nothing;

  insert into public.organization_applications (
    organization_id,
    submitted_by,
    representative_full_name,
    representative_email,
    representative_phone
  ) values (
    new_organization_id,
    current_user_id,
    coalesce(profile_record.full_name, ''),
    coalesce(auth_email, ''),
    coalesce(profile_record.phone, '')
  ) returning * into new_application;

  insert into public.application_review_history (
    application_id,
    actor_user_id,
    previous_status,
    new_status
  ) values (
    new_application.id,
    current_user_id,
    null,
    'draft'
  );

  return new_application;
end;
$$;

-- ---------------------------------------------------------------------
-- 7. Canonical management helpers — updated in place to recognize BOTH
-- tables during the transition (section 11 of the brief: introduce,
-- backfill, update the canonical helper(s), preserve compatibility,
-- prove existing runtime works, only deprecate old usage later). Every
-- existing caller (RLS policies, other functions) keeps calling these by
-- the same name/signature, so no policy needs to change in this
-- migration — only what the helper itself considers.
-- ---------------------------------------------------------------------

create or replace function public.is_organization_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_managers
    where organization_id = target_organization_id
      and user_id = (select auth.uid())
  ) or exists (
    select 1
    from public.organization_members
    where organization_id = target_organization_id
      and user_id = (select auth.uid())
  );
$$;

create or replace function public.can_manage_organization(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_managers
    where organization_id = target_organization_id
      and user_id = (select auth.uid())
      and role in ('owner', 'admin')
  ) or exists (
    select 1
    from public.organization_members
    where organization_id = target_organization_id
      and user_id = (select auth.uid())
      and role in ('owner', 'admin')
  );
$$;

create function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = (select auth.uid())
      and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------
-- 8. Membership eligibility.
--
-- "registration_status = verified" from the product brief maps onto the
-- real schema as organization_applications.status = 'verified' — the
-- organizations.registration_status column is a different concept (legal
-- registered/informal status) with no 'verified' value in its own enum.
-- An organisation is eligible for ordinary public membership requests
-- only once its application has actually passed review.
-- ---------------------------------------------------------------------

create function public.is_organization_membership_eligible(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_applications
    where organization_id = target_organization_id
      and status = 'verified'
  );
$$;

-- Narrow, safe-projection lookup for a future "search organisations to
-- join" screen: only identity fields needed to pick an organisation, for
-- ANY eligible (verified) organisation regardless of the caller's own
-- membership/management relationship to it — deliberately not extending
-- the base `organizations` table's RLS (which stays scoped to members/
-- reviewers) to avoid widening exposure of contact/registration detail
-- columns that a public member-search has no reason to see.
create function public.list_membership_eligible_organizations()
returns table (
  id uuid,
  name text,
  category public.organization_category,
  city text,
  region text,
  country text
)
language sql
stable
security definer
set search_path = ''
as $$
  select o.id, o.name, o.category, o.city, o.region, o.country
  from public.organizations o
  where exists (
    select 1
    from public.organization_applications a
    where a.organization_id = o.id
      and a.status = 'verified'
  )
  order by o.name;
$$;

-- ---------------------------------------------------------------------
-- 9. Membership lifecycle RPCs.
--
-- Four small, single-purpose functions rather than one generic
-- status-update endpoint. Every privileged field (status transitions,
-- decided_at/decided_by, invited_by) is set exclusively by these
-- functions from server-evaluated values (auth.uid(), now()) — never
-- accepted as a caller-supplied argument — so the self-request rules in
-- section 9 of the brief hold structurally, not just by convention.
-- ---------------------------------------------------------------------

create function public.request_organization_membership(
  target_organization_id uuid,
  requested_membership_type public.organization_membership_type default null
)
returns public.organization_memberships
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
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

  insert into public.organization_memberships (
    organization_id, user_id, status, membership_type, requested_at
  ) values (
    target_organization_id, current_user_id, 'pending',
    requested_membership_type, now()
  ) returning * into new_membership;

  insert into public.organization_membership_history (
    membership_id, actor_user_id, previous_status, new_status
  ) values (
    new_membership.id, current_user_id, null, 'pending'
  );

  return new_membership;
end;
$$;

create function public.invite_organization_member(
  target_organization_id uuid,
  target_user_id uuid,
  invited_membership_type public.organization_membership_type default null
)
returns public.organization_memberships
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
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

  if not exists (select 1 from auth.users where id = target_user_id) then
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
    organization_id, user_id, status, membership_type, invited_at, invited_by
  ) values (
    target_organization_id, target_user_id, 'pending',
    invited_membership_type, now(), current_user_id
  ) returning * into new_membership;

  insert into public.organization_membership_history (
    membership_id, actor_user_id, previous_status, new_status
  ) values (
    new_membership.id, current_user_id, null, 'pending'
  );

  return new_membership;
end;
$$;

create function public.decide_organization_membership(
  target_membership_id uuid,
  target_status public.organization_membership_status,
  decision_note text default null
)
returns public.organization_memberships
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  membership_record public.organization_memberships;
  updated_membership public.organization_memberships;
begin
  if current_user_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  if target_status not in ('approved', 'rejected') then
    raise exception 'Unsupported membership decision.' using errcode = '22023';
  end if;

  select * into membership_record
  from public.organization_memberships
  where id = target_membership_id
  for update;

  if membership_record.id is null then
    raise exception 'Membership request not found.' using errcode = 'P0002';
  end if;

  if not public.can_manage_organization(membership_record.organization_id)
    and not public.is_platform_admin() then
    raise exception 'You cannot decide this membership request.'
      using errcode = '42501';
  end if;

  if membership_record.status <> 'pending' then
    raise exception 'Only a pending membership request can be decided.'
      using errcode = '22023';
  end if;

  update public.organization_memberships
  set status = target_status,
      decided_at = now(),
      decided_by = current_user_id
  where id = target_membership_id
  returning * into updated_membership;

  insert into public.organization_membership_history (
    membership_id, actor_user_id, previous_status, new_status, note
  ) values (
    target_membership_id, current_user_id, membership_record.status,
    target_status, nullif(btrim(decision_note), '')
  );

  return updated_membership;
end;
$$;

create function public.revoke_organization_membership(
  target_membership_id uuid,
  decision_note text default null
)
returns public.organization_memberships
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  membership_record public.organization_memberships;
  updated_membership public.organization_memberships;
begin
  if current_user_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  select * into membership_record
  from public.organization_memberships
  where id = target_membership_id
  for update;

  if membership_record.id is null then
    raise exception 'Membership request not found.' using errcode = 'P0002';
  end if;

  if not public.can_manage_organization(membership_record.organization_id)
    and not public.is_platform_admin() then
    raise exception 'You cannot revoke this membership.' using errcode = '42501';
  end if;

  if membership_record.status <> 'approved' then
    raise exception 'Only an approved membership can be revoked.'
      using errcode = '22023';
  end if;

  update public.organization_memberships
  set status = 'revoked',
      decided_at = now(),
      decided_by = current_user_id
  where id = target_membership_id
  returning * into updated_membership;

  insert into public.organization_membership_history (
    membership_id, actor_user_id, previous_status, new_status, note
  ) values (
    target_membership_id, current_user_id, membership_record.status,
    'revoked', nullif(btrim(decision_note), '')
  );

  return updated_membership;
end;
$$;

-- ---------------------------------------------------------------------
-- 10. Row-level security.
-- ---------------------------------------------------------------------

alter table public.organization_managers enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.organization_membership_history enable row level security;

create policy organization_managers_select_relevant_or_reviewer
on public.organization_managers for select
to authenticated
using (
  user_id = (select auth.uid())
  or public.can_manage_organization(organization_id)
  or public.is_application_reviewer()
);

create policy organization_memberships_select_own_manager_or_reviewer
on public.organization_memberships for select
to authenticated
using (
  user_id = (select auth.uid())
  or public.can_manage_organization(organization_id)
  or public.is_application_reviewer()
);

create policy organization_membership_history_select_relevant_or_reviewer
on public.organization_membership_history for select
to authenticated
using (
  exists (
    select 1
    from public.organization_memberships as membership
    where membership.id = organization_membership_history.membership_id
      and (
        membership.user_id = (select auth.uid())
        or public.can_manage_organization(membership.organization_id)
      )
  )
  or public.is_application_reviewer()
);

-- Additive: an organisation manager needs to see the (already narrow)
-- profile fields of someone with a real membership relationship to their
-- organisation. Postgres combines multiple permissive policies for the
-- same command with OR, so this extends profiles' existing visibility
-- rules without touching profiles_select_own_or_application_reviewer.
create policy profiles_select_organization_manager_for_member
on public.profiles for select
to authenticated
using (
  exists (
    select 1
    from public.organization_memberships as membership
    where membership.user_id = profiles.id
      and public.can_manage_organization(membership.organization_id)
  )
);

-- No insert/update/delete policies are defined for any of the three new
-- tables: combined with the revokes/grants below (select-only to
-- authenticated), every mutation is forced through the narrow RPCs
-- above. This is a stronger guarantee than a permissive write policy —
-- "ordinary users cannot insert themselves / change role / approve
-- themselves" holds because no such grant exists, not only because a
-- policy's WHERE clause says so.

revoke all on table public.organization_managers from anon, authenticated;
revoke all on table public.organization_memberships from anon, authenticated;
revoke all on table public.organization_membership_history from anon, authenticated;

grant select on table public.organization_managers to authenticated;
grant select on table public.organization_memberships to authenticated;
grant select on table public.organization_membership_history to authenticated;

-- Trusted server processes (mirrors the existing organization_members/
-- organizations/user_roles service_role grants).
grant select, insert, update, delete on table public.organization_managers to service_role;
grant select, insert, update, delete on table public.organization_memberships to service_role;
grant select, insert, update, delete on table public.organization_membership_history to service_role;

-- organization_applications itself was never granted to service_role by
-- the original migration (every prior write path went through a
-- SECURITY DEFINER function instead). Trusted server-side tooling
-- legitimately needs to write it directly sometimes (e.g. fixture setup
-- for automated tests, or a future admin backoffice) — this is additive
-- and, like the other service_role grants above, never reachable from a
-- browser session.
grant insert, update on table public.organization_applications to service_role;

revoke all on function public.protect_last_organization_owner() from public, anon, authenticated;
revoke all on function public.is_organization_membership_eligible(uuid) from public, anon;
revoke all on function public.list_membership_eligible_organizations() from public, anon;
revoke all on function public.is_platform_admin() from public, anon;
revoke all on function public.request_organization_membership(uuid, public.organization_membership_type) from public, anon;
revoke all on function public.invite_organization_member(uuid, uuid, public.organization_membership_type) from public, anon;
revoke all on function public.decide_organization_membership(uuid, public.organization_membership_status, text) from public, anon;
revoke all on function public.revoke_organization_membership(uuid, text) from public, anon;

grant execute on function public.is_organization_membership_eligible(uuid) to authenticated;
grant execute on function public.list_membership_eligible_organizations() to authenticated;
grant execute on function public.is_platform_admin() to authenticated;
grant execute on function public.request_organization_membership(uuid, public.organization_membership_type) to authenticated;
grant execute on function public.invite_organization_member(uuid, uuid, public.organization_membership_type) to authenticated;
grant execute on function public.decide_organization_membership(uuid, public.organization_membership_status, text) to authenticated;
grant execute on function public.revoke_organization_membership(uuid, text) to authenticated;
