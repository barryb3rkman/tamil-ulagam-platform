# ADR 0001: Monorepo and modular architecture

- Status: Accepted
- Date: 2026-07-28

## Context

Tamil Ulagam begins with a public website but is expected to add multiple community and service domains over time. A single unstructured application would make later ownership, testing, and deployment boundaries harder to establish. Building distributed infrastructure now would introduce operational cost without validated requirements.

## Decision

Use a pnpm workspace and Turborepo monorepo. Keep the public Next.js application in `apps/web`, reusable UI in `packages/ui`, shared contracts in `packages/shared`, and engineering configuration in dedicated packages.

The current phase deliberately excludes a database and authentication. It has no transactional requirements, personal accounts, or approved data model. These capabilities will be introduced behind documented interfaces only when product, governance, privacy, and security requirements are known.

## Consequences

- The public website is a permanent application boundary rather than a disposable precursor.
- Shared contracts and design primitives can support future applications without copying.
- Quality commands run consistently across workspaces.
- Future services can integrate without rewriting the public website.
- Some package build and deployment decisions remain intentionally deferred.
