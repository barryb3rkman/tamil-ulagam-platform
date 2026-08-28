-- Phase H3 — Tamil Sangam registration V2.
--
-- Additive-only, Sangam-domain-scoped schema change. Nothing here alters
-- Organisation registration behaviour: every new column is nullable/
-- defaulted, every new table is new, and the one shared RPC touched
-- (submit_organization_application) only gains an extra, Sangam-only
-- branch inside its existing tamil_community completeness check — the
-- Organisation/education/healthcare/business/nonprofit/other branches
-- are byte-for-byte unchanged.
--
-- New canonical Sangam fields (H3 brief section 2) land on the existing
-- per-category `organization_tamil_community_details` table — the same
-- table Phase D1 already extended for network_affiliated/network_name —
-- rather than a new table, because it is already the proper typed home
-- for "facts about this Tamil Sangam" and is already 1:1 with
-- organizations. Social links are genuinely a "zero or more" collection
-- and get their own table. The registration document is a Storage
-- object; only its pointer (path/filename/uploaded_at) lives here.

-- ---------------------------------------------------------------------
-- 1. New Sangam-specific columns on organization_tamil_community_details.
--
-- Untouched by the generic Organisation wizard's own tamil_community
-- subtype flow (it never writes these) — they simply stay at their
-- defaults there, the same way chairperson_name/secretary_name already
-- stay unused by the Sangam journey. Existing Sangam rows (pre-H3) get
-- these as NULL/''/empty — read as "not yet provided", never invented
-- (H3 brief section 27).
-- ---------------------------------------------------------------------

alter table public.organization_tamil_community_details
  add column if not exists member_count integer,
  add column if not exists spoc_full_name text not null default '',
  add column if not exists spoc_email text not null default '',
  add column if not exists spoc_phone text not null default '',
  add column if not exists president_full_name text not null default '',
  add column if not exists president_email text not null default '',
  add column if not exists president_phone text not null default '',
  add column if not exists registration_document_path text,
  add column if not exists registration_document_filename text not null default '',
  add column if not exists registration_document_uploaded_at timestamptz;

alter table public.organization_tamil_community_details
  add constraint tamil_community_member_count_range
  check (member_count is null or member_count between 1 and 5000000);

alter table public.organization_tamil_community_details
  add constraint tamil_community_spoc_president_lengths
  check (
    char_length(spoc_full_name) <= 160
    and char_length(spoc_email) <= 320
    and char_length(spoc_phone) <= 50
    and char_length(president_full_name) <= 160
    and char_length(president_email) <= 320
    and char_length(president_phone) <= 50
    and char_length(registration_document_filename) <= 300
  );

-- ---------------------------------------------------------------------
-- 2. Social media links — zero or more per organisation. Scoped to
-- `organizations` (not the tamil_community details table) since it is a
-- generic "list of links" concept; only the Sangam journey writes to it
-- for now. Order is preserved via `position` so the wizard's "Add
-- another link" list renders back in the order it was entered.
-- ---------------------------------------------------------------------

create table public.organization_social_links (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  url text not null,
  position smallint not null default 0,
  created_at timestamptz not null default now(),
  constraint organization_social_links_url_length check (char_length(url) <= 500),
  constraint organization_social_links_url_format check (url ~* '^https?://[^[:space:]]+$')
);

create index organization_social_links_organization_idx
  on public.organization_social_links (organization_id, position);

alter table public.organization_social_links enable row level security;

create policy organization_social_links_select_member_or_reviewer
on public.organization_social_links for select
to authenticated
using (
  public.is_organization_member(organization_id)
  or public.is_application_reviewer()
);

create policy organization_social_links_write_manager_editable
on public.organization_social_links for all
to authenticated
using (
  public.can_manage_organization(organization_id)
  and public.organization_application_is_editable(organization_id)
)
with check (
  public.can_manage_organization(organization_id)
  and public.organization_application_is_editable(organization_id)
);

-- The RLS policies above restrict rows, but Postgres also requires the
-- base table-level GRANT before RLS is even evaluated — every sibling
-- per-category detail table has this same explicit
-- `grant ... to authenticated` (see the foundation migration); this one
-- was missing it initially, which surfaced as a blanket "You do not have
-- permission to complete this action." the instant anything (the Sangam
-- wizard's own draft load, or the Sangam workspace's application load)
-- tried to read this table for a legitimate manager/reviewer.
grant select, insert, update, delete on table public.organization_social_links to authenticated;
grant select on table public.organization_social_links to service_role;

-- ---------------------------------------------------------------------
-- 3. Secure Storage for registration documents.
--
-- Private bucket (public = false — H3 brief sections 9/12/13: no public
-- URLs, ever). Path convention (H3 brief section 11):
--   <application-id>/<generated-file-name>
-- The application id is a stable identity for the life of a Sangam draft
-- (ensure_sangam_application_draft always resolves the same row), and
-- using it as the folder segment is what lets the storage RLS policies
-- below resolve ownership with a single indexed lookup rather than
-- trusting anything client-supplied. The generated file name (not the
-- original filename) avoids collisions and information leakage through
-- the object key; the original filename is preserved separately as
-- display metadata (registration_document_filename above).
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'sangam-registration-documents',
  'sangam-registration-documents',
  false,
  10485760, -- 10 MiB (H3 brief section 10)
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do nothing;

-- can_write_sangam_document / can_read_sangam_document resolve the
-- application id encoded in the object's folder back to its owning
-- organisation and reuse the exact same authorization primitives every
-- other table in this schema already relies on (can_manage_organization,
-- organization_application_is_editable, is_application_reviewer) —
-- SECURITY DEFINER so the check itself isn't gated behind
-- organization_applications' own RLS.
create function public.can_write_sangam_document(target_application_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_applications as application
    where application.id = target_application_id
      and public.can_manage_organization(application.organization_id)
      and public.organization_application_is_editable(application.organization_id)
  );
$$;

create function public.can_read_sangam_document(target_application_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_applications as application
    where application.id = target_application_id
      and (
        public.can_manage_organization(application.organization_id)
        or public.is_application_reviewer()
      )
  );
$$;

revoke all on function public.can_write_sangam_document(uuid) from public, anon;
revoke all on function public.can_read_sangam_document(uuid) from public, anon;
grant execute on function public.can_write_sangam_document(uuid) to authenticated;
grant execute on function public.can_read_sangam_document(uuid) to authenticated;

-- The folder-segment-to-uuid cast below is guarded by an explicit regex
-- check first (rather than relying on AND's evaluation order, which
-- Postgres does not guarantee) so a malformed object path in this bucket
-- can never raise an error out of the policy itself.
create policy sangam_registration_documents_select
on storage.objects for select
to authenticated
using (
  bucket_id = 'sangam-registration-documents'
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  and public.can_read_sangam_document(((storage.foldername(name))[1])::uuid)
);

create policy sangam_registration_documents_insert
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'sangam-registration-documents'
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  and public.can_write_sangam_document(((storage.foldername(name))[1])::uuid)
);

create policy sangam_registration_documents_update
on storage.objects for update
to authenticated
using (
  bucket_id = 'sangam-registration-documents'
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  and public.can_write_sangam_document(((storage.foldername(name))[1])::uuid)
)
with check (
  bucket_id = 'sangam-registration-documents'
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  and public.can_write_sangam_document(((storage.foldername(name))[1])::uuid)
);

create policy sangam_registration_documents_delete
on storage.objects for delete
to authenticated
using (
  bucket_id = 'sangam-registration-documents'
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  and public.can_write_sangam_document(((storage.foldername(name))[1])::uuid)
);

-- ---------------------------------------------------------------------
-- 4. submit_organization_application — one additional, Sangam-only
-- validation branch.
--
-- Every existing branch (organisation identity/contact, representative,
-- and every other category's completeness check) is reproduced
-- unchanged below; only the new `is_sangam` detection and its own
-- extra requirements are added. Official email/phone are the one
-- Organisation-wide requirement relaxed for a Tamil Sangam specifically
-- (H3 brief section 3 — the field no longer exists in the Sangam UX, so
-- it can never be filled in).
-- ---------------------------------------------------------------------

create or replace function public.submit_organization_application(target_application_id uuid)
returns public.organization_applications
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  application_record public.organization_applications;
  organization_record public.organizations;
  updated_application public.organization_applications;
  sangam_details public.organization_tamil_community_details;
  is_sangam boolean := false;
begin
  if current_user_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  select * into application_record
  from public.organization_applications
  where id = target_application_id
  for update;

  if application_record.id is null then
    raise exception 'Organization application not found.' using errcode = 'P0002';
  end if;

  if not public.can_manage_organization(application_record.organization_id) then
    raise exception 'You cannot submit this organization application.' using errcode = '42501';
  end if;

  if application_record.status not in ('draft', 'needs_changes') then
    raise exception 'Only draft or changes-requested applications can be submitted.'
      using errcode = '22023';
  end if;

  select * into organization_record
  from public.organizations
  where id = application_record.organization_id;

  if organization_record.category = 'tamil_community' then
    select * into sangam_details
    from public.organization_tamil_community_details
    where organization_id = organization_record.id;
    is_sangam := sangam_details.organization_id is not null
      and lower(btrim(sangam_details.subtype)) = 'tamil sangam';
  end if;

  if organization_record.category is null
    or btrim(organization_record.name) = ''
    or btrim(organization_record.country) = ''
    or btrim(organization_record.region) = ''
    or btrim(organization_record.city) = ''
    or (
      not is_sangam and (
        btrim(organization_record.official_email) = ''
        or organization_record.official_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
        or btrim(organization_record.official_phone) = ''
        or btrim(organization_record.description) = ''
      )
    )
    or organization_record.registration_status is null then
    raise exception 'Complete every required organization field before submission.'
      using errcode = '23514';
  end if;

  if is_sangam and organization_record.year_established is null then
    raise exception 'Enter the Sangam''s year of commencement before submission.'
      using errcode = '23514';
  end if;

  if btrim(application_record.representative_full_name) = ''
    or btrim(application_record.representative_email) = ''
    or application_record.representative_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or btrim(application_record.representative_phone) = ''
    or application_record.representative_relationship is null
    or not application_record.authorization_declaration
    or not application_record.accuracy_declaration then
    raise exception 'Complete the representative information and declarations before submission.'
      using errcode = '23514';
  end if;

  if organization_record.category = 'tamil_community'
    and not exists (
      select 1 from public.organization_tamil_community_details
      where organization_id = organization_record.id
        and btrim(subtype) <> ''
    ) then
    raise exception 'Complete the Tamil or community organization details before submission.'
      using errcode = '23514';
  elsif organization_record.category = 'education'
    and not exists (
      select 1 from public.organization_education_details
      where organization_id = organization_record.id
        and btrim(institution_type) <> ''
    ) then
    raise exception 'Complete the education organization details before submission.'
      using errcode = '23514';
  elsif organization_record.category = 'healthcare'
    and not exists (
      select 1 from public.organization_healthcare_details
      where organization_id = organization_record.id
        and btrim(facility_type) <> ''
    ) then
    raise exception 'Complete the healthcare organization details before submission.'
      using errcode = '23514';
  elsif organization_record.category = 'business'
    and not exists (
      select 1 from public.organization_business_details
      where organization_id = organization_record.id
        and btrim(business_type) <> ''
        and btrim(industry) <> ''
    ) then
    raise exception 'Complete the business organization details before submission.'
      using errcode = '23514';
  elsif organization_record.category = 'nonprofit'
    and not exists (
      select 1 from public.organization_nonprofit_details
      where organization_id = organization_record.id
        and btrim(subtype) <> ''
    ) then
    raise exception 'Complete the nonprofit organization details before submission.'
      using errcode = '23514';
  elsif organization_record.category = 'other'
    and not exists (
      select 1 from public.organization_other_details
      where organization_id = organization_record.id
        and btrim(organization_type) <> ''
        and btrim(primary_purpose) <> ''
    ) then
    raise exception 'Complete the organization details before submission.'
      using errcode = '23514';
  end if;

  -- H3 brief section 26: Sangam-only required fields beyond the shared
  -- checks above — member count, SPOC, President, and (only when
  -- formally registered) registration number + document.
  if is_sangam then
    if sangam_details.member_count is null
      or btrim(sangam_details.spoc_full_name) = ''
      or btrim(sangam_details.spoc_email) = ''
      or sangam_details.spoc_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
      or btrim(sangam_details.spoc_phone) = ''
      or btrim(sangam_details.president_full_name) = ''
      or btrim(sangam_details.president_email) = ''
      or sangam_details.president_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
      or btrim(sangam_details.president_phone) = '' then
      raise exception 'Complete the SPOC and President details before submission.'
        using errcode = '23514';
    end if;

    if organization_record.registration_status = 'registered'
      and (
        btrim(organization_record.registration_number) = ''
        or sangam_details.registration_document_path is null
      ) then
      raise exception 'Add the registration number and registration document before submission.'
        using errcode = '23514';
    end if;
  end if;

  update public.organization_applications
  set status = 'submitted',
      current_step = 3,
      admin_feedback = null,
      submitted_at = now(),
      reviewed_at = null,
      reviewed_by = null
  where id = target_application_id
  returning * into updated_application;

  insert into public.application_review_history (
    application_id,
    actor_user_id,
    previous_status,
    new_status
  ) values (
    target_application_id,
    current_user_id,
    application_record.status,
    'submitted'
  );

  return updated_application;
end;
$$;

-- ---------------------------------------------------------------------
-- 5. organization_applications was granted insert/update for
-- service_role in 20260825000000 but, like tamil_community_details
-- before it (see 20260826000000's own comment — "same class of gap
-- found and fixed twice for this table"), SELECT was never granted.
-- Trusted server-side tooling (automated-test fixtures, a future admin
-- backoffice) legitimately needs to read this table directly the same
-- way it can already read organizations/organization_managers; without
-- SELECT, even a plain `.update().eq('id', ...)` from service_role fails
-- outright, since Postgres requires SELECT on any column referenced in
-- an UPDATE's WHERE clause, not just UPDATE on the columns being set.
-- ---------------------------------------------------------------------

grant select on table public.organization_applications to service_role;
