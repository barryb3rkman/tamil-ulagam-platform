-- Phase D1: Tamil Sangam registration.
--
-- A Tamil Sangam remains, internally, a `tamil_community` organisation
-- whose `organization_tamil_community_details.subtype` is exactly
-- "Tamil Sangam" (the same convention C2 already relies on for Member
-- Registration discovery — see `isTamilSangam` in packages/shared). No new
-- top-level category, no new root entity. This migration is additive only:
-- two new nullable/defaulted columns on the existing details table, plus
-- one new SECURITY DEFINER function that gives the Sangam journey its own
-- draft-resolution path without touching the Organisation journey's
-- existing `create_organization_application_draft` at all.

-- ---------------------------------------------------------------------
-- 1. Two small, additive Sangam-relevant fields.
--
-- Everything else the D1 brief asks for already has a home: name/
-- country/region/city/year_established/description on `organizations`
-- itself (the "community served" prompt reuses the existing description
-- field, just with Sangam-specific copy — see content/sangam.ts);
-- official email/phone/website, representative identity/phone/role, and
-- registration status/number all already exist. Network affiliation is
-- genuinely new and has nowhere else to live.
-- ---------------------------------------------------------------------

alter table public.organization_tamil_community_details
  add column if not exists network_affiliated boolean,
  add column if not exists network_name text not null default '';

alter table public.organization_tamil_community_details
  add constraint tamil_community_network_name_length
  check (char_length(network_name) <= 240);

-- ---------------------------------------------------------------------
-- 2. ensure_sangam_application_draft — the Sangam journey's own
-- draft-resolution entry point.
--
-- Deliberately NOT a change to create_organization_application_draft:
-- that function (and the "current application" it feeds throughout the
-- Organisation journey) resolves a single application by the caller's
-- PRIMARY organisation membership, with no category awareness. A second,
-- independent entry point lets someone manage an Organisation AND a
-- Tamil Sangam at once (D1 brief section 21) without either journey's
-- draft-resolution silently picking up the other's record.
--
-- Lookup match: an existing organization_applications row for an
-- organisation the caller manages (checked across both
-- organization_managers and the legacy organization_members, mirroring
-- the is_organization_member/can_manage_organization dual-table
-- convention) whose category is tamil_community AND whose recorded
-- subtype is exactly "Tamil Sangam" — the same identity rule
-- isTamilSangam() uses client-side. A tamil_community organisation
-- registered through the generic Organisation wizard with a different
-- subtype (e.g. "Cultural Organisation") is a different record and is
-- correctly left alone by this function.
--
-- On no match, creates a new organisation/application pair using the
-- same shape create_organization_application_draft uses, and
-- immediately writes organization_tamil_community_details with
-- subtype = 'Tamil Sangam' as part of the same transaction — so a
-- Sangam draft is correctly identified from the moment it exists, not
-- only once the applicant reaches the stage that used to ask for a
-- subtype choice (Sangam registration never asks; it is fixed).
-- ---------------------------------------------------------------------

create function public.ensure_sangam_application_draft()
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
    pg_catalog.hashtextextended(current_user_id::text || ':sangam-draft', 0)
  );

  select application.* into new_application
  from public.organization_applications as application
  join public.organizations as org
    on org.id = application.organization_id
  join public.organization_tamil_community_details as details
    on details.organization_id = org.id
  where org.category = 'tamil_community'
    and lower(btrim(details.subtype)) = 'tamil sangam'
    and (
      exists (
        select 1 from public.organization_managers
        where organization_id = org.id and user_id = current_user_id
      )
      or exists (
        select 1 from public.organization_members
        where organization_id = org.id and user_id = current_user_id
      )
    )
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
  values ('tamil_community')
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

  insert into public.organization_tamil_community_details (
    organization_id,
    subtype
  ) values (
    new_organization_id,
    'Tamil Sangam'
  );

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

revoke all on function public.ensure_sangam_application_draft()
  from public, anon;
grant execute on function public.ensure_sangam_application_draft()
  to authenticated;

-- ---------------------------------------------------------------------
-- 3. Same class of gap A1/C2 already found and fixed twice for this
-- table (insert/update were granted to service_role in
-- 20260825000002, select never was) — service_role tooling (test
-- fixtures, a future admin backoffice) legitimately needs to read this
-- table directly, the same way it can already read organizations/
-- organization_applications.
-- ---------------------------------------------------------------------

grant select on table public.organization_tamil_community_details to service_role;
