# Initial security principles

## Current posture

The public foundation is intentionally low-data: it provides no accounts, forms, payments, uploads, or database. This reduces the initial attack surface but does not remove the need for secure engineering.

## Required principles

- Treat route parameters, environment variables, request data, and future external responses as untrusted input.
- Validate input at server trust boundaries and encode output safely.
- Keep secrets in server-managed environment storage and never in `NEXT_PUBLIC_` variables or browser bundles.
- Never commit secrets or production credentials.
- Keep dependencies pinned in the lockfile and review dependency changes.
- Maintain strict TypeScript, linting, tests, and production builds in continuous integration.
- Preserve framework security defaults and add response security headers with the hosting architecture.
- Minimise collection and retention of personal information.
- Before authentication exists, document identity threats, session strategy, recovery, abuse controls, and audit requirements.
- When authorization exists, enforce it on the server for every protected operation.
- When a database exists, use reviewed migrations, least-privilege credentials, backups, and restore testing.

Privacy notices, terms, incident response ownership, vulnerability reporting, logging policy, content security policy, and deployment controls must be completed before production launch. Healthcare, payment, identity, and employment domains require additional specialist threat modelling before implementation.
