-- Phase F1: Federation Admin Operations V3 and partnership enquiries.
-- Existing registration and membership lifecycles remain authoritative.

create type public.partnership_area as enum (
  'strategic',
  'community',
  'education',
  'healthcare',
  'business',
  'events',
  'technology',
  'research',
  'sponsorship',
  'cultural',
  'other'
);

create type public.partnership_status as enum (
  'new',
  'in_discussion',
  'active',
  'declined'
);

create table public.partnership_enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  organization_name text not null default '',
  country text not null,
  partnership_area public.partnership_area not null,
  message text not null,
  status public.partnership_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint partnership_enquiries_name_length
    check (char_length(name) between 2 and 160),
  constraint partnership_enquiries_email_length
    check (char_length(email) between 3 and 320),
  constraint partnership_enquiries_email_format
    check (email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  constraint partnership_enquiries_organization_length
    check (char_length(organization_name) <= 240),
  constraint partnership_enquiries_country_length
    check (char_length(country) between 2 and 120),
  constraint partnership_enquiries_message_length
    check (char_length(message) between 20 and 3000)
);

create index partnership_enquiries_status_created_idx
  on public.partnership_enquiries (status, created_at desc);

create trigger partnership_enquiries_set_updated_at
before update on public.partnership_enquiries
for each row execute function public.set_updated_at();

create table public.partnership_enquiry_history (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references public.partnership_enquiries (id) on delete cascade,
  previous_status public.partnership_status,
  new_status public.partnership_status not null,
  actor_user_id uuid references auth.users (id) on delete set null,
  note text,
  created_at timestamptz not null default now(),
  constraint partnership_enquiry_history_note_length
    check (note is null or char_length(note) <= 2000)
);

create index partnership_enquiry_history_enquiry_idx
  on public.partnership_enquiry_history (enquiry_id, created_at desc);

alter table public.partnership_enquiries enable row level security;
alter table public.partnership_enquiry_history enable row level security;

revoke all on table public.partnership_enquiries from public, anon, authenticated;
revoke all on table public.partnership_enquiry_history from public, anon, authenticated;
grant select, insert, update, delete on table public.partnership_enquiries to service_role;
grant select, insert, update, delete on table public.partnership_enquiry_history to service_role;

create function public.get_federation_capabilities()
returns table (
  can_review_registrations boolean,
  can_operate_federation boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    public.is_application_reviewer(),
    public.is_platform_admin();
$$;

create function public.submit_partnership_enquiry(
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

create function public.list_admin_organization_operations()
returns table (
  id uuid,
  name text,
  kind text,
  category public.organization_category,
  subtype text,
  country text,
  region text,
  city text,
  description text,
  registration_status public.legal_registration_status,
  application_status public.registration_status,
  official_email_verified_at timestamptz,
  network_affiliated boolean,
  network_name text,
  manager_count bigint,
  member_count bigint,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'Federation administrator access is required.' using errcode = '42501';
  end if;

  return query
  select
    organization.id,
    organization.name,
    case
      when organization.category = 'tamil_community'
        and lower(btrim(coalesce(community.subtype, ''))) = 'tamil sangam'
        then 'sangam'
      else 'organisation'
    end,
    organization.category,
    coalesce(community.subtype, ''),
    organization.country,
    organization.region,
    organization.city,
    organization.description,
    organization.registration_status,
    application.status,
    organization.official_email_verified_at,
    community.network_affiliated,
    coalesce(community.network_name, ''),
    (select count(*) from public.organization_managers manager where manager.organization_id = organization.id),
    (select count(*) from public.organization_memberships membership where membership.organization_id = organization.id and membership.status = 'approved'),
    greatest(organization.updated_at, application.updated_at)
  from public.organizations organization
  join public.organization_applications application
    on application.organization_id = organization.id
  left join public.organization_tamil_community_details community
    on community.organization_id = organization.id
  order by greatest(organization.updated_at, application.updated_at) desc;
end;
$$;

create function public.list_admin_organization_managers(target_organization_id uuid)
returns table (
  id uuid,
  organization_id uuid,
  user_id uuid,
  full_name text,
  role public.organization_membership_role,
  granted_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'Federation administrator access is required.' using errcode = '42501';
  end if;

  return query
  select manager.id, manager.organization_id, manager.user_id,
    profile.full_name, manager.role, manager.granted_at
  from public.organization_managers manager
  join public.profiles profile on profile.id = manager.user_id
  where manager.organization_id = target_organization_id
  order by
    case manager.role when 'owner' then 1 when 'admin' then 2 else 3 end,
    profile.full_name;
end;
$$;

create function public.list_admin_membership_operations()
returns table (
  id uuid,
  organization_id uuid,
  organization_name text,
  organization_kind text,
  user_id uuid,
  member_full_name text,
  member_email text,
  status public.organization_membership_status,
  membership_type text,
  requested_at timestamptz,
  invited_at timestamptz,
  decided_at timestamptz,
  decided_by_name text,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'Federation administrator access is required.' using errcode = '42501';
  end if;

  return query
  select
    membership.id,
    membership.organization_id,
    organization.name,
    case
      when organization.category = 'tamil_community'
        and lower(btrim(coalesce(community.subtype, ''))) = 'tamil sangam'
        then 'sangam'
      else 'organisation'
    end,
    membership.user_id,
    member_profile.full_name,
    coalesce(member_auth.email::text, ''),
    membership.status,
    coalesce(membership.membership_type::text, 'general'),
    membership.requested_at,
    membership.invited_at,
    membership.decided_at,
    coalesce(decider_profile.full_name, ''),
    membership.created_at
  from public.organization_memberships membership
  join public.organizations organization on organization.id = membership.organization_id
  join public.profiles member_profile on member_profile.id = membership.user_id
  join auth.users member_auth on member_auth.id = membership.user_id
  left join public.profiles decider_profile on decider_profile.id = membership.decided_by
  left join public.organization_tamil_community_details community
    on community.organization_id = organization.id
  order by membership.created_at desc;
end;
$$;

create function public.list_admin_partnership_enquiries()
returns setof public.partnership_enquiries
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'Federation administrator access is required.' using errcode = '42501';
  end if;
  return query select enquiry.* from public.partnership_enquiries enquiry order by enquiry.created_at desc;
end;
$$;

create function public.list_admin_partnership_history(target_enquiry_id uuid)
returns table (
  id uuid,
  enquiry_id uuid,
  previous_status public.partnership_status,
  new_status public.partnership_status,
  actor_user_id uuid,
  actor_name text,
  note text,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'Federation administrator access is required.' using errcode = '42501';
  end if;
  return query
  select history.id, history.enquiry_id, history.previous_status,
    history.new_status, history.actor_user_id,
    coalesce(profile.full_name, 'Public enquiry'), coalesce(history.note, ''),
    history.created_at
  from public.partnership_enquiry_history history
  left join public.profiles profile on profile.id = history.actor_user_id
  where history.enquiry_id = target_enquiry_id
  order by history.created_at desc;
end;
$$;

create function public.transition_partnership_enquiry(
  target_enquiry_id uuid,
  target_status public.partnership_status,
  transition_note text default null
)
returns public.partnership_enquiries
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  current_enquiry public.partnership_enquiries;
  updated_enquiry public.partnership_enquiries;
  normalized_note text := nullif(btrim(coalesce(transition_note, '')), '');
begin
  if not public.is_platform_admin() then
    raise exception 'Federation administrator access is required.' using errcode = '42501';
  end if;

  select * into current_enquiry
  from public.partnership_enquiries
  where id = target_enquiry_id
  for update;

  if current_enquiry.id is null then
    raise exception 'Partnership enquiry not found.' using errcode = 'P0002';
  end if;

  if not (
    (current_enquiry.status = 'new' and target_status = 'in_discussion')
    or (current_enquiry.status = 'in_discussion' and target_status in ('active', 'declined'))
  ) then
    raise exception 'This partnership status transition is not permitted.' using errcode = '22023';
  end if;

  if target_status = 'declined' and normalized_note is null then
    raise exception 'A reason is required when declining an enquiry.' using errcode = '22023';
  end if;
  if normalized_note is not null and char_length(normalized_note) > 2000 then
    raise exception 'The note is too long.' using errcode = '22023';
  end if;

  update public.partnership_enquiries
  set status = target_status
  where id = target_enquiry_id
  returning * into updated_enquiry;

  insert into public.partnership_enquiry_history (
    enquiry_id, previous_status, new_status, actor_user_id, note
  ) values (
    target_enquiry_id, current_enquiry.status, target_status,
    current_user_id, normalized_note
  );

  return updated_enquiry;
end;
$$;

create function public.get_admin_attention_summary()
returns table (
  registration_reviews bigint,
  registration_follow_ups bigint,
  pending_memberships bigint,
  new_partnership_enquiries bigint,
  verified_organizations bigint,
  verified_sangams bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'Federation administrator access is required.' using errcode = '42501';
  end if;
  return query
  select
    (select count(*) from public.organization_applications where status in ('submitted', 'under_review')),
    (select count(*) from public.organization_applications where status = 'needs_changes'),
    (select count(*) from public.organization_memberships where status = 'pending'),
    (select count(*) from public.partnership_enquiries where status = 'new'),
    (select count(*)
      from public.organization_applications application
      join public.organizations organization on organization.id = application.organization_id
      left join public.organization_tamil_community_details community on community.organization_id = organization.id
      where application.status = 'verified'
        and not (organization.category = 'tamil_community' and lower(btrim(coalesce(community.subtype, ''))) = 'tamil sangam')),
    (select count(*)
      from public.organization_applications application
      join public.organizations organization on organization.id = application.organization_id
      join public.organization_tamil_community_details community on community.organization_id = organization.id
      where application.status = 'verified'
        and organization.category = 'tamil_community'
        and lower(btrim(community.subtype)) = 'tamil sangam');
end;
$$;

create function public.list_admin_recent_activity(activity_limit integer default 12)
returns table (
  id uuid,
  domain text,
  title text,
  description text,
  status text,
  occurred_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'Federation administrator access is required.' using errcode = '42501';
  end if;
  if activity_limit not between 1 and 50 then
    raise exception 'Activity limit must be between 1 and 50.' using errcode = '22023';
  end if;

  return query
  select activity.id, activity.domain, activity.title, activity.description,
    activity.status, activity.occurred_at
  from (
    select history.id, 'registration'::text as domain,
      organization.name as title,
      'Registration decision recorded'::text as description,
      history.new_status::text as status,
      history.created_at as occurred_at
    from public.application_review_history history
    join public.organization_applications application on application.id = history.application_id
    join public.organizations organization on organization.id = application.organization_id
    union all
    select history.id, 'membership'::text,
      organization.name,
      coalesce(profile.full_name, 'Member') || ' membership updated',
      history.new_status::text,
      history.created_at
    from public.organization_membership_history history
    join public.organization_memberships membership on membership.id = history.membership_id
    join public.organizations organization on organization.id = membership.organization_id
    left join public.profiles profile on profile.id = membership.user_id
    union all
    select history.id, 'partnership'::text,
      coalesce(nullif(enquiry.organization_name, ''), enquiry.name),
      'Partnership enquiry updated'::text,
      history.new_status::text,
      history.created_at
    from public.partnership_enquiry_history history
    join public.partnership_enquiries enquiry on enquiry.id = history.enquiry_id
  ) activity
  order by activity.occurred_at desc
  limit activity_limit;
end;
$$;

revoke all on function public.get_federation_capabilities() from public, anon;
revoke all on function public.submit_partnership_enquiry(text, text, text, text, public.partnership_area, text) from public, authenticated;
revoke all on function public.list_admin_organization_operations() from public, anon;
revoke all on function public.list_admin_organization_managers(uuid) from public, anon;
revoke all on function public.list_admin_membership_operations() from public, anon;
revoke all on function public.list_admin_partnership_enquiries() from public, anon;
revoke all on function public.list_admin_partnership_history(uuid) from public, anon;
revoke all on function public.transition_partnership_enquiry(uuid, public.partnership_status, text) from public, anon;
revoke all on function public.get_admin_attention_summary() from public, anon;
revoke all on function public.list_admin_recent_activity(integer) from public, anon;

grant execute on function public.get_federation_capabilities() to authenticated;
grant execute on function public.submit_partnership_enquiry(text, text, text, text, public.partnership_area, text) to anon, authenticated;
grant execute on function public.list_admin_organization_operations() to authenticated;
grant execute on function public.list_admin_organization_managers(uuid) to authenticated;
grant execute on function public.list_admin_membership_operations() to authenticated;
grant execute on function public.list_admin_partnership_enquiries() to authenticated;
grant execute on function public.list_admin_partnership_history(uuid) to authenticated;
grant execute on function public.transition_partnership_enquiry(uuid, public.partnership_status, text) to authenticated;
grant execute on function public.get_admin_attention_summary() to authenticated;
grant execute on function public.list_admin_recent_activity(integer) to authenticated;
