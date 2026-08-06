# Tamil Ulagam Platform

Production-grade monorepo foundation for Tamil Ulagam Global Federation's permanent public website and future digital services.

The current release establishes the public application shell, route and content architecture, shared design system, typed image registry, documentation, and quality gates. It deliberately does not include a database, authentication, payments, a CMS, or member services.

## Requirements

- Node.js 24 LTS
- pnpm 11.17.0

## Start locally

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://localhost:3000`.

## Quality commands

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

See [local development](docs/operations/local-development.md), [GitHub Pages deployment](docs/deployment/github-pages.md), [repository structure](docs/architecture/repository-structure.md), and [public website scope](docs/product/public-website-scope.md) for details.
