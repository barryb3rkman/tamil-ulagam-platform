-- Phase C2: two small, additive backend changes needed for the real
-- Member Registration experience. No existing table/column/policy/grant
-- is changed or removed; no historical migration is touched.

-- ---------------------------------------------------------------------
-- 1. Member self-leave — the one A1 lifecycle gap this phase fills.
--
-- An approved member must be able to end their own affiliation without
-- needing a manager to act. Ownership is enforced structurally: the
-- function only ever operates on a row it has independently verified
-- belongs to the caller (user_id = auth.uid()) — there is no parameter
-- through which another user's membership could be targeted by id
-- alone. Reuses the existing 'revoked' status rather than introducing a
-- new one; `decided_by = the member's own id` (as opposed to a manager's
-- id) is how the UI/history distinguishes "left" from "removed by a
-- manager" without a schema change.
-- ---------------------------------------------------------------------

create function public.leave_organization_membership(
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
    and user_id = current_user_id
  for update;

  if membership_record.id is null then
    raise exception 'Membership not found.' using errcode = 'P0002';
  end if;

  if membership_record.status <> 'approved' then
    raise exception 'Only an approved membership can be left.'
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
    'revoked', coalesce(nullif(btrim(decision_note), ''), 'Member left the organisation.')
  );

  return updated_membership;
end;
$$;

revoke all on function public.leave_organization_membership(uuid, text)
  from public, anon;
grant execute on function public.leave_organization_membership(uuid, text)
  to authenticated;

-- ---------------------------------------------------------------------
-- 2. Eligible-organisation projection: expose `subtype` so a Member
-- Registration discovery screen can distinguish a Tamil Sangam from
-- other tamil_community organisations, without guessing from the
-- organisation's name. There is no separate `tamil_sangam` category —
-- "Sangam" is a subtype value recorded on
-- organization_tamil_community_details (already populated by the
-- existing registration flow, e.g. the "Tamil Sangam" example used
-- throughout this repo's own tests). Additive: adds one nullable output
-- column to an existing function; every existing caller that only reads
-- id/name/category/city/region/country is unaffected.
-- ---------------------------------------------------------------------

-- CREATE OR REPLACE cannot change a function's output-row shape
-- (PostgreSQL error 42P13); the function must be dropped and recreated.
-- Its grants (revoke-all-from-public/anon, execute-to-authenticated) are
-- attached to the role, not the old function object, so they are
-- reapplied explicitly below rather than assumed to survive.
drop function public.list_membership_eligible_organizations();

create function public.list_membership_eligible_organizations()
returns table (
  id uuid,
  name text,
  category public.organization_category,
  subtype text,
  city text,
  region text,
  country text
)
language sql
stable
security definer
set search_path = ''
as $$
  select o.id, o.name, o.category, tcd.subtype, o.city, o.region, o.country
  from public.organizations o
  left join public.organization_tamil_community_details tcd
    on tcd.organization_id = o.id
  where exists (
    select 1
    from public.organization_applications a
    where a.organization_id = o.id
      and a.status = 'verified'
  )
  order by o.name;
$$;

revoke all on function public.list_membership_eligible_organizations()
  from public, anon;
grant execute on function public.list_membership_eligible_organizations()
  to authenticated;

-- organization_tamil_community_details was never granted to service_role
-- either (same gap as organization_applications, fixed for the same
-- reason in 20260825000000): every prior write path went through a
-- normal authenticated-user session, never trusted server-side tooling.
grant insert, update on table public.organization_tamil_community_details
  to service_role;

-- ---------------------------------------------------------------------
-- 3. Member Workspace organisation identity lookup.
--
-- organizations' own RLS only allows a *manager* (is_organization_member,
-- which — per the A1 domain split — actually means "has a management
-- grant") or a reviewer to read a row. An ordinary approved/pending
-- member has no management grant, so the Member Workspace needs its own
-- narrow, self-scoped read path — the same safe EligibleOrganisation
-- projection, but for every organisation the caller has ANY membership
-- relationship with (any status), not only verified ones (a workspace
-- should still show the organisation identity for a rejected/revoked
-- historical row). Self-scoped via auth.uid() internally; no parameter
-- exists through which another user's affiliations could be read.
-- ---------------------------------------------------------------------

create function public.list_my_affiliated_organizations()
returns table (
  id uuid,
  name text,
  category public.organization_category,
  subtype text,
  city text,
  region text,
  country text
)
language sql
stable
security definer
set search_path = ''
as $$
  select o.id, o.name, o.category, tcd.subtype, o.city, o.region, o.country
  from public.organizations o
  left join public.organization_tamil_community_details tcd
    on tcd.organization_id = o.id
  where exists (
    select 1
    from public.organization_memberships m
    where m.organization_id = o.id
      and m.user_id = (select auth.uid())
  )
  order by o.name;
$$;

revoke all on function public.list_my_affiliated_organizations()
  from public, anon;
grant execute on function public.list_my_affiliated_organizations()
  to authenticated;
