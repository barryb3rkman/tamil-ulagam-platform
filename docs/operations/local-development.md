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

`NEXT_PUBLIC_SITE_URL` is the canonical public origin used by metadata, robots, and sitemap generation. It is intentionally public and must contain a valid absolute URL. Do not place secrets in any `NEXT_PUBLIC_` variable.

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

## Images

Place approved PNG files only in the documented directories under `apps/web/public/images/tamil-ulagam`. Then review the corresponding alt text and set `available: true` for that registry entry. Until then, `ImageWithFallback` maintains layout without requesting a missing file.
