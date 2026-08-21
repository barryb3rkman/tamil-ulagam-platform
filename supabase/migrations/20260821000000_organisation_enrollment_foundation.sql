-- Tamil Ulagam organisation enrollment data and authorization foundation.
-- Browser access is restricted by row-level security and narrow RPC functions.

create type public.organization_category as enum (
  'tamil_community',
  'education',
  'healthcare',
  'business',
  'nonprofit',
  'other'
);

create type public.registration_status as enum (
  'draft',
  'submitted',
  'under_review',
  'needs_changes',
  'verified',
  'rejected',
  'suspended'
);

create type public.legal_registration_status as enum (
  'registered',
  'informal'
);

create type public.organization_membership_role as enum (
  'owner',
  'admin',
  'representative'
);

create type public.application_role as enum (
  'admin',
  'reviewer'
);

create type public.representative_relationship as enum (
  'founder',
  'president',
  'secretary',
  'director',
  'administrator',
  'employee',
  'authorised_representative',
  'other'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  country text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_full_name_length check (char_length(full_name) <= 160),
  constraint profiles_phone_length check (char_length(phone) <= 50),
  constraint profiles_country_length check (char_length(country) <= 120)
);

insert into public.profiles (id, full_name, phone)
select
  id,
  coalesce(left(nullif(btrim(raw_user_meta_data ->> 'full_name'), ''), 160), ''),
  coalesce(left(phone, 50), '')
from auth.users
on conflict (id) do nothing;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  category public.organization_category,
  name text not null default '',
  country text not null default '',
  region text not null default '',
  city text not null default '',
  street_address text not null default '',
  postal_code text not null default '',
  official_email text not null default '',
  official_phone text not null default '',
  website text not null default '',
  year_established smallint,
  description text not null default '',
  logo_path text,
  registration_status public.legal_registration_status,
  registration_number text not null default '',
  registration_authority text not null default '',
  registration_country text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organizations_name_length check (char_length(name) <= 240),
  constraint organizations_location_lengths check (
    char_length(country) <= 120
    and char_length(region) <= 160
    and char_length(city) <= 160
    and char_length(street_address) <= 500
    and char_length(postal_code) <= 40
  ),
  constraint organizations_contact_lengths check (
    char_length(official_email) <= 320
    and char_length(official_phone) <= 50
    and char_length(website) <= 500
  ),
  constraint organizations_year_established_range check (
    year_established is null or year_established between 1000 and 2100
  ),
  constraint organizations_description_length check (
    char_length(description) <= 600
  ),
  constraint organizations_website_format check (
    website = '' or website ~* '^https?://[^[:space:]]+$'
  )
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.organization_membership_role not null,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  constraint organization_members_unique_user unique (organization_id, user_id)
);

create unique index organization_members_one_primary_per_user_idx
  on public.organization_members (user_id)
  where is_primary;

create index organization_members_user_idx
  on public.organization_members (user_id, organization_id);

create table public.organization_applications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations (id) on delete cascade,
  submitted_by uuid not null references auth.users (id) on delete restrict,
  status public.registration_status not null default 'draft',
  current_step smallint not null default 1,
  representative_full_name text not null default '',
  representative_email text not null default '',
  representative_phone text not null default '',
  representative_designation text not null default '',
  representative_relationship public.representative_relationship,
  authorization_declaration boolean not null default false,
  accuracy_declaration boolean not null default false,
  admin_feedback text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organization_applications_current_step check (current_step between 1 and 4),
  constraint organization_applications_representative_lengths check (
    char_length(representative_full_name) <= 160
    and char_length(representative_email) <= 320
    and char_length(representative_phone) <= 50
    and char_length(representative_designation) <= 160
  ),
  constraint organization_applications_feedback_length check (
    admin_feedback is null or char_length(admin_feedback) <= 2000
  ),
  constraint organization_applications_submission_timestamp check (
    status = 'draft' or submitted_at is not null
  )
);

create index organization_applications_status_idx
  on public.organization_applications (status, submitted_at desc);

create index organization_applications_submitted_by_idx
  on public.organization_applications (submitted_by);

create table public.organization_tamil_community_details (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  subtype text not null default '',
  primary_activities text[] not null default '{}',
  membership_size text not null default '',
  geographic_area_served text not null default '',
  chairperson_name text not null default '',
  secretary_name text not null default '',
  languages text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tamil_community_subtype_length check (char_length(subtype) <= 160),
  constraint tamil_community_optional_lengths check (
    char_length(membership_size) <= 80
    and char_length(geographic_area_served) <= 300
    and char_length(chairperson_name) <= 160
    and char_length(secretary_name) <= 160
    and char_length(languages) <= 300
  )
);

create table public.organization_education_details (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  institution_type text not null default '',
  governance_type text not null default '',
  tamil_programmes_offered boolean,
  tamil_programmes_description text not null default '',
  accreditation_authority text not null default '',
  accreditation_number text not null default '',
  student_population text not null default '',
  study_areas text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint education_field_lengths check (
    char_length(institution_type) <= 160
    and char_length(governance_type) <= 160
    and char_length(tamil_programmes_description) <= 1000
    and char_length(accreditation_authority) <= 240
    and char_length(accreditation_number) <= 160
    and char_length(student_population) <= 80
  )
);

create table public.organization_healthcare_details (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  facility_type text not null default '',
  ownership_type text not null default '',
  systems_of_medicine text[] not null default '{}',
  main_services text not null default '',
  licensed boolean,
  licence_number text not null default '',
  licensing_authority text not null default '',
  twenty_four_seven boolean not null default false,
  emergency_services boolean not null default false,
  number_of_beds integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint healthcare_field_lengths check (
    char_length(facility_type) <= 160
    and char_length(ownership_type) <= 160
    and char_length(main_services) <= 1000
    and char_length(licence_number) <= 160
    and char_length(licensing_authority) <= 240
  ),
  constraint healthcare_bed_count check (
    number_of_beds is null or number_of_beds between 0 and 100000
  )
);

create table public.organization_business_details (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  business_type text not null default '',
  industry text not null default '',
  products_services text not null default '',
  employee_size text not null default '',
  operating_countries text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_field_lengths check (
    char_length(business_type) <= 160
    and char_length(industry) <= 160
    and char_length(products_services) <= 1000
    and char_length(employee_size) <= 80
    and char_length(operating_countries) <= 500
  )
);

create table public.organization_nonprofit_details (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  subtype text not null default '',
  primary_areas text[] not null default '{}',
  beneficiary_regions text not null default '',
  organization_size text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint nonprofit_field_lengths check (
    char_length(subtype) <= 160
    and char_length(beneficiary_regions) <= 500
    and char_length(organization_size) <= 80
  )
);

create table public.organization_other_details (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  organization_type text not null default '',
  primary_purpose text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint other_organization_type_length check (char_length(organization_type) <= 240),
  constraint other_primary_purpose_length check (char_length(primary_purpose) <= 1200)
);

create table public.user_roles (
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.application_role not null,
  granted_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table public.application_review_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.organization_applications (id) on delete cascade,
  actor_user_id uuid references auth.users (id) on delete set null,
  previous_status public.registration_status,
  new_status public.registration_status not null,
  feedback text,
  created_at timestamptz not null default now(),
  constraint application_review_history_feedback_length check (
    feedback is null or char_length(feedback) <= 2000
  )
);

create index application_review_history_application_idx
  on public.application_review_history (application_id, created_at desc);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger organizations_set_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

create trigger organization_applications_set_updated_at
before update on public.organization_applications
for each row execute function public.set_updated_at();

create trigger tamil_community_details_set_updated_at
before update on public.organization_tamil_community_details
for each row execute function public.set_updated_at();

create trigger education_details_set_updated_at
before update on public.organization_education_details
for each row execute function public.set_updated_at();

create trigger healthcare_details_set_updated_at
before update on public.organization_healthcare_details
for each row execute function public.set_updated_at();

create trigger business_details_set_updated_at
before update on public.organization_business_details
for each row execute function public.set_updated_at();

create trigger nonprofit_details_set_updated_at
before update on public.organization_nonprofit_details
for each row execute function public.set_updated_at();

create trigger other_details_set_updated_at
before update on public.organization_other_details
for each row execute function public.set_updated_at();

create function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(left(nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''), 160), ''),
    coalesce(left(new.phone, 50), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create function public.is_application_reviewer()
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
      and role in ('admin', 'reviewer')
  );
$$;

create function public.is_organization_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_members
    where organization_id = target_organization_id
      and user_id = (select auth.uid())
  );
$$;

create function public.can_manage_organization(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_members
    where organization_id = target_organization_id
      and user_id = (select auth.uid())
      and role in ('owner', 'admin')
  );
$$;

create function public.organization_application_is_editable(target_organization_id uuid)
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
      and status in ('draft', 'needs_changes')
  );
$$;

create function public.ensure_category_matches_organization()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  actual_category public.organization_category;
begin
  select category
  into actual_category
  from public.organizations
  where id = new.organization_id;

  if actual_category is distinct from tg_argv[0]::public.organization_category then
    raise exception 'Category details do not match the organization category.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger tamil_community_category_matches
before insert or update on public.organization_tamil_community_details
for each row execute function public.ensure_category_matches_organization('tamil_community');

create trigger education_category_matches
before insert or update on public.organization_education_details
for each row execute function public.ensure_category_matches_organization('education');

create trigger healthcare_category_matches
before insert or update on public.organization_healthcare_details
for each row execute function public.ensure_category_matches_organization('healthcare');

create trigger business_category_matches
before insert or update on public.organization_business_details
for each row execute function public.ensure_category_matches_organization('business');

create trigger nonprofit_category_matches
before insert or update on public.organization_nonprofit_details
for each row execute function public.ensure_category_matches_organization('nonprofit');

create trigger other_category_matches
before insert or update on public.organization_other_details
for each row execute function public.ensure_category_matches_organization('other');

create function public.clear_stale_category_details()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.category is not distinct from old.category then
    return new;
  end if;

  if new.category is distinct from 'tamil_community' then
    delete from public.organization_tamil_community_details where organization_id = new.id;
  end if;
  if new.category is distinct from 'education' then
    delete from public.organization_education_details where organization_id = new.id;
  end if;
  if new.category is distinct from 'healthcare' then
    delete from public.organization_healthcare_details where organization_id = new.id;
  end if;
  if new.category is distinct from 'business' then
    delete from public.organization_business_details where organization_id = new.id;
  end if;
  if new.category is distinct from 'nonprofit' then
    delete from public.organization_nonprofit_details where organization_id = new.id;
  end if;
  if new.category is distinct from 'other' then
    delete from public.organization_other_details where organization_id = new.id;
  end if;

  return new;
end;
$$;

create trigger organizations_clear_stale_category_details
after update of category on public.organizations
for each row execute function public.clear_stale_category_details();

create function public.create_organization_application_draft(
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

create function public.submit_organization_application(target_application_id uuid)
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

  if organization_record.category is null
    or btrim(organization_record.name) = ''
    or btrim(organization_record.country) = ''
    or btrim(organization_record.region) = ''
    or btrim(organization_record.city) = ''
    or btrim(organization_record.street_address) = ''
    or btrim(organization_record.official_email) = ''
    or organization_record.official_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or btrim(organization_record.official_phone) = ''
    or btrim(organization_record.description) = ''
    or organization_record.registration_status is null
    or (
      organization_record.registration_status = 'registered'
      and (
        btrim(organization_record.registration_number) = ''
        or btrim(organization_record.registration_authority) = ''
        or btrim(organization_record.registration_country) = ''
      )
    ) then
    raise exception 'Complete every required organization field before submission.'
      using errcode = '23514';
  end if;

  if btrim(application_record.representative_full_name) = ''
    or btrim(application_record.representative_email) = ''
    or application_record.representative_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or btrim(application_record.representative_phone) = ''
    or btrim(application_record.representative_designation) = ''
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
        and cardinality(primary_activities) > 0
    ) then
    raise exception 'Complete the Tamil or community organization details before submission.'
      using errcode = '23514';
  elsif organization_record.category = 'education'
    and not exists (
      select 1 from public.organization_education_details
      where organization_id = organization_record.id
        and btrim(institution_type) <> ''
        and btrim(governance_type) <> ''
        and tamil_programmes_offered is not null
        and (not tamil_programmes_offered or btrim(tamil_programmes_description) <> '')
    ) then
    raise exception 'Complete the education organization details before submission.'
      using errcode = '23514';
  elsif organization_record.category = 'healthcare'
    and not exists (
      select 1 from public.organization_healthcare_details
      where organization_id = organization_record.id
        and btrim(facility_type) <> ''
        and btrim(ownership_type) <> ''
        and cardinality(systems_of_medicine) > 0
        and btrim(main_services) <> ''
        and licensed is not null
        and (not licensed or (btrim(licence_number) <> '' and btrim(licensing_authority) <> ''))
    ) then
    raise exception 'Complete the healthcare organization details before submission.'
      using errcode = '23514';
  elsif organization_record.category = 'business'
    and not exists (
      select 1 from public.organization_business_details
      where organization_id = organization_record.id
        and btrim(business_type) <> ''
        and btrim(industry) <> ''
        and btrim(products_services) <> ''
    ) then
    raise exception 'Complete the business organization details before submission.'
      using errcode = '23514';
  elsif organization_record.category = 'nonprofit'
    and not exists (
      select 1 from public.organization_nonprofit_details
      where organization_id = organization_record.id
        and btrim(subtype) <> ''
        and cardinality(primary_areas) > 0
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

  update public.organization_applications
  set status = 'submitted',
      current_step = 4,
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

create function public.select_primary_organization(target_organization_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
begin
  if current_user_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.organization_members
    where organization_id = target_organization_id
      and user_id = current_user_id
  ) then
    raise exception 'You do not belong to this organization.' using errcode = '42501';
  end if;

  perform 1
  from public.organization_members
  where user_id = current_user_id
  for update;

  update public.organization_members
  set is_primary = false
  where user_id = current_user_id
    and is_primary;

  update public.organization_members
  set is_primary = true
  where organization_id = target_organization_id
    and user_id = current_user_id;
end;
$$;

create function public.review_organization_application(
  target_application_id uuid,
  target_status public.registration_status,
  review_feedback text default null
)
returns public.organization_applications
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  application_record public.organization_applications;
  updated_application public.organization_applications;
  normalized_feedback text := nullif(btrim(review_feedback), '');
begin
  if current_user_id is null or not public.is_application_reviewer() then
    raise exception 'Administrative review permission is required.' using errcode = '42501';
  end if;

  select * into application_record
  from public.organization_applications
  where id = target_application_id
  for update;

  if application_record.id is null then
    raise exception 'Organization application not found.' using errcode = 'P0002';
  end if;

  if application_record.submitted_by = current_user_id
    or public.is_organization_member(application_record.organization_id) then
    raise exception 'Reviewers cannot decide an application they submitted or represent.'
      using errcode = '42501';
  end if;

  if target_status = 'under_review'
    and application_record.status not in ('submitted', 'suspended') then
    raise exception 'This application cannot be marked under review from its current status.'
      using errcode = '22023';
  elsif target_status = 'verified'
    and application_record.status not in ('submitted', 'under_review') then
    raise exception 'This application cannot be verified from its current status.'
      using errcode = '22023';
  elsif target_status in ('needs_changes', 'rejected')
    and application_record.status not in ('submitted', 'under_review') then
    raise exception 'This review decision is not valid from the current status.'
      using errcode = '22023';
  elsif target_status = 'suspended'
    and application_record.status not in ('under_review', 'verified') then
    raise exception 'This application cannot be suspended from its current status.'
      using errcode = '22023';
  elsif target_status not in ('under_review', 'verified', 'needs_changes', 'rejected', 'suspended') then
    raise exception 'Unsupported administrative status transition.' using errcode = '22023';
  end if;

  if target_status in ('needs_changes', 'rejected', 'suspended')
    and normalized_feedback is null then
    raise exception 'Feedback is required for this review decision.' using errcode = '23514';
  end if;

  update public.organization_applications
  set status = target_status,
      admin_feedback = case
        when target_status in ('needs_changes', 'rejected', 'suspended')
          then normalized_feedback
        else null
      end,
      reviewed_at = now(),
      reviewed_by = current_user_id
  where id = target_application_id
  returning * into updated_application;

  insert into public.application_review_history (
    application_id,
    actor_user_id,
    previous_status,
    new_status,
    feedback
  ) values (
    target_application_id,
    current_user_id,
    application_record.status,
    target_status,
    normalized_feedback
  );

  return updated_application;
end;
$$;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.organization_applications enable row level security;
alter table public.organization_tamil_community_details enable row level security;
alter table public.organization_education_details enable row level security;
alter table public.organization_healthcare_details enable row level security;
alter table public.organization_business_details enable row level security;
alter table public.organization_nonprofit_details enable row level security;
alter table public.organization_other_details enable row level security;
alter table public.user_roles enable row level security;
alter table public.application_review_history enable row level security;

create policy profiles_select_own_or_application_reviewer
on public.profiles for select
to authenticated
using (
  (select auth.uid()) = id
  or (
    public.is_application_reviewer()
    and exists (
      select 1
      from public.organization_applications as application
      where application.submitted_by = profiles.id
        or application.reviewed_by = profiles.id
    )
  )
);

create policy profiles_update_own
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy organizations_select_member_or_reviewer
on public.organizations for select
to authenticated
using (public.is_organization_member(id) or public.is_application_reviewer());

create policy organizations_update_manager_during_editable_status
on public.organizations for update
to authenticated
using (
  public.can_manage_organization(id)
  and public.organization_application_is_editable(id)
)
with check (
  public.can_manage_organization(id)
  and public.organization_application_is_editable(id)
);

create policy organization_members_select_relevant_or_reviewer
on public.organization_members for select
to authenticated
using (
  user_id = (select auth.uid())
  or public.is_organization_member(organization_id)
  or public.is_application_reviewer()
);

create policy organization_applications_select_member_or_reviewer
on public.organization_applications for select
to authenticated
using (
  public.is_organization_member(organization_id)
  or public.is_application_reviewer()
);

create policy organization_applications_update_manager_draft_fields
on public.organization_applications for update
to authenticated
using (
  public.can_manage_organization(organization_id)
  and status in ('draft', 'needs_changes')
)
with check (
  public.can_manage_organization(organization_id)
  and status in ('draft', 'needs_changes')
);

create policy tamil_community_details_select_member_or_reviewer
on public.organization_tamil_community_details for select
to authenticated
using (
  public.is_organization_member(organization_id)
  or public.is_application_reviewer()
);

create policy tamil_community_details_write_manager_editable
on public.organization_tamil_community_details for all
to authenticated
using (
  public.can_manage_organization(organization_id)
  and public.organization_application_is_editable(organization_id)
)
with check (
  public.can_manage_organization(organization_id)
  and public.organization_application_is_editable(organization_id)
);

create policy education_details_select_member_or_reviewer
on public.organization_education_details for select
to authenticated
using (
  public.is_organization_member(organization_id)
  or public.is_application_reviewer()
);

create policy education_details_write_manager_editable
on public.organization_education_details for all
to authenticated
using (
  public.can_manage_organization(organization_id)
  and public.organization_application_is_editable(organization_id)
)
with check (
  public.can_manage_organization(organization_id)
  and public.organization_application_is_editable(organization_id)
);

create policy healthcare_details_select_member_or_reviewer
on public.organization_healthcare_details for select
to authenticated
using (
  public.is_organization_member(organization_id)
  or public.is_application_reviewer()
);

create policy healthcare_details_write_manager_editable
on public.organization_healthcare_details for all
to authenticated
using (
  public.can_manage_organization(organization_id)
  and public.organization_application_is_editable(organization_id)
)
with check (
  public.can_manage_organization(organization_id)
  and public.organization_application_is_editable(organization_id)
);

create policy business_details_select_member_or_reviewer
on public.organization_business_details for select
to authenticated
using (
  public.is_organization_member(organization_id)
  or public.is_application_reviewer()
);

create policy business_details_write_manager_editable
on public.organization_business_details for all
to authenticated
using (
  public.can_manage_organization(organization_id)
  and public.organization_application_is_editable(organization_id)
)
with check (
  public.can_manage_organization(organization_id)
  and public.organization_application_is_editable(organization_id)
);

create policy nonprofit_details_select_member_or_reviewer
on public.organization_nonprofit_details for select
to authenticated
using (
  public.is_organization_member(organization_id)
  or public.is_application_reviewer()
);

create policy nonprofit_details_write_manager_editable
on public.organization_nonprofit_details for all
to authenticated
using (
  public.can_manage_organization(organization_id)
  and public.organization_application_is_editable(organization_id)
)
with check (
  public.can_manage_organization(organization_id)
  and public.organization_application_is_editable(organization_id)
);

create policy other_details_select_member_or_reviewer
on public.organization_other_details for select
to authenticated
using (
  public.is_organization_member(organization_id)
  or public.is_application_reviewer()
);

create policy other_details_write_manager_editable
on public.organization_other_details for all
to authenticated
using (
  public.can_manage_organization(organization_id)
  and public.organization_application_is_editable(organization_id)
)
with check (
  public.can_manage_organization(organization_id)
  and public.organization_application_is_editable(organization_id)
);

create policy user_roles_select_own_or_reviewer
on public.user_roles for select
to authenticated
using (user_id = (select auth.uid()) or public.is_application_reviewer());

create policy application_review_history_select_member_or_reviewer
on public.application_review_history for select
to authenticated
using (
  exists (
    select 1
    from public.organization_applications as application
    where application.id = application_review_history.application_id
      and public.is_organization_member(application.organization_id)
  )
  or public.is_application_reviewer()
);

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.organizations from anon, authenticated;
revoke all on table public.organization_members from anon, authenticated;
revoke all on table public.organization_applications from anon, authenticated;
revoke all on table public.organization_tamil_community_details from anon, authenticated;
revoke all on table public.organization_education_details from anon, authenticated;
revoke all on table public.organization_healthcare_details from anon, authenticated;
revoke all on table public.organization_business_details from anon, authenticated;
revoke all on table public.organization_nonprofit_details from anon, authenticated;
revoke all on table public.organization_other_details from anon, authenticated;
revoke all on table public.user_roles from anon, authenticated;
revoke all on table public.application_review_history from anon, authenticated;

grant select on table public.profiles to authenticated;
grant update (full_name, phone, country) on table public.profiles to authenticated;

grant select on table public.organizations to authenticated;
grant update (
  category,
  name,
  country,
  region,
  city,
  street_address,
  postal_code,
  official_email,
  official_phone,
  website,
  year_established,
  description,
  logo_path,
  registration_status,
  registration_number,
  registration_authority,
  registration_country
) on table public.organizations to authenticated;

grant select on table public.organization_members to authenticated;
grant select on table public.organization_applications to authenticated;
grant update (
  current_step,
  representative_full_name,
  representative_email,
  representative_phone,
  representative_designation,
  representative_relationship,
  authorization_declaration,
  accuracy_declaration
) on table public.organization_applications to authenticated;

grant select, insert, update, delete on table public.organization_tamil_community_details to authenticated;
grant select, insert, update, delete on table public.organization_education_details to authenticated;
grant select, insert, update, delete on table public.organization_healthcare_details to authenticated;
grant select, insert, update, delete on table public.organization_business_details to authenticated;
grant select, insert, update, delete on table public.organization_nonprofit_details to authenticated;
grant select, insert, update, delete on table public.organization_other_details to authenticated;
grant select on table public.user_roles to authenticated;
grant select on table public.application_review_history to authenticated;

-- Trusted server processes require explicit grants because automatic API
-- exposure is disabled. The service-role credential must never reach browser
-- code; these grants support controlled organisation and role administration.
grant select, insert, update, delete on table public.organizations to service_role;
grant select, insert, update, delete on table public.organization_members to service_role;
grant select, insert, update, delete on table public.user_roles to service_role;

revoke all on function public.handle_new_auth_user() from public, anon, authenticated;
revoke all on function public.clear_stale_category_details() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.ensure_category_matches_organization() from public, anon, authenticated;
revoke all on function public.is_application_reviewer() from public, anon;
revoke all on function public.is_organization_member(uuid) from public, anon;
revoke all on function public.can_manage_organization(uuid) from public, anon;
revoke all on function public.organization_application_is_editable(uuid) from public, anon;
revoke all on function public.create_organization_application_draft(public.organization_category) from public, anon;
revoke all on function public.submit_organization_application(uuid) from public, anon;
revoke all on function public.select_primary_organization(uuid) from public, anon;
revoke all on function public.review_organization_application(uuid, public.registration_status, text) from public, anon;

grant execute on function public.is_application_reviewer() to authenticated;
grant execute on function public.is_organization_member(uuid) to authenticated;
grant execute on function public.can_manage_organization(uuid) to authenticated;
grant execute on function public.organization_application_is_editable(uuid) to authenticated;
grant execute on function public.create_organization_application_draft(public.organization_category) to authenticated;
grant execute on function public.submit_organization_application(uuid) to authenticated;
grant execute on function public.select_primary_organization(uuid) to authenticated;
grant execute on function public.review_organization_application(uuid, public.registration_status, text) to authenticated;
