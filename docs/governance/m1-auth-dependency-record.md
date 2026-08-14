# M1 dependency and authentication record

Original review date: 2026-08-03. Workspace migration review: 2026-08-14. This is an implementation record, not a security certification.

## Dependency disposition

The repository has one npm workspace lockfile at the root. Application dependencies live in `apps/web/package.json`, while security-sensitive transitive overrides are owned by the root package. The production tree passed `npm audit --omit=dev --audit-level=high` on 2026-08-14 with no reported advisory; that point-in-time result is not an exploitability assessment or security certification. Current overrides cover `dompurify`, `form-data`, `postcss`, `sharp`, and `path-to-regexp`. Socket.IO and its realtime dependency tree were removed with the telehealth/queue domain. The MongoDB development container remains pinned rather than using `latest`.

The repository workflow `.github/workflows/security.yml` performs one clean root install and audit on pull requests, main-branch pushes, and weekly. It then checks internal links, lint, the Node regression suite, and the Next.js build for `apps/web`. A high or critical advisory fails CI; an advisory cannot be accepted silently because the risk register and release checklist require an owner, exploitability assessment, evidence, and expiry.

Dependency upgrades were applied through lockfile-aware package updates and then validated with the application build and tests. `npm audit fix --force` is not part of the workflow.

## Authentication architecture

The application uses an opaque, random, server-side session token. Only a hash is stored in `Session`; the raw value is sent in a `Secure`/`HttpOnly` cookie with explicit path, SameSite, max-age, and optional domain. Normal sessions last eight hours; “Remember me” sessions last 30 days. Logout revokes the current session, logout-all revokes all user sessions, and password reset/change, email change, MFA changes, and account deletion revoke prior sessions.

Browser code does not persist authentication tokens, profiles, or focus data in local or session storage. API writes require a signed double-submit CSRF token and same-origin checks. API responses are marked `no-store`; browser query caches are cleared on logout and a BroadcastChannel propagates logout to other tabs.

OAuth uses a signed, expiring, SameSite state cookie, verified Google email, duplicate-provider checks, explicit account-linking rules, and a relative redirect allowlist. The callback completes through the session cookie; no token is placed in a URL fragment or returned to JavaScript.

## Recovery and MFA

Password reset, email verification, and two-sided email change links use single-use, hashed, expiring account tokens. Recovery requests have generic responses and dedicated rate limits. Password policy requires 12-128 characters and rejects obvious identity-derived passwords. Password resets revoke existing sessions.

TOTP MFA has encrypted pending/active secrets, five-attempt login challenges, one-use hashed recovery codes, audit events, and safe disable rules. Administrator sessions in production cannot proceed until MFA enrollment is complete; administrators cannot disable MFA in production. The product owner and security owner still need to test delivery, recovery, and account-lockout operations with the chosen email provider.

## Remaining gates

The npm advisory service does not establish exploitability for this product. A named security owner must review release advisories, the root lockfile diff, OAuth provider settings, SMTP delivery, session listing/revocation, MFA recovery, the same-origin cookie/CSRF/socket behavior, and shutdown of any prior split origins. Production must use a unique high-entropy `SESSION_SECRET`; any previously exposed development secret must be rotated before deployment.
