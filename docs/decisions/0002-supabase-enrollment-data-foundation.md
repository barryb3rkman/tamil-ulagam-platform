# ADR 0002: Supabase enrollment data foundation

- Status: Accepted
- Date: 2026-08-21

## Context

The organisation-enrollment MVP separates people, organisations, memberships, applications, and category details in its TypeScript model. Its permanent runtime needs managed authentication, PostgreSQL migrations, relational authorization, and row-level access control without redesigning the completed frontend.

The public site currently deploys as a GitHub Pages static export. Cookie-based server rendering cannot be introduced without changing that runtime.

## Decision

Use Supabase Auth as the identity source and PostgreSQL migrations under `supabase/migrations` as the schema source of truth. Preserve independent `profiles`, `organizations`, `organization_members`, and `organization_applications` records. Store category details in one-to-one tables and record lifecycle transitions in append-only review history.

Enable RLS on every public application table. Membership and controlled `user_roles` relationships provide authorization; user-editable metadata does not. Use narrowly scoped, permission-restricted database functions for transactional draft creation, submission, and administrative status transitions.

During the static-export phase, use an on-demand browser client behind the existing services. Select Supabase when both public environment values are configured, retain the mock implementation for deterministic tests and unconfigured non-production development, and fail explicitly when a production build lacks configuration. Defer cookie-aware server clients until the hosting runtime is deliberately migrated.

## Consequences

- The data model supports multiple representatives per organisation and multiple organisations per user without changing the UI model.
- Draft rows may be incomplete; submission is the transactional completeness boundary.
- Administrative role assignment requires a privileged operational path that is not exposed to normal clients.
- Generated database types require a running local Supabase stack or a deliberately linked project.
- Static hosting relies on browser-managed Supabase sessions; SSR session refresh and server-rendered route guards require a later hosting decision.
- Production enrollment builds must provide the public URL and publishable key and must complete hosted-project, email, abuse-control, legal, and operational review before launch.
