# Repository analysis and workspace migration decision

Audit snapshot: 2026-08-14

Migration target: root npm workspace with the full runtime in `apps/web`

Release status: **PUBLIC LAUNCH BLOCKED**

Data status: synthetic-only review environment; potentially real or unclassified records must remain quarantined

Product status: prototype; **not approved as a wellness product, clinical tool, medical service, or cure**

## Scope and method

The repository review enumerated every project-owned file in the original split `client` and `server` trees and then reconciled the migrated workspace. The review covered application routes and layouts, browser API clients and state, components and design primitives, Express routes/controllers/middleware, Socket.IO and WebRTC signaling, Mongoose models, operational scripts, tests, public assets, manifests and lockfiles, root configuration, CI, deployment files, and every governance/audit document.

Generated dependencies and build output (`node_modules`, `.next`, TypeScript build state, Playwright traces, and test-result artifacts) were inventory exclusions rather than application source. Ignored `.env` and `.env.local` values were deliberately not recorded or reproduced; the environment-variable names and example/config coverage were reviewed without exposing secrets. Package lockfiles were assessed structurally and against the npm advisory service rather than reviewed as handwritten source line by line.

The reconciled migration snapshot contained 324 non-generated, non-secret project files, including 277 files under `apps/web/src`. Counts capture the active migration snapshot and must be regenerated if later work adds or removes files. This report is an audit map and migration record, not a security, privacy, legal, accessibility, or clinical certification.

## Audited implementation inventory

Counts are source-level counts after colocation. An endpoint is one declared Express HTTP method/path pair; middleware-only `router.use` declarations are excluded.

| Surface | Count | Coverage note |
|---|---:|---|
| Next.js page route files | 47 | Public, authentication, patient, clinician, administrator, profile, recovery, queue, and telehealth pages |
| Next.js App Router handlers | 1 | Blog preview handler under `src/app/api`; Express grants it an explicit GET-only pass-through before the guarded API stack |
| Express route modules / HTTP endpoints | 13 / 110 | Authentication, clinics, clinicians, patients, appointments, queues, records, reviews, feedback, notifications, support, and administration |
| Process-level health endpoint | 1 | `/_health`, mounted by the unified Express application and referenced by Render |
| Server controllers / services | 17 / 3 | Legacy healthcare workflow behavior was relocated, not redesigned |
| Server middleware modules | 8 | Authentication, authorization, CSRF, rate limiting, OAuth state, production freeze, validation, request security, and uploads |
| Mongoose model modules | 20 | Includes sessions, consents, audits, appointments, queues, medical records, verification, reviews, notifications, and support |
| Server utilities / operational scripts | 13 / 10 | Scheduling, sessions, grants, mail, audit, migrations, retention, seeding, and reminders |
| Browser components / service modules / Zustand stores | 74 / 11 / 8 | Includes the retained clinical discovery, booking, dashboard, queue, and record interfaces plus the new landing pathfinder |
| Node test files / named tests | 8 / 33 | M0-M5, production-freeze, authentication, upload, telehealth, records, and booking checks |
| Playwright specifications / generated cases | 1 / 12 | Five declarations generate eight viewport cases plus drawer/focus, pathfinder, theme, and reduced-motion/auth-hydration cases; 12/12 passed in the stable local run on 2026-08-14 |

The route and model counts matter to product scope: most of the persisted and authenticated surface still represents clinician discovery, clinic scheduling, appointments, medical records, reviews, queues, and telehealth. Moving those files did not turn them into a non-clinical focus product.

## Architecture decision

The migration uses colocation before redesign:

1. The root is a private npm workspace and owns the single `package-lock.json`, runtime scripts, Node version requirement, and transitive security overrides.
2. `apps/web` contains the Next.js App Router application and the retained Express/Mongoose/Socket.IO implementation. `apps/app` is reserved for a future application and is tracked only by `.gitkeep`.
3. `apps/web/server.mjs` prepares Next.js, creates one Express application, attaches Socket.IO to the same HTTP server, connects MongoDB, and listens on one port.
4. Browser pages, REST requests, OAuth callbacks, and Socket.IO use one origin by default. Production session, MFA, and OAuth-state cookies use `SameSite=Lax`. `Strict` is not supported because the signed OAuth state cookie must return on Google's top-level cross-site GET callback; `None` is unnecessary for the same-origin application. CSRF, server-side authorization, and socket admission remain required.
5. The existing `/api` contract, MongoDB collections, models, session design, operational scripts, and realtime events were retained to avoid an unreviewed behavior or data migration during the directory move.
6. `render.yaml` now describes one persistent `curevo` Node service built from the root workspace. The repository no longer contains the former Vercel client configuration. This source change does not prove that an external Vercel preview or previous Render API has been deleted.

This is a single codebase and deployable process, but it is not a conversion of all server behavior to Next.js route handlers. Express remains the REST boundary and Socket.IO requires a persistent Node process. A future route-handler rewrite must preserve authorization, session revocation, uploads, production freeze, idempotency, concurrency, audit events, and field-level record projections.

## Non-negotiable containment

- `ALLOW_PRODUCTION_WRITES` remains `false`. The production middleware must continue returning `PRODUCTION_REVIEW_ONLY` for disallowed mutations until every release gate has named approval and evidence.
- `NEXT_PUBLIC_ALLOW_INDEXING` remains `false` for review and preview deployments.
- `NEXT_PUBLIC_ENABLE_WELLNESS_TOOLS` remains `false`. The existing assessment output is not clinically validated and the governance record does not approve Curevo as a wellness product.
- Only synthetic information may be used. The previously observed unmarked local account and consent record must be treated as potentially real; remote databases, object storage, logs, previews, and backups remain unverified.
- The requested direction may be described internally as proposed self-guided support for focus, habits, distraction, procrastination, and everyday overwhelm. Public copy must not promise an “online cure,” call people mentally sick, diagnose a condition, provide therapy or treatment, imply clinician oversight, or present the product as crisis support.
- No quantified outcome, clinical, regulatory, security, partner, rating, availability, or social-proof claim may ship without the evidence and approval required by `governance/claims-inventory.md`.

## Remaining migration and legacy-domain risks

### Routing and runtime

- The unified Express application explicitly passes GET `/api/blog/preview` to Next.js before installing the guarded Express API stack and `/api` 404 fallback. This resolves the known handler collision, but it is a security-sensitive exception: any future Next API handler would otherwise be shadowed, and any new pass-through could bypass Express CSRF, freeze, rate-limit, logging, and validation controls. Keep the allowlist minimal and add a same-process integration test.
- Pages, REST, Socket.IO, scheduled operations, and database startup now share one process and failure domain. Graceful shutdown exists, but capacity, connection draining, restart behavior, sticky-session or distributed-adapter needs, and horizontal scaling have not been production-tested.
- The Render health check covers the shared process endpoint, not full dependency readiness. Database, object storage, email, TURN, and job-scheduler readiness and degradation policies remain incomplete.
- OAuth callback URLs, cookie attributes, CORS/CSRF origins, emailed links, and Socket.IO admission must be tested on the actual same-origin deployment. Any former split origins must be removed from providers and allowlists after evidence is preserved.

### Product and clinical scope

- The proposed focus/wellbeing direction and the retained healthcare marketplace are different products. Hiding legacy navigation is insufficient: all 110 Express endpoints and 20 data models need an explicit keep, quarantine, export, or retirement decision.
- Clinician verification, appointments, symptoms, diagnoses, prescriptions, private notes, attachments, queues, and video metadata can expose highly sensitive data if writes are enabled. Their presence remains a critical release and data-governance concern even when the new landing page is non-clinical.
- The terms “Curevo” and “wellbeing” do not authorize a cure or health-outcome claim. Distraction and procrastination may coexist with conditions requiring qualified care; automated content must not infer or treat those conditions.
- Jurisdiction, operator identity, target age, customer type, emergency escalation, legal roles, complaint channel, and clinical-safety ownership remain undecided.

### Data lifecycle and external systems

- Governance records conflict on account deletion: the older data map/runbook describes cascade deletion, while the M3 record describes anonymization with retained clinical records and audit evidence. A named privacy/legal owner must select and test the applicable behavior before real data is accepted.
- Remote MongoDB instances, Cloudinary objects, Render/Vercel logs, backups, OAuth projects, SMTP systems, and any earlier deployments were not discoverable from source. They require an external inventory; code relocation does not erase them.
- Malware scanning/release, orphan cleanup, retention jobs, encrypted backup verification, restore testing, and provider-contract review remain release gates for legacy uploads and medical records.
- Notification reminder and clinician-verification-expiry scripts exist but no approved distributed scheduler or operating owner is evidenced.

### Realtime, testing, and evidence

- Public `NEXT_PUBLIC_TURN_*` values are browser-visible. Static credentials do not satisfy the documented short-lived TURN requirement; an authenticated ephemeral-credential service and abuse controls are required before real telehealth use.
- The M5 interactive-control JSON was regenerated on 2026-08-14 after the workspace, landing-page, and authentication changes: 407 controls, zero unresolved, with 356 implemented, 3 intentionally disabled, and 48 intentionally informational. This is source-inventory evidence, not accessibility, usability, or launch approval; regenerate it whenever interactive controls change.
- The refreshed Playwright specification asserts the focus-oriented hero, non-scoring pathfinder, emergency-support boundary, and absence of horizontal overflow across eight viewport widths. It also covers the updated mobile navigation and focus containment, pathfinder selection, light/system/dark themes, reduced motion, and auth-page hydration. All 12 cases passed in a stable local run on 2026-08-14. This is targeted UI regression evidence, not approval of the product direction or a substitute for claims, accessibility, crisis-language, link, metadata, sitemap, noindex, CI, or deployed-origin review.
- Source-level tests do not replace deployed authorization/IDOR, concurrent booking, WebRTC network, accessibility, penetration, load, incident, backup/restore, or privacy-request exercises.

## Dependency and configuration findings

The previous two lockfiles were internally consistent but had become vulnerable after their August 3 review. The migration regenerated one root lockfile and moved npm overrides to the root, where workspace installs apply them. On 2026-08-14, `npm audit --omit=dev --audit-level=high` reported no production advisory. This is time-limited evidence; CI and release review must repeat it.

The workspace environment example now groups server-only and browser-visible variables. Secret values must never use the `NEXT_PUBLIC_` prefix. The single-origin defaults eliminate the former public API/socket base URLs, but `CLIENT_URL` and `NEXT_PUBLIC_SITE_URL` still need the same approved HTTPS origin in production, and Google OAuth must use that origin's callback. Production validation requires `COOKIE_SAME_SITE=lax`: the session and signed OAuth-state cookies share the same options, and the state cookie must survive Google's top-level cross-site GET redirect back to Curevo.

## Required verification and rollout sequence

1. Preserve `ALLOW_PRODUCTION_WRITES=false`, `NEXT_PUBLIC_ALLOW_INDEXING=false`, and `NEXT_PUBLIC_ENABLE_WELLNESS_TOOLS=false` in every environment.
2. Inventory all current and former deployments, databases, object stores, logs, backups, OAuth projects, SMTP providers, and domains. Quarantine rather than delete unclassified data.
3. Integration-test the explicit Express-to-Next blog-preview pass-through, ordinary Express APIs, Socket.IO, and `/_health`; require a security review before adding another Next-owned API path.
4. From the repository root, run `npm ci`, `npm audit --omit=dev --audit-level=high`, `npm run verify`, `npm run verify:m4-concurrency --workspace @curevo/web`, and `npm run test:e2e:m6 --workspace @curevo/web`. Record failures as blockers; do not convert a partial pass into launch evidence.
5. Test OAuth, sessions, CSRF, logout-all, sockets, uploads, export/deletion, and recovery on the deployed same-origin layout with synthetic accounts.
6. Regenerate the control/link evidence after the landing redesign and review every rendered claim, mobile state, theme, keyboard path, error state, metadata surface, sitemap, and robots response.
7. Decide which legacy healthcare routes, models, jobs, data, and public pages are retired versus retained. Apply migrations only against an approved backup with a rollback and data-owner sign-off.
8. Complete every item in `governance/release-checklist.md` with named product, security, privacy, clinical-safety, and legal approvers.

Until those steps and the release checklist are complete, the architecture may be evaluated locally with synthetic information only. It must not be represented as production-ready, clinically safe, approved wellness support, or available for patient care.
