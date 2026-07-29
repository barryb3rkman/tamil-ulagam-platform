# Repository structure

```text
apps/
  web/                 Public Next.js application
packages/
  ui/                  Reusable accessible presentation primitives
  shared/              Shared domain and content contracts
  config-eslint/       Shared lint configuration
  config-typescript/   Shared strict TypeScript configuration
docs/
  architecture/        System boundaries and structure
  decisions/           Architecture decision records
  design/              Visual system and asset contracts
  product/             Product scope and availability
  security/            Security principles and later controls
  operations/          Local and delivery procedures
```

## Boundary rules

- `apps/web` owns public routes, site content, navigation, metadata, and federation-specific layout components.
- `packages/ui` owns reusable visual primitives that do not encode product claims or route content.
- `packages/shared` owns TypeScript contracts that can be consumed by future applications and services.
- Configuration packages provide one strict baseline instead of allowing applications to drift.
- Documentation records intent before new platform boundaries are introduced.

Packages currently export TypeScript source and are transpiled by Next.js. This keeps the initial system simple. A package build and publishing pipeline can be introduced only when another deployment consumer requires it.
