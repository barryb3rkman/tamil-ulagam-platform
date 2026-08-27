-- Phase G1: Organisation & Tamil Sangam MANAGEMENT administration.
--
-- Completes the management lifecycle A1 laid the groundwork for:
-- invite/accept/decline a co-manager, change a manager's role, remove a
-- manager, leave management, and transfer ownership — all backed by
-- organization_managers (the canonical V3 management-grant table), with
-- a dedicated invitation table and an immutable audit history table.
--
-- Deliberately untouched: organization_memberships (ordinary
-- affiliation/belonging) and its RPCs. A person's Membership status is
-- never read, written, or implied by anything in this migration.
--
-- One real legacy-compatibility concern this migration DOES address:
-- can_manage_organization() (Aug 25) grants access via EITHER
-- organization_managers OR the historical organization_members table.
-- organization_members only ever holds one row per organisation — the
-- original registrant, role='owner' — inserted exclusively by
-- create_organization_application_draft (Aug 21/25) and the Sangam
-- equivalent (Aug 26). No other code path writes to it, so:
--   - inviting/accepting a new Admin or Representative NEVER touches
--     organization_members (they never had a row there to begin with).
--   - role-changing or removing a non-owner manager NEVER touches it
--     either, for the same reason.
--   - ownership TRANSFER is the one operation that must keep it in
--     sync: leaving the previous owner's organization_members row
--     stale would let them retain can_manage_organization() = true
--     forever via its legacy OR-branch, even after being demoted or
--     removed from organization_managers — a real authorization leak,
--     not just a UI-staleness issue. transfer_organization_ownership
--     below dual-writes both tables atomically.

-- ---------------------------------------------------------------------
-- 1. New enums
-- ---------------------------------------------------------------------

create type public.organization_manager_invitation_status as enum (
  'pending',
  'accepted',
  'declined',
  'expired',
  'revoked'
);

create type public.organization_manager_history_event as enum (
  'invited',
  'invitation_accepted',
  'invitation_declined',
  'invitation_revoked',
  'role_changed',
  'manager_removed',
  'manager_left',
  'ownership_transferred'
);

-- ---------------------------------------------------------------------
-- 2. organization_manager_invitations
--
-- Invitation role is deliberately constrained to admin/representative —
-- ownership only ever moves through transfer_organization_ownership,
-- never through an invitation (brief section 14/23). At most one
-- PENDING invitation may exist per (organization, normalized email) —
-- enforced by a partial unique index rather than application logic
-- alone, so a duplicate-invite race can't slip through.
-- ---------------------------------------------------------------------

create table public.organization_manager_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  email text not null,
  role public.organization_membership_role not null,
  status public.organization_manager_invitation_status not null default 'pending',
  invited_by uuid references auth.users (id) on delete set null,
  invited_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '14 days'),
  accepted_by uuid references auth.users (id) on delete set null,
  accepted_at timestamptz,
  declined_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organization_manager_invitations_email_length
    check (char_length(email) between 3 and 320),
  constraint organization_manager_invitations_email_format
    check (email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  constraint organization_manager_invitations_role_not_owner
    check (role in ('admin', 'representative'))
);

create unique index organization_manager_invitations_one_pending_idx
  on public.organization_manager_invitations (organization_id, lower(email))
  where status = 'pending';

create index organization_manager_invitations_org_idx
  on public.organization_manager_invitations (organization_id, created_at desc);

create index organization_manager_invitations_email_idx
  on public.organization_manager_invitations (lower(email), status);

create trigger organization_manager_invitations_set_updated_at
before update on public.organization_manager_invitations
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 3. organization_manager_history — immutable audit trail.
-- manager_user_id is nullable: an 'invited'/'invitation_declined'/
-- 'invitation_revoked' event describes an invitation, not yet (or
-- never) an actual manager row, so there may be no manager_user_id to
-- record beyond the invitation's own target email (kept on the
-- invitation row itself, not duplicated here).
-- ---------------------------------------------------------------------

create table public.organization_manager_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  manager_user_id uuid references auth.users (id) on delete set null,
  actor_user_id uuid references auth.users (id) on delete set null,
  event_type public.organization_manager_history_event not null,
  previous_role public.organization_membership_role,
  new_role public.organization_membership_role,
  invitation_id uuid references public.organization_manager_invitations (id) on delete set null,
  note text,
  created_at timestamptz not null default now(),
  constraint organization_manager_history_note_length
    check (note is null or char_length(note) <= 2000)
);

create index organization_manager_history_org_idx
  on public.organization_manager_history (organization_id, created_at desc);

-- ---------------------------------------------------------------------
-- 4. RLS — select-only to authenticated (mirrors the Aug 25 pattern:
-- every mutation forced through a narrow RPC, never a direct grant).
-- ---------------------------------------------------------------------

alter table public.organization_manager_invitations enable row level security;
alter table public.organization_manager_history enable row level security;

-- Any active manager (owner/admin/representative) of the organisation
-- may see its pending invitations (brief section 12/13: pending
-- invitations are part of the "who administers this org" picture every
-- manager should see) or the organisation's own history, plus a
-- Federation Admin for operational visibility (read-only — see
-- get_federation_capabilities from Phase F1). A recipient's OWN
-- invitations are deliberately NOT exposed through this policy —
-- list_my_management_invitations() is a SECURITY DEFINER function that
-- reads the table directly (bypassing RLS, like every other narrow RPC
-- in this migration) rather than relying on a JWT-email RLS branch, so
-- there is exactly one code path that can bind "my account" to "my
-- invitations", not two.
create policy organization_manager_invitations_select_relevant
on public.organization_manager_invitations for select
to authenticated
using (
  public.can_manage_organization(organization_id)
  or exists (
    select 1
    from public.organization_managers as manager
    where manager.organization_id = organization_manager_invitations.organization_id
      and manager.user_id = (select auth.uid())
  )
  or public.is_platform_admin()
);

create policy organization_manager_history_select_relevant
on public.organization_manager_history for select
to authenticated
using (
  public.can_manage_organization(organization_id)
  or exists (
    select 1
    from public.organization_managers as manager
    where manager.organization_id = organization_manager_history.organization_id
      and manager.user_id = (select auth.uid())
  )
  or public.is_platform_admin()
);

revoke all on table public.organization_manager_invitations from anon, authenticated;
revoke all on table public.organization_manager_history from anon, authenticated;
grant select on table public.organization_manager_invitations to authenticated;
grant select on table public.organization_manager_history to authenticated;
grant select, insert, update, delete on table public.organization_manager_invitations to service_role;
grant select, insert, update, delete on table public.organization_manager_history to service_role;

-- ---------------------------------------------------------------------
-- 5. Co-manager profile visibility (brief section 31) — a narrow,
-- explicit projection (id + full_name only) via SECURITY DEFINER
-- functions rather than a broad profiles RLS policy, so phone/country/
-- account email are never exposed to a co-manager regardless of what a
-- future direct-select caller might request. Both the manager list and
-- the pending-invitation list already return everything a caller needs
-- (invitation email is the invitation's own column, not a profile
-- read) — this section only backs list_organization_managers below.
-- ---------------------------------------------------------------------

create function public.list_organization_managers(target_organization_id uuid)
returns table (
  id uuid,
  organization_id uuid,
  user_id uuid,
  role public.organization_membership_role,
  granted_at timestamptz,
  granted_by uuid,
  full_name text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not (
    public.can_manage_organization(target_organization_id)
    or exists (
      select 1 from public.organization_managers as own_grant
      where own_grant.organization_id = target_organization_id
        and own_grant.user_id = (select auth.uid())
    )
    or public.is_platform_admin()
  ) then
    raise exception 'You cannot view this organisation''s managers.'
      using errcode = '42501';
  end if;

  return query
  select manager.id, manager.organization_id, manager.user_id,
    manager.role, manager.granted_at, manager.granted_by,
    coalesce(profile.full_name, '')
  from public.organization_managers manager
  left join public.profiles profile on profile.id = manager.user_id
  where manager.organization_id = target_organization_id
  order by
    case manager.role when 'owner' then 1 when 'admin' then 2 else 3 end,
    profile.full_name;
end;
$$;

revoke all on function public.list_organization_managers(uuid) from public, anon;
grant execute on function public.list_organization_managers(uuid) to authenticated;

-- Pending invitations for an organisation's own Managers tab (brief
-- section 13: shown separately from active managers, never merged as
-- if they already grant permission). Gated identically to
-- list_organization_managers — any active manager may see who has been
-- invited, not only the owner who sent the invite.
create function public.list_organization_manager_invitations(target_organization_id uuid)
returns setof public.organization_manager_invitations
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not (
    public.can_manage_organization(target_organization_id)
    or exists (
      select 1 from public.organization_managers as own_grant
      where own_grant.organization_id = target_organization_id
        and own_grant.user_id = (select auth.uid())
    )
    or public.is_platform_admin()
  ) then
    raise exception 'You cannot view this organisation''s invitations.'
      using errcode = '42501';
  end if;

  return query
  select invitation.*
  from public.organization_manager_invitations invitation
  where invitation.organization_id = target_organization_id
  order by invitation.invited_at desc;
end;
$$;

revoke all on function public.list_organization_manager_invitations(uuid) from public, anon;
grant execute on function public.list_organization_manager_invitations(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- 6. invite_organization_manager
--
-- Owner-only in G1 (brief section 6: admin/representative get read-only
-- manager administration for now — no strong product reason yet to let
-- Admin invite other managers). Rejects: caller not owner, target
-- already an active manager, an existing pending invitation for the
-- same normalized email, inviting the caller's own email.
-- ---------------------------------------------------------------------

create function public.invite_organization_manager(
  target_organization_id uuid,
  invitee_email text,
  invitee_role public.organization_membership_role
)
returns public.organization_manager_invitations
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  caller_role public.organization_membership_role;
  current_email text;
  normalized_email text := lower(btrim(coalesce(invitee_email, '')));
  new_invitation public.organization_manager_invitations;
begin
  if current_user_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  select role into caller_role
  from public.organization_managers
  where organization_id = target_organization_id and user_id = current_user_id;

  if caller_role is distinct from 'owner' then
    raise exception 'Only the owner can invite a manager.' using errcode = '42501';
  end if;

  if invitee_role not in ('admin', 'representative') then
    raise exception 'Invite a manager as Admin or Representative — ownership only moves through Transfer ownership.'
      using errcode = '22023';
  end if;

  if char_length(normalized_email) < 3
    or normalized_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'Enter a valid email address.' using errcode = '22023';
  end if;

  select lower(btrim(email)) into current_email
  from auth.users where id = current_user_id;

  if current_email = normalized_email then
    raise exception 'You cannot invite your own email.' using errcode = '22023';
  end if;

  if exists (
    select 1
    from public.organization_managers manager
    join auth.users account on account.id = manager.user_id
    where manager.organization_id = target_organization_id
      and lower(btrim(account.email)) = normalized_email
  ) then
    raise exception 'This person already manages this organisation.'
      using errcode = '22023';
  end if;

  if exists (
    select 1 from public.organization_manager_invitations
    where organization_id = target_organization_id
      and lower(email) = normalized_email
      and status = 'pending'
  ) then
    raise exception 'A pending invitation already exists for this email.'
      using errcode = '22023';
  end if;

  insert into public.organization_manager_invitations (
    organization_id, email, role, invited_by
  ) values (
    target_organization_id, normalized_email, invitee_role, current_user_id
  )
  returning * into new_invitation;

  insert into public.organization_manager_history (
    organization_id, actor_user_id, event_type, new_role, invitation_id, note
  ) values (
    target_organization_id, current_user_id, 'invited', invitee_role,
    new_invitation.id, 'Invitation sent to ' || normalized_email
  );

  return new_invitation;
end;
$$;

revoke all on function public.invite_organization_manager(uuid, text, public.organization_membership_role) from public, anon;
grant execute on function public.invite_organization_manager(uuid, text, public.organization_membership_role) to authenticated;

-- ---------------------------------------------------------------------
-- 7. revoke_organization_manager_invitation — owner-only.
-- ---------------------------------------------------------------------

create function public.revoke_organization_manager_invitation(target_invitation_id uuid)
returns public.organization_manager_invitations
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  invitation_record public.organization_manager_invitations;
  updated_invitation public.organization_manager_invitations;
  caller_role public.organization_membership_role;
begin
  if current_user_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  select * into invitation_record
  from public.organization_manager_invitations
  where id = target_invitation_id
  for update;

  if invitation_record.id is null then
    raise exception 'Invitation not found.' using errcode = 'P0002';
  end if;

  select role into caller_role
  from public.organization_managers
  where organization_id = invitation_record.organization_id and user_id = current_user_id;

  if caller_role is distinct from 'owner' then
    raise exception 'Only the owner can revoke an invitation.' using errcode = '42501';
  end if;

  if invitation_record.status <> 'pending' then
    raise exception 'Only a pending invitation can be revoked.' using errcode = '22023';
  end if;

  update public.organization_manager_invitations
  set status = 'revoked', revoked_at = now()
  where id = target_invitation_id
  returning * into updated_invitation;

  insert into public.organization_manager_history (
    organization_id, actor_user_id, event_type, previous_role, invitation_id
  ) values (
    invitation_record.organization_id, current_user_id, 'invitation_revoked',
    invitation_record.role, target_invitation_id
  );

  return updated_invitation;
end;
$$;

revoke all on function public.revoke_organization_manager_invitation(uuid) from public, anon;
grant execute on function public.revoke_organization_manager_invitation(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- 8. list_my_management_invitations — the recipient's own pending
-- invitations, matched by normalized account email. Includes the
-- organisation's name/kind so the recipient screen needs no second
-- round trip.
-- ---------------------------------------------------------------------

create function public.list_my_management_invitations()
returns table (
  id uuid,
  organization_id uuid,
  organization_name text,
  organization_kind text,
  role public.organization_membership_role,
  status public.organization_manager_invitation_status,
  invited_by uuid,
  inviter_name text,
  invited_at timestamptz,
  expires_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  current_email text;
begin
  if current_user_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  select lower(btrim(account.email)) into current_email
  from auth.users as account where account.id = current_user_id;

  return query
  select
    invitation.id, invitation.organization_id, organization.name,
    case
      when organization.category = 'tamil_community'
        and lower(btrim(coalesce(community.subtype, ''))) = 'tamil sangam'
        then 'sangam'
      else 'organisation'
    end,
    invitation.role, invitation.status, invitation.invited_by,
    coalesce(inviter.full_name, ''), invitation.invited_at, invitation.expires_at
  from public.organization_manager_invitations invitation
  join public.organizations organization on organization.id = invitation.organization_id
  left join public.organization_tamil_community_details community
    on community.organization_id = organization.id
  left join public.profiles inviter on inviter.id = invitation.invited_by
  where lower(invitation.email) = current_email
    and invitation.status = 'pending'
  order by invitation.invited_at desc;
end;
$$;

revoke all on function public.list_my_management_invitations() from public, anon;
grant execute on function public.list_my_management_invitations() to authenticated;

-- ---------------------------------------------------------------------
-- 9. accept_organization_manager_invitation
--
-- Identity binding is the security-critical part (brief section 11):
-- only the authenticated account whose OWN email matches the
-- invitation's normalized email may accept it — never inferred from a
-- URL parameter alone. On success: organization_managers row created,
-- invitation marked accepted, history written. No organization_memberships
-- row is ever created here (brief section 16 — manager acceptance must
-- never imply Member affiliation).
-- ---------------------------------------------------------------------

create function public.accept_organization_manager_invitation(target_invitation_id uuid)
returns public.organization_managers
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  current_email text;
  invitation_record public.organization_manager_invitations;
  new_manager public.organization_managers;
begin
  if current_user_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  select lower(btrim(email)) into current_email
  from auth.users where id = current_user_id;

  select * into invitation_record
  from public.organization_manager_invitations
  where id = target_invitation_id
  for update;

  if invitation_record.id is null then
    raise exception 'Invitation not found.' using errcode = 'P0002';
  end if;

  if lower(invitation_record.email) <> current_email then
    raise exception 'This invitation was sent to a different email address.'
      using errcode = '42501';
  end if;

  if invitation_record.status = 'expired' or
    (invitation_record.status = 'pending' and invitation_record.expires_at < now())
  then
    update public.organization_manager_invitations
    set status = 'expired'
    where id = target_invitation_id;
    raise exception 'This invitation has expired.' using errcode = '22023';
  end if;

  if invitation_record.status <> 'pending' then
    raise exception 'This invitation is no longer available.' using errcode = '22023';
  end if;

  if exists (
    select 1 from public.organization_managers as existing_grant
    where existing_grant.organization_id = invitation_record.organization_id
      and existing_grant.user_id = current_user_id
  ) then
    raise exception 'You already manage this organisation.' using errcode = '22023';
  end if;

  insert into public.organization_managers (
    organization_id, user_id, role, granted_by
  ) values (
    invitation_record.organization_id, current_user_id, invitation_record.role,
    invitation_record.invited_by
  )
  returning * into new_manager;

  update public.organization_manager_invitations
  set status = 'accepted', accepted_by = current_user_id, accepted_at = now()
  where id = target_invitation_id;

  insert into public.organization_manager_history (
    organization_id, manager_user_id, actor_user_id, event_type, new_role, invitation_id
  ) values (
    invitation_record.organization_id, current_user_id, current_user_id,
    'invitation_accepted', invitation_record.role, target_invitation_id
  );

  return new_manager;
end;
$$;

revoke all on function public.accept_organization_manager_invitation(uuid) from public, anon;
grant execute on function public.accept_organization_manager_invitation(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- 10. decline_organization_manager_invitation — same identity binding
-- as accept; the invitation row is never deleted (brief section 17).
-- ---------------------------------------------------------------------

create function public.decline_organization_manager_invitation(target_invitation_id uuid)
returns public.organization_manager_invitations
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  current_email text;
  invitation_record public.organization_manager_invitations;
  updated_invitation public.organization_manager_invitations;
begin
  if current_user_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  select lower(btrim(email)) into current_email
  from auth.users where id = current_user_id;

  select * into invitation_record
  from public.organization_manager_invitations
  where id = target_invitation_id
  for update;

  if invitation_record.id is null then
    raise exception 'Invitation not found.' using errcode = 'P0002';
  end if;

  if lower(invitation_record.email) <> current_email then
    raise exception 'This invitation was sent to a different email address.'
      using errcode = '42501';
  end if;

  if invitation_record.status <> 'pending' then
    raise exception 'This invitation is no longer available.' using errcode = '22023';
  end if;

  update public.organization_manager_invitations
  set status = 'declined', declined_at = now()
  where id = target_invitation_id
  returning * into updated_invitation;

  insert into public.organization_manager_history (
    organization_id, actor_user_id, event_type, previous_role, invitation_id
  ) values (
    invitation_record.organization_id, current_user_id, 'invitation_declined',
    invitation_record.role, target_invitation_id
  );

  return updated_invitation;
end;
$$;

revoke all on function public.decline_organization_manager_invitation(uuid) from public, anon;
grant execute on function public.decline_organization_manager_invitation(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- 11. change_organization_manager_role — owner-only; target must
-- currently be admin or representative (never owner — that path is
-- transfer_organization_ownership only), new_role likewise restricted.
-- ---------------------------------------------------------------------

create function public.change_organization_manager_role(
  target_organization_id uuid,
  target_user_id uuid,
  new_role public.organization_membership_role
)
returns public.organization_managers
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  caller_role public.organization_membership_role;
  target_record public.organization_managers;
  updated_manager public.organization_managers;
begin
  if current_user_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  select role into caller_role
  from public.organization_managers
  where organization_id = target_organization_id and user_id = current_user_id;

  if caller_role is distinct from 'owner' then
    raise exception 'Only the owner can change a manager''s role.' using errcode = '42501';
  end if;

  if new_role not in ('admin', 'representative') then
    raise exception 'A role can only be changed to Admin or Representative here — ownership only moves through Transfer ownership.'
      using errcode = '22023';
  end if;

  select * into target_record
  from public.organization_managers
  where organization_id = target_organization_id and user_id = target_user_id
  for update;

  if target_record.id is null then
    raise exception 'That manager no longer manages this organisation.'
      using errcode = 'P0002';
  end if;

  if target_record.role = 'owner' then
    raise exception 'The owner''s role can only change through Transfer ownership.'
      using errcode = '22023';
  end if;

  if target_record.role = new_role then
    return target_record;
  end if;

  update public.organization_managers
  set role = new_role
  where organization_id = target_organization_id and user_id = target_user_id
  returning * into updated_manager;

  insert into public.organization_manager_history (
    organization_id, manager_user_id, actor_user_id, event_type,
    previous_role, new_role
  ) values (
    target_organization_id, target_user_id, current_user_id, 'role_changed',
    target_record.role, new_role
  );

  return updated_manager;
end;
$$;

revoke all on function public.change_organization_manager_role(uuid, uuid, public.organization_membership_role) from public, anon;
grant execute on function public.change_organization_manager_role(uuid, uuid, public.organization_membership_role) to authenticated;

-- ---------------------------------------------------------------------
-- 12. remove_organization_manager — owner-only; target must not be the
-- owner (protect_last_organization_owner from Phase A1 already enforces
-- this at the data layer as defense-in-depth even if this check were
-- ever bypassed). Never touches organization_memberships or
-- organization_members — a removed manager who is separately an
-- approved Member stays a Member (brief section 20).
-- ---------------------------------------------------------------------

create function public.remove_organization_manager(
  target_organization_id uuid,
  target_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  caller_role public.organization_membership_role;
  target_record public.organization_managers;
begin
  if current_user_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  select role into caller_role
  from public.organization_managers
  where organization_id = target_organization_id and user_id = current_user_id;

  if caller_role is distinct from 'owner' then
    raise exception 'Only the owner can remove a manager.' using errcode = '42501';
  end if;

  select * into target_record
  from public.organization_managers
  where organization_id = target_organization_id and user_id = target_user_id
  for update;

  if target_record.id is null then
    raise exception 'That manager no longer manages this organisation.'
      using errcode = 'P0002';
  end if;

  if target_record.role = 'owner' then
    raise exception 'The owner cannot be removed this way — transfer ownership first.'
      using errcode = '22023';
  end if;

  delete from public.organization_managers
  where organization_id = target_organization_id and user_id = target_user_id;

  insert into public.organization_manager_history (
    organization_id, manager_user_id, actor_user_id, event_type, previous_role
  ) values (
    target_organization_id, target_user_id, current_user_id, 'manager_removed',
    target_record.role
  );
end;
$$;

revoke all on function public.remove_organization_manager(uuid, uuid) from public, anon;
grant execute on function public.remove_organization_manager(uuid, uuid) to authenticated;

-- ---------------------------------------------------------------------
-- 13. leave_organization_management — self-service; the owner invariant
-- trigger rejects this outright if the caller is the sole owner, but the
-- explicit check below gives a clear, actionable error message instead
-- of a raw constraint failure. Only removes the caller's OWN management
-- grant — never touches their ordinary Membership.
-- ---------------------------------------------------------------------

create function public.leave_organization_management(target_organization_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  current_record public.organization_managers;
begin
  if current_user_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  select * into current_record
  from public.organization_managers
  where organization_id = target_organization_id and user_id = current_user_id
  for update;

  if current_record.id is null then
    raise exception 'You do not manage this organisation.' using errcode = 'P0002';
  end if;

  if current_record.role = 'owner' then
    raise exception 'The owner must transfer ownership before leaving management.'
      using errcode = '22023';
  end if;

  delete from public.organization_managers
  where organization_id = target_organization_id and user_id = current_user_id;

  insert into public.organization_manager_history (
    organization_id, manager_user_id, actor_user_id, event_type, previous_role
  ) values (
    target_organization_id, current_user_id, current_user_id, 'manager_left',
    current_record.role
  );
end;
$$;

revoke all on function public.leave_organization_management(uuid) from public, anon;
grant execute on function public.leave_organization_management(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- 14. transfer_organization_ownership
--
-- The one high-risk, atomic operation. Target must already be an ACTIVE
-- manager (admin or representative) of the SAME organisation — never an
-- email invitation (brief section 23). previous_owner_new_role is an
-- explicit caller choice: 'admin', 'representative', or 'leave' (brief
-- section 22 — never implicit).
--
-- Ordering matters for protect_last_organization_owner (Phase A1): the
-- TARGET is promoted to owner FIRST (an update whose new.role = 'owner'
-- always passes that trigger, no count check needed), THEN the previous
-- owner is demoted/removed (now correctly counted against the
-- newly-promoted owner, never transiently zero). Both rows are locked
-- with `for update` up front so two concurrent transfer attempts can't
-- interleave.
--
-- organization_members compatibility write: see this migration's own
-- header comment for why this is the one operation that must dual-write
-- it. The previous owner's row is deleted (if they leave) or updated to
-- their new role; the new owner's row is inserted only if they don't
-- already have one for this organisation, deliberately not forcing
-- is_primary (a personal workspace-default preference, not this RPC's
-- business — defaults to true only if the new owner has no existing
-- primary anywhere, mirroring create_organization_application_draft's
-- own make_primary logic).
-- ---------------------------------------------------------------------

create function public.transfer_organization_ownership(
  target_organization_id uuid,
  target_user_id uuid,
  previous_owner_new_role text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  owner_record public.organization_managers;
  target_record public.organization_managers;
  target_has_primary boolean;
begin
  if current_user_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  if previous_owner_new_role not in ('admin', 'representative', 'leave') then
    raise exception 'Choose what happens to the current owner: Admin, Representative, or Leave.'
      using errcode = '22023';
  end if;

  if target_user_id = current_user_id then
    raise exception 'Choose a different manager to become the new owner.'
      using errcode = '22023';
  end if;

  select * into owner_record
  from public.organization_managers
  where organization_id = target_organization_id and user_id = current_user_id
  for update;

  if owner_record.id is null or owner_record.role <> 'owner' then
    raise exception 'Only the current owner can transfer ownership.'
      using errcode = '42501';
  end if;

  select * into target_record
  from public.organization_managers
  where organization_id = target_organization_id and user_id = target_user_id
  for update;

  if target_record.id is null then
    raise exception 'The new owner must already be an active manager of this organisation — invite them first.'
      using errcode = '22023';
  end if;

  if target_record.role = 'owner' then
    raise exception 'This manager is already the owner.' using errcode = '22023';
  end if;

  -- Step 1: promote target to owner (always legal — new.role = 'owner').
  update public.organization_managers
  set role = 'owner'
  where organization_id = target_organization_id and user_id = target_user_id;

  -- Step 2: resolve the previous owner (demote or remove).
  if previous_owner_new_role = 'leave' then
    delete from public.organization_managers
    where organization_id = target_organization_id and user_id = current_user_id;
  else
    update public.organization_managers
    set role = previous_owner_new_role::public.organization_membership_role
    where organization_id = target_organization_id and user_id = current_user_id;
  end if;

  -- organization_members compatibility write — see header comment.
  delete from public.organization_members
  where organization_id = target_organization_id and user_id = current_user_id;

  select exists (
    select 1 from public.organization_members
    where user_id = target_user_id and is_primary
  ) into target_has_primary;

  insert into public.organization_members (
    organization_id, user_id, role, is_primary
  ) values (
    target_organization_id, target_user_id, 'owner', not target_has_primary
  )
  on conflict (organization_id, user_id) do update
    set role = 'owner';

  insert into public.organization_manager_history (
    organization_id, manager_user_id, actor_user_id, event_type,
    previous_role, new_role
  ) values (
    target_organization_id, target_user_id, current_user_id,
    'ownership_transferred', target_record.role, 'owner'
  );

  if previous_owner_new_role <> 'leave' then
    insert into public.organization_manager_history (
      organization_id, manager_user_id, actor_user_id, event_type,
      previous_role, new_role, note
    ) values (
      target_organization_id, current_user_id, current_user_id, 'role_changed',
      'owner', previous_owner_new_role::public.organization_membership_role,
      'Automatic role change following ownership transfer.'
    );
  else
    insert into public.organization_manager_history (
      organization_id, manager_user_id, actor_user_id, event_type,
      previous_role, note
    ) values (
      target_organization_id, current_user_id, current_user_id, 'manager_left',
      'owner', 'Left management following ownership transfer.'
    );
  end if;
end;
$$;

revoke all on function public.transfer_organization_ownership(uuid, uuid, text) from public, anon;
grant execute on function public.transfer_organization_ownership(uuid, uuid, text) to authenticated;

-- ---------------------------------------------------------------------
-- 15. list_organization_management_history — visible to any active
-- manager (owner/admin/representative — brief section 27: "read-only
-- history may be useful" for admin/representative too) and to Federation
-- Admin for operational audit (read-only). NOT visible to an ordinary
-- Member merely by belonging to the organisation.
-- ---------------------------------------------------------------------

create function public.list_organization_management_history(target_organization_id uuid)
returns table (
  id uuid,
  organization_id uuid,
  manager_user_id uuid,
  manager_name text,
  actor_user_id uuid,
  actor_name text,
  event_type public.organization_manager_history_event,
  previous_role public.organization_membership_role,
  new_role public.organization_membership_role,
  invitation_id uuid,
  note text,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not (
    public.can_manage_organization(target_organization_id)
    or exists (
      select 1 from public.organization_managers as own_grant
      where own_grant.organization_id = target_organization_id
        and own_grant.user_id = (select auth.uid())
    )
    or public.is_platform_admin()
  ) then
    raise exception 'You cannot view this organisation''s management history.'
      using errcode = '42501';
  end if;

  return query
  select
    history.id, history.organization_id, history.manager_user_id,
    coalesce(manager_profile.full_name, ''), history.actor_user_id,
    coalesce(actor_profile.full_name, 'System'), history.event_type,
    history.previous_role, history.new_role, history.invitation_id,
    coalesce(history.note, ''), history.created_at
  from public.organization_manager_history history
  left join public.profiles manager_profile on manager_profile.id = history.manager_user_id
  left join public.profiles actor_profile on actor_profile.id = history.actor_user_id
  where history.organization_id = target_organization_id
  order by history.created_at desc;
end;
$$;

revoke all on function public.list_organization_management_history(uuid) from public, anon;
grant execute on function public.list_organization_management_history(uuid) to authenticated;
