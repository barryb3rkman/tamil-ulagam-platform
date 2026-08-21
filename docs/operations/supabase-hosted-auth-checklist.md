# Hosted Supabase Auth checklist

Complete this checklist separately for the dedicated staging project. Do not assume local defaults apply to hosted Auth.

## Core settings

- Enable email/password signup and require email confirmation for staging acceptance testing.
- Disable anonymous sign-in and every unused identity provider.
- Set Site URL to the exact deployed staging origin.
- Allow only the required staging origins and their `/auth/callback/` route. Include preview URLs narrowly and remove obsolete previews.
- Confirm access-token lifetime, inactivity/maximum session limits, and single-session policy with the security owner.
- Keep refresh-token rotation and reuse detection enabled; document any deliberate exception.
- Use disposable staging accounts and non-production organisation data.

## Email redirects and templates

The application sends signup and recovery redirects to `/auth/callback/?flow=confirmation` and `/auth/callback/?flow=recovery`, including any configured static base path. Verify both links on the deployed origin.

Default Supabase links use the browser client's PKCE verifier and should be opened in the initiating browser. To support reliable cross-device completion, replace only after review with token-hash links equivalent to:

```text
{{ .SiteURL }}/auth/callback/?flow=confirmation&token_hash={{ .TokenHash }}&type=signup
{{ .SiteURL }}/auth/callback/?flow=recovery&token_hash={{ .TokenHash }}&type=recovery
```

Keep tokens out of logs, analytics, screenshots, support messages, and documentation. Test valid, reused, expired, and malformed links. Confirmation success must either establish a session and continue to registration or clearly send the user to sign in. Recovery must never accept an ordinary signed-in session as a recovery session.

## SMTP and abuse controls

- Configure a dedicated transactional SMTP provider and verified sending domain before public invitation.
- Set an accurate sender name, reply-to route, and support contact.
- Review confirmation and recovery template wording, expiry behavior, and links in plain-text and HTML clients.
- Review Auth rate limits for signup, token verification, password sign-in, and recovery mail. Begin conservatively and monitor rejected requests.
- Decide between Cloudflare Turnstile and hCaptcha. Create separate staging keys, add only the public site key to the frontend environment, and place the secret only in the Supabase Auth CAPTCHA setting.
- Set `NEXT_PUBLIC_AUTH_CAPTCHA_PROVIDER` and `NEXT_PUBLIC_AUTH_CAPTCHA_SITE_KEY` together. Confirm the provider in Supabase matches the frontend provider before rebuilding.
- Test expired CAPTCHA tokens, widget failure, repeat submission, keyboard use, and reduced-motion behavior.

## Acceptance evidence

Record the project reference, deployment origin, setting reviewer, date, template versions, rate limits, SMTP test result, CAPTCHA state, and smoke-test result in the private operational record. Do not put credentials, recovery tokens, or user passwords in that record.
