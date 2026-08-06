# GitHub Pages deployment

## Purpose and scope

GitHub Pages publishes the Tamil Ulagam public website as a static showcase. The export contains the approved public routes, styles, scripts, fonts and image assets. It does not provide server-side forms, authentication, databases, payments, member records, Tamil ID issuance or administration.

Private project sources, local environment files and review artifacts are excluded from version control and from the Pages artifact.

## Static export architecture

The web application uses Next.js App Router with `output: "export"`, `trailingSlash: true` and unoptimized `next/image` output. Static generation emits the site to `apps/web/out`. The dynamic initiative route supplies `generateStaticParams`, so all eight approved initiative pages are emitted at build time.

The deployment requires Node.js 24 and pnpm 11.17.0.

### Root-path build

```bash
NEXT_PUBLIC_BASE_PATH="" \
NEXT_PUBLIC_SITE_URL="http://localhost:3000" \
pnpm build
```

### GitHub Pages project-site build

```bash
NEXT_PUBLIC_BASE_PATH="/tamil-ulagam-platform" \
NEXT_PUBLIC_SITE_URL="https://OWNER.github.io/tamil-ulagam-platform" \
pnpm build:pages
```

`NEXT_PUBLIC_BASE_PATH` controls framework routes and the shared public-asset path helper. Root hosting uses an empty value. Project-site hosting uses `/tamil-ulagam-platform`. `NEXT_PUBLIC_SITE_URL` is the complete canonical public site URL, including the repository path for project-site hosting. It drives `metadataBase`, canonical links, Open Graph URLs, the sitemap and the robots sitemap reference.

An `assetPrefix` is intentionally not used. Next.js `basePath` handles framework assets and navigation, while the shared asset helper prefixes public-folder images exactly once. Images remain responsive and retain their approved dimensions, loading priority, quality settings and object positions; static export disables the server image optimizer.

## Routes and 404 behavior

Trailing slashes produce directory-based routes such as `out/about/index.html`. Direct navigation and refresh therefore work at URLs such as `/tamil-ulagam-platform/about/`, `/tamil-ulagam-platform/roadmap/` and `/tamil-ulagam-platform/privacy/`.

Next.js emits `apps/web/out/404.html` from the existing not-found experience. The deployment does not use an SPA fallback and does not redirect unknown routes to the homepage.

## Workflow

The workflow is [.github/workflows/deploy-pages.yml](../../.github/workflows/deploy-pages.yml). It runs on pushes to `main` and can also be started manually with `workflow_dispatch` from the Actions interface or with:

```bash
gh workflow run "Deploy GitHub Pages"
```

Inspect recent runs with:

```bash
gh run list --workflow="Deploy GitHub Pages"
gh run watch RUN_ID
```

The workflow uses least-privilege repository permissions: `contents: read`, `pages: write` and `id-token: write`. Its build job installs the frozen lockfile, checks formatting, lint and types, runs unit tests, builds and verifies the export, then uploads only `apps/web/out`. The deploy job consumes that Pages artifact through the `github-pages` environment.

Official action releases were verified for this configuration. The current majors are `actions/checkout@v6`, `actions/configure-pages@v6`, `actions/setup-node@v6`, `actions/cache@v6`, `actions/upload-pages-artifact@v5` and `actions/deploy-pages@v5`. The Pages action majors are newer than earlier deployment guidance because their current releases use the maintained Node.js 24 action runtime.

## Repository settings

The repository must be public, use `main` as its default branch, and set Pages publishing to GitHub Actions. No `gh-pages` branch, branch-folder publishing source, custom domain or `CNAME` file is used. A successful deployment creates or updates the `github-pages` environment and exposes its HTTPS URL in the deployment job.

## Rollback

Use a normal Git revert workflow:

1. Identify the defective deployment commit.
2. Create a revert commit without rewriting history.
3. Run the full local validation suite.
4. Push the revert to `main` normally.
5. Allow the Pages workflow to redeploy the prior configuration.

Do not force-push as a standard rollback method.

## Future custom domain or server hosting

A later custom-domain release should configure the verified domain in repository settings, add the required DNS records and `CNAME`, set `NEXT_PUBLIC_BASE_PATH` to an empty value, and set `NEXT_PUBLIC_SITE_URL` to the final HTTPS origin. These steps require a separate approved task.

Features that require request-time execution are unsupported on this deployment: authentication, protected member data, databases, API routes, server actions, runtime form handling, payments and administration. If those capabilities are introduced, the application can move to server-capable hosting while preserving the public route and component boundaries.

## Current limitations

- Google Fonts are downloaded by the Next.js font system at build time, so builds require temporary network access to the font provider.
- Contact and participation actions remain informational; no server-side submission exists.
- GitHub Pages is a static project site under the repository base path until a separately approved custom-domain migration.
