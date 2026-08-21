# Supabase staging migration and smoke runbook

This runbook is for a new, dedicated staging project. It documents future commands only; the repository must not be linked until the project reference and operator authorization are supplied.

## Migration gates

Before login or linking, verify the project name, organization, region, reference, environment owner, and that the database is new/dedicated staging—not production or a shared database. Preserve a clean repository and run all local database tests first.

```bash
supabase login
supabase link --project-ref <STAGING_PROJECT_REF>
supabase migration list --linked
supabase db push --linked --dry-run
supabase db push --linked
```

Stop if migration history differs unexpectedly, the dry run contains destructive/unreviewed work, schema drift is reported, or the project identity cannot be independently confirmed. Never run remote `supabase db reset`. Never apply `supabase/seed.sql` to hosted staging. Do not resolve conflicts by marking migrations applied without an approved incident review.

After push, inspect tables, functions, grants, RLS enablement/policies, Auth trigger behavior, and migration history. Configure Auth only through the separate hosted checklist, then deploy a Preview build with the dedicated staging public URL/key.

## End-to-end staging smoke sequence

Use disposable applicant, reviewer, and admin accounts and non-sensitive organisation information.

1. Sign up; expect a confirmation-needed screen and one confirmation email.
2. Open the confirmation link; expect a confirmed state and either an authenticated registration continuation or an explicit sign-in action.
3. Log in; expect only the applicant's profile and organisations.
4. Create an organisation; save a draft, reload, and confirm exact resumption.
5. Complete one category profile and submit; expect `submitted` and read-only controls.
6. As reviewer, mark under review and request changes with feedback.
7. As applicant, confirm only that application's feedback is visible; edit and resubmit.
8. As reviewer, verify; as applicant, confirm `verified` without gaining reviewer access.
9. Request password reset; open the recovery link, set a new password, confirm the recovery session closes, and log in with the new password.
10. Confirm the old password fails and a reused/expired recovery link is rejected safely.

## RLS and security assertions

- Applicant A cannot read or modify Applicant B's profile, membership, organisation, category details, application, feedback, or history.
- An applicant cannot insert or update `user_roles`, review an application, self-verify, or mutate review history.
- A reviewer can read reviewable applications but cannot review an organisation they represent.
- Direct status mutation outside the protected lifecycle functions fails.
- Verified/rejected applications obey the documented edit rules; `needs_changes` can be corrected and resubmitted.
- Anonymous requests cannot access enrollment records or protected functions.
- Browser requests use only the publishable key. No service-role value appears in HTML, JavaScript, network configuration, build logs, or Cloudflare variables.
- Invalid credentials, unconfirmed email, rate limiting, network failure, and expired links show controlled messages without raw backend detail.

Retain pass/fail evidence without passwords, tokens, CAPTCHA responses, or organisation-sensitive data. A failed security assertion blocks staging approval.
