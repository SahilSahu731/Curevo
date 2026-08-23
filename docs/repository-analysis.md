# Repository analysis: focus-domain rebuild

Audit snapshot: 2026-08-14

Runtime: one root npm workspace; deployable application in `apps/web`

Release status: **PUBLIC LAUNCH BLOCKED**

Data status: synthetic-only review environment

## Current product boundary

Curevo is now a self-guided focus and everyday-wellbeing workspace. Its active
member domain consists of focus sessions, flexible routines, private reflections,
descriptive progress summaries, notifications, feedback, and account/privacy
controls. It does not diagnose, treat, prescribe, triage, provide therapy, or
respond to emergencies.

The former doctor, clinic, patient, appointment, queue, telehealth, review, medical
record, clinical-note, slot-reservation, and clinician-verification runtime has been
removed. This includes its pages, browser services/stores, Express routes,
controllers, Mongoose models, scheduling utilities, Socket.IO server/client,
operational jobs, tests, and package dependencies. Historical governance records
remain in `docs/governance` as an audit trail; they do not describe active product
features.

Existing external databases or object storage may still contain records created by
older versions. Source-code removal does not authorize deleting that external data.
Inventory, quarantine, retention, export, and deletion decisions require an
approved data owner and backup plan.

## Audited implementation inventory

Generated dependencies, build output, ignored environment values, and Git metadata
are excluded from these source counts.

| Surface | Current count | Notes |
|---|---:|---|
| Project-owned files | 235 | Root workspace, application, documentation, configuration, and assets |
| Files under `apps/web/src` | 184 | Browser and server source |
| Next.js pages / route handlers | 29 / 1 | Public, auth/recovery, member workspace, admin, profile, and GET-only blog preview |
| Express routers / endpoints | 6 / 54 | Auth, focus, feedback, notifications, support, and administration |
| Server controllers / models | 9 / 12 | Identity, privacy, focus data, messages, and operational audit records |
| Node test files | 5 | Focus-domain bounds, claims boundary, auth/security, review freeze, and image-upload validation |
| Interactive controls | 203 | Regenerated inventory; zero unresolved |

## Runtime architecture

- Root `package.json` owns the workspace scripts, lockfile, Node requirement, and
  security overrides.
- `apps/web/server.ts` prepares Next, creates the Express application, connects
  MongoDB, and serves both page and API traffic from one persistent Node process.
- Express owns `/api` except the explicit GET-only `/api/blog/preview` pass-through.
  Mutating APIs retain origin checks, CSRF protection, request limits, operator-key
  rejection, production freeze, authentication, and role/ownership checks.
- Sessions are opaque, hashed, revocable server-side records in secure HTTP-only
  cookies. Production requires HTTPS and `SameSite=Lax`, including Google OAuth.
- MongoDB contains three focus models: `FocusSession`, `Routine`, and `Reflection`.
  Every member query is scoped to the authenticated user. Administrators receive
  aggregate activity only; private reflection text is not exposed in the admin
  dashboard.
- `apps/app` remains intentionally empty except for `.gitkeep`.

## Product and data decisions

Registration creates only the `member` role; the only other runtime role is
`admin`. The `migrate:focus-domain` command converts older non-admin role values to
`member`, removes obsolete notification fields/admin scopes, and does not translate
clinical records into focus data.

Account export contains the account, focus sessions, routines, reflections,
feedback, notifications, and consents belonging to the requesting user. Account
deletion removes those personal datasets, anonymizes the account record, revokes
sessions/tokens, and attempts profile-image cleanup. Focus retention remains
review-only: the sweep reports records beyond the configured window and does not
silently erase them.

Profile uploads accept images only, limit input to 5 MB, compare declared and
detected types, require valid dimensions, cap pixel count, and reject the known
test-malware signature. This is input hardening, not a complete malware-scanning
service.

## Operational containment

- Keep `ALLOW_PRODUCTION_WRITES=false` and
  `NEXT_PUBLIC_ALLOW_INDEXING=false` until named release approvals and evidence are
  complete.
- Use synthetic information in review environments.
- Do not claim that Curevo is a cure, medical service, therapist, diagnostic tool,
  treatment, crisis service, or proven outcome intervention.
- Configure routine reminders as an explicit scheduled job; they are not run by the
  web process automatically.
- Run the legacy-role migration only after a database inventory and backup. Removal
  of old collections, storage objects, logs, or backups is deliberately not
  automated.

## Verification boundary

The repository verification command runs internal-link checks, ESLint, Node tests,
and a production Next build. The responsive Playwright suite covers the public
landing/navigation and auth hydration. These checks do not replace deployed-origin
OAuth/session testing, database-backed ownership tests, accessibility review,
privacy/legal approval, security assessment, backup/restore exercises, or incident
response drills.

Before release, verify at minimum: register → verify → session → focus CRUD →
export/delete; administrator MFA and member suspension; CSRF/origin rejection;
Google OAuth; email delivery; profile uploads; routine scheduling; and responsive
keyboard/screen-reader behavior with synthetic accounts.
