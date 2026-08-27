# System context

## Purpose

Tamil Ulagam is intended to become a large global digital platform serving Tamil communities across countries. The first release is therefore the permanent public website foundation, not a temporary campaign site. Its route structure, content contracts, design tokens, accessibility foundation, and operational standards are expected to remain useful as later capabilities are introduced.

## Current boundary

The system contains one statically exported Next.js application, reusable internal packages, and an organisation-enrollment application layer that can use Supabase Auth and PostgreSQL through a browser-safe service boundary. The repository includes the database migration, RLS rules, restricted lifecycle functions, and deterministic mock services for automated tests and development without Supabase. No hosted database is linked or changed by the repository itself.

The Federation Admin operations layer composes registration reviews, operational Organisation/Tamil Sangam directories, membership escalation, partnership enquiries and immutable lifecycle activity through typed services and narrow Supabase projections. Reviewer and Federation Admin responsibilities remain explicitly distinct.

```text
Public visitor
    |
    v
Next.js public website
    |-- typed public content
    |-- shared UI and design tokens
    |-- metadata, sitemap, and robots
    `-- development image fallbacks

Enrollment user
    |
    v
Enrollment application layer
    |-- typed user, membership, organisation and registration contracts
    |-- replaceable service interfaces
    |-- Supabase Auth and RLS-protected PostgreSQL runtime when configured
    `-- versioned browser-local mock repository in development/tests only
```

Public routes need no external runtime. Enrollment routes require the public Supabase URL and publishable key in a production build; without them the application reports an explicit configuration error. Browser code never receives a service-role key.

## Future integration principles

Future identity, membership, chapters, organisations, events, and service domains must integrate behind explicit boundaries. They should add dedicated applications, packages, APIs, and persistence as their requirements mature without forcing a rewrite of the public routes or shared presentation foundation.

External systems must be treated as untrusted boundaries. Inputs require validation, sensitive operations require server-side authorization, secrets remain server-only, and personal data must not be collected before appropriate policy and controls exist.
