-- Phase H8 — Realtime for the surfaces that genuinely change under you.
--
-- The `supabase_realtime` publication existed but carried no tables, so
-- every screen was refetch-on-navigate only: a manager watching their
-- People queue never saw a new affiliation claim arrive, and an
-- applicant never saw their registration flip to verified without a
-- reload.
--
-- Deliberately NOT every table. Realtime `postgres_changes` is filtered
-- by the same RLS policies as a normal read, so adding a table here does
-- not leak rows — but it does open a change stream per subscribed
-- client, and most tables have nothing a user is waiting on. These three
-- are the ones where someone is genuinely watching for an update:
--
--   organization_memberships   an affiliation claim arriving for a
--                              manager to confirm, and that decision
--                              landing for the member who made it
--   organization_applications  a registration moving through federation
--                              review
--   organization_managers      a management grant or invitation being
--                              added, changed or removed
--
-- Not included on purpose: profiles (nobody waits on someone else's
-- name), organization_membership_history (an audit trail read on
-- demand), organizations and its category detail tables (edited by the
-- same person who is looking at them).

alter publication supabase_realtime add table public.organization_memberships;
alter publication supabase_realtime add table public.organization_applications;
alter publication supabase_realtime add table public.organization_managers;

-- REPLICA IDENTITY FULL so an UPDATE payload carries the old row as well
-- as the new one, and a DELETE carries more than the primary key. The
-- client hook refetches through the normal service layer rather than
-- trusting the payload, but a partial payload also means the row cannot
-- be matched against a client-side filter, which would make
-- `filter: "organization_id=eq.<id>"` silently miss updates.
alter table public.organization_memberships replica identity full;
alter table public.organization_applications replica identity full;
alter table public.organization_managers replica identity full;
