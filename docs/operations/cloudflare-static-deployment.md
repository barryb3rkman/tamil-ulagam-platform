# Cloudflare static deployment

Tamil Ulagam remains a static Next.js export. Cloudflare Pages must build at the repository root with Node 24 and pnpm 11.17.0, run `pnpm build`, and publish `apps/web/out`. The root `wrangler.toml` records only the static output directory; it does not contain an account, project identifier, domain, or credential.

## Environment matrix

Configure Preview and Production independently. Never copy local Supabase keys into either environment.

| Variable                               | Preview                                             | Production                                      |
| -------------------------------------- | --------------------------------------------------- | ----------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                 | exact preview origin                                | canonical custom-domain origin                  |
| `NEXT_PUBLIC_BASE_PATH`                | empty for a root-domain deployment                  | empty for a root-domain deployment              |
| `NEXT_PUBLIC_ENROLLMENT_BACKEND`       | `supabase`                                          | `supabase`                                      |
| `NEXT_PUBLIC_SUPABASE_URL`             | dedicated staging project URL                       | production project URL, only after approval     |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | staging publishable key                             | production publishable key, only after approval |
| `NEXT_PUBLIC_AUTH_CAPTCHA_PROVIDER`    | empty until enabled, then `turnstile` or `hcaptcha` | matching enabled provider                       |
| `NEXT_PUBLIC_AUTH_CAPTCHA_SITE_KEY`    | matching public site key                            | matching public site key                        |

These are browser-public values. A Supabase service-role key, CAPTCHA secret, SMTP password, or Cloudflare API token must never use a `NEXT_PUBLIC_` name or enter the static build output.

## Build and route checks

1. Use the repository-pinned Node and pnpm versions.
2. Install with `pnpm install --frozen-lockfile`.
3. Run `pnpm build`.
4. Confirm `apps/web/out/auth/callback/index.html` exists alongside the other application routes.
5. Serve `apps/web/out` locally and run the Pages-mode Playwright suite before the first preview deployment.

Static routes use trailing slashes. Cloudflare must serve generated `index.html` files for direct navigation, including `/auth/callback/`. No Worker, middleware, route handler, Server Action, or server-side session refresh is part of this phase.

## Custom domain and Auth callbacks

Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS origin without a trailing slash. Keep `NEXT_PUBLIC_BASE_PATH` empty for a root-domain deployment. Add the exact origin and `/auth/callback/` return URL to the Supabase Auth redirect allowlist before testing email confirmation or recovery. Preview origins require their own narrow allowlist entries; do not use an unrestricted wildcard for production.

The browser client uses PKCE. Default Supabase confirmation/recovery links should be opened in the browser that initiated the request. For reliable cross-device email links, configure the token-hash templates described in the hosted Auth checklist; the callback service supports both verified token hashes and the normal PKCE code return.
