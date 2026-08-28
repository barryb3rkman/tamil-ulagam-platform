-- ---------------------------------------------------------------------
-- Phase H1 — production readiness, legacy consolidation & release
-- candidate hardening.
--
-- Two deliberate, additive changes:
--
-- 1. Retire `organization_members` from the AUTHORIZATION path.
--    `is_organization_member()` and `can_manage_organization()` have
--    read organization_managers OR the legacy organization_members
--    table since Phase A1 (20260825000000), as a transition safety net
--    while draft-creation/registration were being migrated to dual-write
--    both tables. A full dependency audit (Phase H1) confirmed:
--      - Every draft-creation entry point (create_organization_application_
--        draft, ensure_sangam_application_draft) has dual-written both
--        tables since 20260825000000.
--      - The one-time backfill in that same migration gave every
--        pre-existing organisation an equivalent organization_managers
--        owner row.
--      - A hosted-staging integrity audit (H1) found zero organisations
--        missing an organization_managers owner row, zero orphaned/
--        duplicate manager grants, and zero legacy/canonical owner
--        mismatches.
--    The invariant the brief requires before this change is therefore
--    proven, not assumed. organization_members is NOT dropped — it
--    still stores `is_primary` (a personal "which workspace shows
--    first" preference with no organization_managers equivalent) and
--    remains the identity `create_organization_application_draft` uses
--    to resume an in-progress draft. It is simply no longer a source of
--    management OR read authority.
--
-- 2. Server-side invitation-expiry projection (brief section 7).
--    G1 only marked an invitation `expired` lazily, the moment someone
--    attempted to accept it — until then, an obviously-past-due
--    invitation still displayed as "Pending" to both the owner and the
--    invitee. list_organization_manager_invitations and
--    list_my_management_invitations now sweep their own scope (sweeping
--    only rows they are about to return, never a database-wide table
--    scan) and flip any status='pending' row whose expires_at has
--    passed to 'expired' before selecting — no cron, no scheduled
--    infrastructure, matching accept_organization_manager_invitation's
--    existing auto-expire pattern exactly.
-- ---------------------------------------------------------------------

-- ---------------------------------------------------------------------
-- 1. is_organization_member — organization_managers only. Any manager
-- role (owner/admin/representative) counts; this function has never
-- filtered by role, it answers "does this person have any recognized
-- relationship to this organisation", now sourced from the one
-- canonical table.
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
  );
$$;

-- ---------------------------------------------------------------------
-- 2. can_manage_organization — organization_managers only (owner/admin).
-- ---------------------------------------------------------------------

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
  );
$$;

comment on function public.is_organization_member(uuid) is
  'Organization_managers only (retired the organization_members OR-branch '
  'in Phase H1 — see 20260829000000). organization_members is retained as '
  'historical/is_primary data, no longer read for authorization.';

comment on function public.can_manage_organization(uuid) is
  'Organization_managers only (retired the organization_members OR-branch '
  'in Phase H1 — see 20260829000000). organization_members is retained as '
  'historical/is_primary data, no longer read for authorization.';

-- ---------------------------------------------------------------------
-- 3. Invitation-expiry projection.
-- ---------------------------------------------------------------------

create or replace function public.list_organization_manager_invitations(target_organization_id uuid)
returns setof public.organization_manager_invitations
language plpgsql
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

  update public.organization_manager_invitations
  set status = 'expired'
  where organization_id = target_organization_id
    and status = 'pending'
    and expires_at < now();

  return query
  select invitation.*
  from public.organization_manager_invitations invitation
  where invitation.organization_id = target_organization_id
  order by invitation.invited_at desc;
end;
$$;

create or replace function public.list_my_management_invitations()
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

  -- Every bare column name here must be qualified: this function's own
  -- RETURNS TABLE(...) clause declares OUT-parameter variables named
  -- id/organization_id/role/status/invited_by/invited_at/expires_at,
  -- which shadow any unqualified reference to the same-named table
  -- column anywhere in the function body, not only in the final RETURN
  -- QUERY (the exact pitfall documented in Phase G1's own migration).
  update public.organization_manager_invitations as invitation
  set status = 'expired'
  where lower(invitation.email) = current_email
    and invitation.status = 'pending'
    and invitation.expires_at < now();

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

comment on function public.list_organization_manager_invitations(uuid) is
  'Phase H1: sweeps pending-but-past-expiry rows in its own organisation '
  'scope to status=expired before returning, so an owner never sees an '
  'obviously expired invitation as Pending. No cron/scheduled job.';

comment on function public.list_my_management_invitations() is
  'Phase H1: sweeps the caller''s own pending-but-past-expiry rows to '
  'status=expired before returning, so an invitee never sees an obviously '
  'expired invitation as Pending. No cron/scheduled job.';

-- Grants are unchanged from the G1 migration (both functions were already
-- granted to authenticated, revoked from public/anon) — create or replace
-- preserves existing grants, restated here only for auditability.
revoke all on function public.is_organization_member(uuid) from public, anon;
grant execute on function public.is_organization_member(uuid) to authenticated;
revoke all on function public.can_manage_organization(uuid) from public, anon;
grant execute on function public.can_manage_organization(uuid) to authenticated;
revoke all on function public.list_organization_manager_invitations(uuid) from public, anon;
grant execute on function public.list_organization_manager_invitations(uuid) to authenticated;
revoke all on function public.list_my_management_invitations() from public, anon;
grant execute on function public.list_my_management_invitations() to authenticated;

-- ---------------------------------------------------------------------
-- 4. Partnership enquiry — safe, application-side abuse hardening
-- (brief section 9/10). submit_partnership_enquiry is the platform's
-- only anonymous-write RPC. It already validates every field's length
-- and format server-side, never accepts a caller-supplied status, and
-- has no direct table grant for anon/authenticated (RPC-only access) —
-- but had no throttle at all. Trustworthy client IP is not available
-- inside Postgres here (brief explicitly warns against faking one), so
-- this does not attempt IP-based limiting. Instead: a same-email
-- submission cap (3 enquiries per address per rolling 24 hours) — a
-- real server-side check requiring no external credentials, no secrets,
-- and no new infrastructure. It raises the bar for a naive script
-- reusing one address; it is explicitly NOT a substitute for
-- Cloudflare/Turnstile-level bot protection against an adversary who
-- rotates addresses — that remains a documented production
-- recommendation, not something simulated here.
-- ---------------------------------------------------------------------

create index partnership_enquiries_email_created_idx
  on public.partnership_enquiries (lower(email), created_at);

create or replace function public.submit_partnership_enquiry(
  enquiry_name text,
  enquiry_email text,
  enquiry_organization_name text,
  enquiry_country text,
  enquiry_area public.partnership_area,
  enquiry_message text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  created_id uuid;
  normalized_name text := btrim(coalesce(enquiry_name, ''));
  normalized_email text := lower(btrim(coalesce(enquiry_email, '')));
  normalized_organization text := btrim(coalesce(enquiry_organization_name, ''));
  normalized_country text := btrim(coalesce(enquiry_country, ''));
  normalized_message text := btrim(coalesce(enquiry_message, ''));
  recent_count integer;
begin
  if char_length(normalized_name) not between 2 and 160 then
    raise exception 'Enter a valid name.' using errcode = '22023';
  end if;
  if char_length(normalized_email) not between 3 and 320
    or normalized_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'Enter a valid email address.' using errcode = '22023';
  end if;
  if char_length(normalized_organization) > 240 then
    raise exception 'Organisation name is too long.' using errcode = '22023';
  end if;
  if char_length(normalized_country) not between 2 and 120 then
    raise exception 'Enter a valid country.' using errcode = '22023';
  end if;
  if enquiry_area is null then
    raise exception 'Choose a partnership area.' using errcode = '22023';
  end if;
  if char_length(normalized_message) not between 20 and 3000 then
    raise exception 'Message must be between 20 and 3000 characters.' using errcode = '22023';
  end if;

  select count(*) into recent_count
  from public.partnership_enquiries
  where lower(email) = normalized_email
    and created_at > now() - interval '24 hours';

  if recent_count >= 3 then
    raise exception 'Too many enquiries from this email address. Please try again later.'
      using errcode = '22023';
  end if;

  insert into public.partnership_enquiries (
    name,
    email,
    organization_name,
    country,
    partnership_area,
    message
  ) values (
    normalized_name,
    normalized_email,
    normalized_organization,
    normalized_country,
    enquiry_area,
    normalized_message
  )
  returning id into created_id;

  insert into public.partnership_enquiry_history (
    enquiry_id,
    previous_status,
    new_status,
    actor_user_id,
    note
  ) values (created_id, null, 'new', null, 'Enquiry received.');

  return created_id;
end;
$$;

revoke all on function public.submit_partnership_enquiry(text, text, text, text, public.partnership_area, text) from public, authenticated;
grant execute on function public.submit_partnership_enquiry(text, text, text, text, public.partnership_area, text) to anon, authenticated;
