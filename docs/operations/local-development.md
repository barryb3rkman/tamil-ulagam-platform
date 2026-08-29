# Local development

## Prerequisites

- Node.js 24 LTS, as pinned by `.nvmrc` and `.node-version`
- pnpm 11.17.0, as pinned by `packageManager`

## Install and run

```bash
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

The public application is available at `http://localhost:3000`.

`NEXT_PUBLIC_SITE_URL` is the canonical public origin used by metadata, robots, and sitemap generation. Enrollment backend selection is explicit: use `NEXT_PUBLIC_ENROLLMENT_BACKEND=mock` only for development/test, or `NEXT_PUBLIC_ENROLLMENT_BACKEND=supabase` with both public Supabase values. Never place the service-role key, database password, CLI access token, or another secret in a `NEXT_PUBLIC_` variable.

## Local Supabase foundation

Docker must be installed and running before starting the local Supabase services. The repository-pinned CLI reads `supabase/config.toml` and applies the committed migrations.

```bash
pnpm supabase:start
pnpm supabase:db:reset
pnpm supabase:db:lint
pnpm supabase:types
pnpm supabase:status
pnpm test:supabase
pnpm test:e2e:supabase
```

Copy the local API URL and publishable key reported by `pnpm supabase:status` into an ignored `.env.local`. Never commit the generated local credentials. `pnpm supabase:types` regenerates and formats `apps/web/src/lib/supabase/database.types.ts` from the local schema; run it after each migration and review the diff.

`pnpm test:supabase` resets the local database and runs the real Auth, RLS, and RPC integration suite with isolated users. `pnpm test:e2e:supabase` resets it again and runs the complete applicant/reviewer browser journey against local Supabase. Both runners obtain local credentials from `supabase status` in process memory; they do not write secrets into application environment files. They never link or contact a hosted Supabase project.

Mock mode must be selected explicitly and is rejected in production. Missing or partial production configuration shows a closed, unavailable enrollment state rather than silently using browser storage. To exercise real auth, drafts, resubmission, review actions, and RLS locally, start Supabase and select `supabase` with both public values before starting Next.js.

Hosted activation is covered by the [Cloudflare static deployment](./cloudflare-static-deployment.md), [hosted Auth checklist](./supabase-hosted-auth-checklist.md), [staging runbook](./supabase-staging-runbook.md), and [privileged-role procedure](./privileged-role-provisioning.md).

Stop the local containers when they are no longer needed:

```bash
pnpm supabase:stop
```

These commands target the local stack. Do not link, push, reset, or repair a hosted Supabase project without a separate reviewed deployment procedure.

## Quality checks

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Playwright requires its Chromium binary:

```bash
pnpm exec playwright install chromium
```

CI installs with a frozen lockfile and runs formatting, linting, type-checking, unit tests, and the production build. Browser smoke tests are available for local or dedicated browser-enabled CI execution.

## Development cache maintenance

Turbo's local cache (`.turbo/cache`) has no built-in size limit and grows with every `build`/`lint`/`typecheck`/`test` run; left unattended over enough sessions it can reach tens of gigabytes. `build`, `lint`, `typecheck`, and `test` each run a small guard (`scripts/maintenance/prune-dev-cache.mjs`) first: silent under 3 GB, a one-line warning between 3–5 GB, and automatic pruning of the oldest cache entries back to ~2 GB at 5 GB — never a blanket delete of the whole cache. Check the current size any time with `pnpm cache:check`, or prune on demand with `pnpm cache:prune`. Deleting `.turbo` entirely is always safe — it is a pure build/task-output cache, nothing is lost, and it will regenerate on the next run.

`pnpm clean:test-artifacts` empties `apps/web/playwright-report`, `apps/web/test-results`, `apps/web/coverage`, and `artifacts/` — run it by hand when you want to clear out old QA output; nothing calls it automatically.

Neither command ever touches Docker or Supabase volumes, `node_modules`, or any tracked source file.

## Images

Place approved PNG files only in the documented directories under `apps/web/public/images/tamil-ulagam`. Then review the corresponding alt text and set `available: true` for that registry entry. Until then, `ImageWithFallback` maintains layout without requesting a missing file.
