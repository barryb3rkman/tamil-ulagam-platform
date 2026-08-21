# Organisation enrollment MVP architecture

## Purpose

The first application layer implements the complete account, organisation enrollment, member-dashboard and administrative-review journey behind replaceable services. It extends the existing public website and design system; it does not replace the public experience or claim that a hosted enrollment service has been launched.

## Domain separation

A person and an organisation are separate records. The browser model follows this relationship:

```text
UserProfile
  -> OrganisationMembership
  -> Organisation
  -> OrganisationRegistration
```

Category-specific information is a discriminated union attached to the registration. Shared contracts live in `packages/shared/src/enrollment.ts`; database row mappers keep PostgreSQL naming and nullability out of visual components.

## Data boundary

Interactive components use asynchronous service interfaces for authentication, organisation details, registration and administration. Provider selection is centralized:

```text
React UI
  -> Platform provider
  -> service interfaces
     |-> Supabase services -> browser client -> Auth/PostgreSQL/RLS
     `-> mock services -> browser-local repository (development/tests)
```

When both public Supabase environment values are present, the provider uses the Supabase services. Without them, non-production development and automated tests use the mock repository. A production build without the values leaves enrollment unavailable with a clear message rather than silently accepting browser-local records.

Client-side role-aware presentation is not an authorization boundary. PostgreSQL RLS and restricted RPCs independently enforce organisation access, lifecycle changes, reviewer roles, and self-review prevention.

## Static hosting

All application routes remain compatible with the existing Next.js static export. Known mock registration identifiers remain exported for deterministic tests. Real UUID review links use the statically exported `/admin/registrations/review` route with a URL-encoded query parameter, so the existing host does not need runtime-generated paths.

## Current limitations

- The repository does not deploy or configure a hosted Supabase project.
- The generated schema contract in `apps/web/src/lib/supabase/database.types.ts` types the browser client, queries, RPCs, and mapper inputs. Regenerate it with `pnpm supabase:types` after every migration.
- `pnpm test:supabase` verifies Auth triggers, RLS, protected RPCs, lifecycle history, and all six category profiles against a freshly reset local PostgreSQL database. `pnpm test:e2e:supabase` exercises the complete applicant/reviewer browser journey against that same local stack.
- Browser sessions cannot be refreshed by middleware during static hosting. The Supabase browser client restores and refreshes its client session; a server-capable deployment should later add cookie-aware SSR deliberately.
- Reviewer/admin role grants require a privileged operational process and are never exposed through the browser.
- Mock records remain available only for development and deterministic tests when Supabase configuration is absent.
- No uploads, payments, member directory, Tamil ID issuance or initiative service is included.
