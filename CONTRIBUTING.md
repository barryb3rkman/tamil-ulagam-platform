# Tamil Ulagam Engineering Rules

These rules apply to every task and every file in this repository.

## Scope and architecture

- Treat this repository as the permanent foundation of a production global platform.
- Preserve the monorepo's modular boundaries. Shared domain contracts belong in `packages/shared`, reusable presentation primitives in `packages/ui`, shared tooling in the configuration packages, and product-specific code in its owning application.
- Never silently change architecture. Record material decisions in `docs/decisions` and explain the migration path.
- Do not add dependencies without a documented, task-specific justification.
- Do not introduce a database, authentication, payments, a CMS, or other platform services without an explicit scoped decision.
- When a database is introduced, every database change must use a reviewed migration.
- Do not duplicate content, configuration, or asset paths. Maintain a typed source of truth.
- Never make destructive repository changes without explicit instruction.

## TypeScript and application code

- TypeScript strict mode is mandatory.
- Do not use `any` without explicit, local, documented justification. Prefer `unknown` with validation and narrowing.
- Validate every external input at the trust boundary.
- Prefer React Server Components. Use Client Components only when browser interaction or browser-only APIs require them, not for convenience.
- Keep components focused, semantic, and maintainable. Avoid abstractions that do not yet serve a real use case.
- Never expose secrets to browser code. Only values intentionally public may use the `NEXT_PUBLIC_` prefix.
- Never commit environment secrets.
- Enforce authorization server-side when authorization is introduced. Client-side visibility is never an authorization boundary.

## Content, design, and accessibility

- Never claim a planned feature is available.
- Never invent partners, members, statistics, awards, testimonials, outcomes, endorsements, or availability.
- Preserve accessibility and keyboard operation. Use semantic HTML, visible focus states, appropriate landmarks, meaningful accessible names, and sufficient contrast.
- Maintain responsive behaviour across supported viewport sizes.
- Keep English and Tamil typography independently configurable through the shared font tokens.
- Reference images only through the typed central image registry.

## Quality and documentation

- Add or update tests whenever behaviour changes.
- Update relevant architecture, product, design, security, or operations documentation with material changes.
- Before completion, run `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`.
- Run relevant Playwright smoke tests for changes that affect public routes or navigation.
- Report failures honestly. Do not claim a check ran when it was skipped or unavailable.
- Keep commits focused if the user explicitly asks for commits. Never commit automatically.
