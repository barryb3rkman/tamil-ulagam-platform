-- Fix for a real gap found while exercising Phase A1's owner-safety guard:
-- protect_last_organization_owner() (20260825000000) correctly blocks
-- removing/demoting an organisation's last owner while that organisation
-- still exists, but it also fired — incorrectly — when the owner's
-- organization_managers row was removed only because the *organisation
-- itself* was being deleted (an ON DELETE CASCADE from organizations).
-- There is no "must retain an owner" invariant left to protect once the
-- organisation is gone, so that case must be allowed through. Additive,
-- narrow: only this one function is replaced.

create or replace function public.protect_last_organization_owner()
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

  -- The owning organisation no longer exists (this row is being removed
  -- as part of deleting it entirely) — nothing left to protect.
  if not exists (
    select 1 from public.organizations where id = target_organization_id
  ) then
    if tg_op = 'DELETE' then
      return old;
    end if;
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
