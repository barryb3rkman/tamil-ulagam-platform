# Initial security principles

## Current posture

The public application still has no payments, uploads, or server-side rendering of personal data. The organisation-enrollment layer now has a selectable Supabase runtime: when public Supabase configuration is present, authentication and application records are handled by Supabase Auth and RLS-protected PostgreSQL. Deterministic mock records remain available only when configuration is absent in non-production development and tests.

The repository does not itself deploy, link, seed, or approve a hosted project. Code readiness must not be interpreted as a public launch. The migration, RLS policies, Auth trigger, lifecycle RPCs, generated types, and browser journey are verified against local Supabase. Email delivery, abuse prevention, production role provisioning, privacy/legal readiness, backups, incident response, monitoring, and retention remain deployment gates.

## Required principles

- Treat route parameters, environment variables, request data, and future external responses as untrusted input.
- Validate input at server trust boundaries and encode output safely.
- Keep secrets in server-managed environment storage and never in `NEXT_PUBLIC_` variables or browser bundles.
- Never commit secrets or production credentials.
- Keep dependencies pinned in the lockfile and review dependency changes.
- Maintain strict TypeScript, linting, tests, and production builds in continuous integration.
- Preserve framework security defaults and add response security headers with the hosting architecture.
- Minimise collection and retention of personal information.
- Keep identity threats, session strategy, recovery, abuse controls, and audit requirements documented and reviewed before launch.
- Never represent client-side route hiding, mock state, or reviewer presentation as an authorization boundary.
- Use the mock provider only for development and automated tests; never accept production enrollment data into local browser storage.
- When authorization exists, enforce it on the server for every protected operation.
- When a database exists, use reviewed migrations, least-privilege credentials, backups, and restore testing.

## Supabase enrollment controls

- RLS is enabled on every public enrollment table; explicit policies and column grants constrain data access.
- `auth.uid()` and relational membership checks determine ownership. Client-supplied user identifiers do not grant access.
- Application-wide roles live in the write-protected `user_roles` table, not profile or auth metadata.
- Normal clients cannot add organisation memberships, grant roles, insert review history, or directly write review-state columns.
- Submission and review transitions use restricted database functions so validation, authorization, state change, and history insertion share one transaction.
- All `SECURITY DEFINER` functions set an empty search path, schema-qualify referenced objects, and revoke public/anonymous execution.
- The publishable key is expected in browser configuration and is safe only in combination with correct RLS. Service-role keys, database passwords, and access tokens remain server-side secrets and must never use a `NEXT_PUBLIC_` name.
- Automatic API exposure is disabled. Narrow `service_role` table grants exist only for trusted organisation, membership, and reviewer-role provisioning; local test runners keep that credential in process memory.
- Reviewer and admin grants require a privileged, audited UUID-and-email verification procedure. Browser code and editable profile metadata cannot provision or revoke roles; see `docs/operations/privileged-role-provisioning.md`.

Privacy notices, terms, incident response ownership, vulnerability reporting, logging policy, content security policy, and deployment controls must be completed before production launch. Healthcare, payment, identity, and employment domains require additional specialist threat modelling before implementation.
