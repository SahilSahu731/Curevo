# M1 dependency and authentication record

Review date: 2026-08-03. This is an implementation record, not a security certification.

## Dependency disposition

The frontend and backend lockfiles are committed and use exact versions for the security-sensitive direct dependencies. Frontend production dependencies currently pass `npm audit --omit=dev --audit-level=high`; backend production dependencies pass the same command. Direct and transitive paths are constrained with package-manager overrides for `dompurify`, `form-data`, `postcss`, `sharp`, `socket.io-parser`, `ws`, `engine.io`, `path-to-regexp`, and `socket.io-adapter`. The MongoDB development container is pinned to `mongo:8.2.9` rather than `latest`.

The repository workflow `.github/workflows/security.yml` runs both production audits on pull requests, main-branch pushes, and weekly. It also runs the client lint/build and the server M1 regression suite. A high or critical production advisory fails CI; an advisory cannot be accepted silently because the risk register and release checklist require an owner, exploitability assessment, evidence, and expiry.

Dependency upgrades were applied through lockfile-aware package updates and then validated with the application build and tests. `npm audit fix --force` is not part of the workflow.

## Authentication architecture

The application uses an opaque, random, server-side session token. Only a hash is stored in `Session`; the raw value is sent in a `Secure`/`HttpOnly` cookie with explicit path, SameSite, max-age, and optional domain. Normal sessions last eight hours; “Remember me” sessions last 30 days. Logout revokes the current session, logout-all revokes all user sessions, and password reset/change, email change, MFA changes, and account deletion revoke prior sessions. Socket handshakes resolve the same session record and are disconnected on revocation.

The client does not persist authentication tokens, profiles, or health data in local or session storage. API writes require a signed double-submit CSRF token and same-origin checks. API responses are marked `no-store`; client query caches and sockets are cleared on logout and a BroadcastChannel propagates logout to other tabs.

OAuth uses a signed, expiring, SameSite state cookie, verified Google email, duplicate-provider checks, explicit account-linking rules, and a relative redirect allowlist. The callback completes through the session cookie; no token is placed in a URL fragment or returned to JavaScript.

## Recovery and MFA

Password reset, email verification, and two-sided email change links use single-use, hashed, expiring account tokens. Recovery requests have generic responses and dedicated rate limits. Password policy requires 12-128 characters and rejects obvious identity-derived passwords. Password resets revoke existing sessions.

TOTP MFA has encrypted pending/active secrets, five-attempt login challenges, one-use hashed recovery codes, audit events, and safe disable rules. Administrator sessions in production cannot proceed until MFA enrollment is complete; administrators cannot disable MFA in production. The product owner and security owner still need to test delivery, recovery, and account-lockout operations with the chosen email provider.

## Remaining gates

The npm advisory service does not establish exploitability for this product. A named security owner must review release advisories, lockfile diffs, OAuth provider settings, SMTP delivery, session listing/revocation, MFA recovery, and cross-site deployment behavior. Production must use a unique high-entropy `SESSION_SECRET`; any previously exposed development secret must be rotated before deployment.
