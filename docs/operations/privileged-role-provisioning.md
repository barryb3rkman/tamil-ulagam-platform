# Reviewer and admin role provisioning

Reviewer and admin authority lives in `public.user_roles` and is enforced by RLS and protected database functions. It must never be granted by browser code, editable profile metadata, or a public “make admin” interface.

## First reviewer and first admin

1. Create the person through the normal hosted Auth invitation/signup process and require email confirmation.
2. In the Supabase Auth user view, copy the target UUID and confirm the normalized email with the person through an approved channel.
3. In a privileged SQL session connected to the intended staging project, verify both values before mutation:

```sql
select id, email, email_confirmed_at, banned_until
from auth.users
where id = '<TARGET_AUTH_UUID>'::uuid
  and lower(email) = lower('<TARGET_EMAIL>');
```

The query must return exactly one confirmed, non-banned user. Stop if it does not.

4. Grant one explicit role in a transaction:

```sql
begin;

insert into public.user_roles (user_id, role)
select id, '<reviewer-or-admin>'::public.platform_role
from auth.users
where id = '<TARGET_AUTH_UUID>'::uuid
  and lower(email) = lower('<TARGET_EMAIL>')
  and email_confirmed_at is not null;

select user_id, role, created_at
from public.user_roles
where user_id = '<TARGET_AUTH_UUID>'::uuid;

commit;
```

Before commit, confirm the inserted row and affected-row count. Provision the first reviewer before the first admin unless the approved operating model requires the inverse. Use distinct named people; never share privileged accounts.

## Later grants and revocation

Repeat the UUID/email verification for every grant. A grant request should record requester, approver, business reason, target UUID/email, role, timestamp, and operator. Review active roles periodically.

Revoke in a transaction and verify removal:

```sql
begin;

delete from public.user_roles
where user_id = '<TARGET_AUTH_UUID>'::uuid
  and role = '<reviewer-or-admin>'::public.platform_role;

select user_id, role
from public.user_roles
where user_id = '<TARGET_AUTH_UUID>'::uuid;

commit;
```

If an account may be compromised, revoke the role first, then follow the approved Auth session-revocation and account response procedure. Database logs and the private access register are the audit record for this phase; the application does not yet provide a complete privileged-access audit system.
