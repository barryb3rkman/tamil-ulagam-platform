# Supabase organisation enrollment foundation

## Scope and current runtime

This foundation translates the organisation-enrollment domain into a PostgreSQL migration and a Supabase-backed implementation of the existing application services. It preserves the enrollment user experience and static export. It does not deploy or link a hosted project, grant production reviewer roles, or by itself make enrollment operational.

The target boundary is:

```text
UI
  -> enrollment runtime service interfaces
  -> Supabase service implementation
  -> Supabase Auth and PostgreSQL with RLS
```

Provider selection is centralized in `platform-provider.tsx`. With both public Supabase values configured, it instantiates the singleton browser client and the Supabase services. Without them, tests and non-production development use `BrowserMockStateRepository`; production has no local-storage fallback and reports an explicit configuration error.

## Frontend source-of-truth audit

The product model is defined in `packages/shared/src/enrollment.ts`.

### Account and membership

- `UserProfile`: `id`, `fullName`, authoritative auth `email`, `phone`, `country`, `createdAt`.
- `OrganisationMembership`: `id`, `userId`, `organisationId`, `role`, `isPrimary`, `createdAt`.
- Membership roles: `owner`, `admin`, `representative`.

The database does not copy the authoritative email into `profiles`. Submission-specific representative email remains a snapshot on the application.

### Organisation

- `id`, `category`, `name`, `country`, `region`, `city`, `streetAddress`, `postalCode`.
- `officialEmail`, `officialPhone`, `website`, `yearEstablished`, `description`, `logoPreview`.
- Legal registration state: `registered`, `informal`, or incomplete while a draft is being edited.
- Conditional registration fields: `registrationNumber`, `registrationAuthority`, `registrationCountry`.
- `createdAt`, `updatedAt`.

Categories are exactly `tamil_community`, `education`, `healthcare`, `business`, `nonprofit`, and `other`.

### Application and representative

- `OrganisationRegistration`: `id`, `organisationId`, `applicantUserId`, `status`, `currentStep`, category profile, representative snapshot, admin feedback, submission/review identifiers and timestamps.
- Statuses are exactly `draft`, `submitted`, `under_review`, `needs_changes`, `verified`, `rejected`, and `suspended`.
- Representative snapshot: full name, email, phone, designation, relationship, authorization declaration, and accuracy declaration.
- Relationships: `founder`, `president`, `secretary`, `director`, `administrator`, `employee`, `authorised_representative`, and `other`.
- Both declarations must be true at submission.

### Category details

- Tamil/community: subtype; multi-select primary activities; membership range; area served; chairperson; secretary; languages.
- Education: institution and governance types; Tamil-programme flag and conditional description; accreditation fields; student range; multi-select study areas.
- Healthcare: facility and ownership types; multi-select systems of medicine; services; licence flag and conditional licence fields; 24-hour and emergency flags; bed count. No patient or clinical data is stored.
- Business: business type; industry; products/services; employee range; operating countries.
- Nonprofit: subtype; multi-select areas of work; beneficiary regions; organisation size.
- Other: organisation type and primary purpose.

Multi-select fields map to PostgreSQL `text[]`. Product-level option lists remain in typed frontend content rather than brittle database enums. Empty strings and nullable booleans allow resumable incomplete drafts; the submission function performs the complete conditional validation atomically.

### Service surface

| Interface                    | Methods consumed by the UI                                                                                                                      | Supabase mapping                                                                |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `RuntimeAuthService`         | `signup`, `login`, `requestPasswordReset`, `signOut`, `getCurrentUser`, `updateProfile`                                                         | Supabase Auth plus the caller's `profiles` row                                  |
| `RuntimeOrganisationService` | `getCurrentOrganisation`, `listCurrentOrganisations`, `selectCurrentOrganisation`, `updateCurrentOrganisation`                                  | membership lookup, primary-selection RPC, and RLS-protected organisation writes |
| `RuntimeRegistrationService` | `ensureCurrentDraft`, `getCurrentApplication`, `updateCategory`, `updateCategoryProfile`, `updateRepresentative`, `updateCurrentStep`, `submit` | draft-creation RPC, application/organisation/detail tables, and submission RPC  |
| `RuntimeAdminService`        | `listApplications`, `getApplication`, `updateStatus`                                                                                            | reviewer-authorized reads and review-transition RPC                             |

All remote methods are asynchronous. Database-to-domain and domain-to-database mappers isolate snake-case rows, nullable columns, and PostgreSQL enums from UI components.

## Relational model

```text
auth.users 1--1 profiles
auth.users 1--* organization_members *--1 organizations
organizations 1--1 organization_applications
organizations 1--0..1 one category detail table
auth.users 1--* user_roles
organization_applications 1--* application_review_history
```

The creator RPC uses a per-user transaction advisory lock, returns an existing primary application when re-entered, and otherwise creates an independent organisation, owner membership, initial draft, and history row atomically. `is_primary` gives the UI a deterministic current organisation while the relational model and selector support multiple organisations per person.

## Authorization and lifecycle operations

All public application tables have RLS enabled and explicit grants. Users can see their own profile and relevant memberships, organisations, applications, category details, and review history. Organisation owners/admins can edit only during `draft` or `needs_changes`. No normal-user membership insert or role write policy exists.

Reviewers are authorized through `user_roles`; editable profile metadata cannot confer administrative access. Review decisions use `review_organization_application`, which checks role membership, prevents a reviewer from deciding an organisation they represent, enforces valid transitions, requires feedback for adverse decisions, and appends immutable history.

The three `SECURITY DEFINER` operation/helper groups are justified as follows:

- membership and reviewer predicates avoid recursive RLS evaluation;
- draft creation performs the organisation, owner membership, application, and initial-history writes atomically;
- submission and review functions enforce protected lifecycle transitions and history writes.

Every definer function has an empty `search_path`, schema-qualifies objects, and has public/anonymous execution revoked. Trigger functions are not callable by application roles. Administrative role grants remain a privileged database operation.

Automatic API exposure is disabled. The migration grants the trusted `service_role` explicit access only to organisations, memberships, and application-role records needed for controlled server-side provisioning. That credential bypasses RLS by design and must remain outside browser code. Normal authenticated and anonymous grants are unchanged.

## Auth profile creation

An `auth.users` insert trigger creates `profiles` using only a bounded `full_name` metadata value and auth phone. It does not copy email or accept role metadata. This guarantees the one-to-one profile record in the same transaction as signup and prevents a client from supplying another user's profile identifier.

## Static export compatibility

The Next.js application uses `output: "export"` for GitHub Pages. The runtime creates only an on-demand browser client and adds no middleware, Server Actions, route handlers, or cookie-dependent server clients. Existing builds and routes remain static. Real application UUIDs use the exported `/admin/registrations/review` page plus a query parameter instead of requiring runtime dynamic-path generation.

Production SSR session refresh and server-side authorization require the planned runtime migration (for example, to the approved Cloudflare runtime). That migration must be an explicit architecture decision. Until then, the browser may use only the publishable key; RLS remains the actual data boundary. A service-role key must never enter browser code.

Auth email returns remain static and centralized at `/auth/callback/`. The provider subscribes before loading the enrollment snapshot so it can preserve Supabase's `PASSWORD_RECOVERY` event and distinguish a recovery session from an ordinary signed-in session. The service accepts normal browser PKCE returns and reviewed token-hash email templates; UI components do not call Supabase Auth directly. After a password update, the browser-local recovery session is closed before the user returns to sign in.

CAPTCHA configuration is optional and provider-neutral at the form boundary. Turnstile and hCaptcha adapters supply short-lived tokens to signup, password login, and recovery requests only when a public provider/site-key pair is configured. Provider secrets remain exclusively in Supabase Auth configuration.

## Generated database types

With Docker running and the local stack healthy:

```bash
pnpm supabase:start
pnpm supabase:db:reset
pnpm supabase:db:lint
pnpm supabase:types
```

`pnpm supabase:types` writes and formats the CLI-generated `Database` type at `apps/web/src/lib/supabase/database.types.ts`. The browser client is parameterized with this type, and row mappers use its table aliases rather than manually maintained database-row contracts. Database naming remains isolated behind the mapper and service boundaries.

Local verification commands reset the database before creating deterministic test identities:

```bash
pnpm test:supabase
pnpm test:e2e:supabase
```

The first command covers Auth profile creation, private profile access, organisation and membership RLS, role escalation denial, all category tables, submission and resubmission, immutable history, reviewer authorization, self-review prevention, rejection, verification, and suspension. The second configures only local public values for Next.js and exercises signup through final verification in Chromium. Service-role values remain process-local to the test runners and are never written to frontend environment files.

## Deployment gates

Before any production traffic is enabled:

- repeat the migration reset, database lint, type generation, and RLS integration suite for every schema change;
- configure and test confirmation, recovery, SMTP, redirect allow-lists, rate limits, and abuse protection;
- define the privileged reviewer/admin role-grant procedure;
- complete privacy, retention, backup/restore, monitoring, incident-response, and support ownership;
- decide whether browser-managed sessions remain acceptable or the site moves to a server-capable cookie-aware runtime.
