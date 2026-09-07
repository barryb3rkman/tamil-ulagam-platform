-- Partnership enquiries arrive from the public contact form, which means the
-- federation admin watching /admin/partnerships is waiting on a row written by
-- someone who is not signed in at all. That is the clearest "someone is
-- genuinely watching" case there is, and it was the one queue still requiring
-- a reload to see new work.
--
-- The reasoning in 20260902000000_realtime_publication.sql still holds for
-- everything left out: realtime is added where a person is waiting, not
-- everywhere it would technically work.

alter publication supabase_realtime add table public.partnership_enquiries;

-- Same reason as the other published tables: a partial UPDATE payload cannot
-- be matched against a client-side filter, and DELETE would carry only the key.
alter table public.partnership_enquiries replica identity full;
