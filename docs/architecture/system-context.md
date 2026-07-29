# System context

## Purpose

Tamil Ulagam is intended to become a large global digital platform serving Tamil communities across countries. The first release is therefore the permanent public website foundation, not a temporary campaign site. Its route structure, content contracts, design tokens, accessibility foundation, and operational standards are expected to remain useful as later capabilities are introduced.

## Current boundary

The system currently contains one public Next.js application and reusable internal packages. It publishes reviewed public information and clearly labelled future direction. It has no database, identity provider, CMS, payment processor, member records, or transactional service.

```text
Public visitor
    |
    v
Next.js public website
    |-- typed public content
    |-- shared UI and design tokens
    |-- metadata, sitemap, and robots
    `-- development image fallbacks
```

No external runtime system is required in this phase.

## Future integration principles

Future identity, membership, chapters, organisations, events, and service domains must integrate behind explicit boundaries. They should add dedicated applications, packages, APIs, and persistence as their requirements mature without forcing a rewrite of the public routes or shared presentation foundation.

External systems must be treated as untrusted boundaries. Inputs require validation, sensitive operations require server-side authorization, secrets remain server-only, and personal data must not be collected before appropriate policy and controls exist.
