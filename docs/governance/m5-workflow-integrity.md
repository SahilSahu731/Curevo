# M5 workflow integrity and scope decisions

> Historical record: the clinical workflows and control counts described here predate the 2026-08-14 focus-domain rebuild. The current interaction inventory is `docs/audits/m5-interactive-controls.json` (203 controls, zero unresolved).

Status: implemented and technically verified on 2026-08-03. Workspace paths and generated control evidence were refreshed on 2026-08-14. Public launch remains blocked by the M0 governance gates.

## Control and route audit

`apps/web/scripts/audit-controls.ts` inventories forms, links, buttons, cards, menu items, filters, modals, inputs, selects, and text areas. The generated evidence in `docs/audits/m5-interactive-controls.json` was refreshed after the workspace, landing-page, and authentication changes on 2026-08-14: 407 controls, zero unresolved, with 356 implemented, 3 intentionally disabled, and 48 intentionally informational. This source-inventory evidence is not accessibility, usability, or launch approval and must be regenerated whenever interactive controls change. `npm run check:links` builds the route manifest from the App Router source, checks static and templated internal destinations, rejects hash placeholders, and verifies referenced first-party assets.

The legacy common navbar, duplicate home navbar, unused admin sidebar, fake Create User dialog, missing `/grid.svg` references, simulated lab booking, and simulated medicine cart were removed. `/dashboard/appointments` now redirects to `/patient-dashboard/appointments`. Password recovery uses one-time, expiring, hashed tokens and an indistinguishable response.

## Contact operations

`POST /api/support/tickets` validates a strict plain-text payload, includes a honeypot, applies global and support-specific per-IP limits, applies a database-backed three-per-email hourly limit, and stores a hashed IP only. Tickets receive a random `SUP-YYYYMMDD-XXXXXXXX` reference. The response distinguishes accepted storage from confirmed SMTP delivery.

Configure `SUPPORT_INBOX` and the `SMTP_*` variables to enable delivery. Without them, the request is still persisted and clearly reports that delivery is unconfirmed. Operations and super-admin scopes can review and update those tickets in Admin > Feedback and support. Ticket content is rendered as text, access changes are audited, and the default TTL is 180 days (`SUPPORT_RETENTION_DAYS`, constrained to 30-730 days).

No support phone, public mailbox, response-time promise, business address, or map is shown because none has been verified. Assigning those real-world details remains an operating-organization launch requirement.

## Product scope decisions

Laboratory marketplace scope is de-scoped. The catalog, prices, collection claims, booking modal, and success toast were removed; the route remains as an explicit not-offered notice and is absent from navigation and sitemap.

Medicine commerce scope is de-scoped. Product claims, prices, discounts, cart actions, and simulated success were removed; the route remains as an explicit not-offered notice and is absent from navigation and sitemap.

Careers publishes no openings because there is no verified employer or ATS. The blog is repository-managed structured content: only `published` records appear, articles have stable slugs, author/editorial/medical-review statements, citations, update dates, and corrections. Draft preview is gated by `BLOG_PREVIEW_SECRET` through `/api/blog/preview`; article bodies are arrays of plain text rather than arbitrary HTML.

## Administrator controls

The unused Create User dialog was removed, so administrators cannot invent permanent passwords. Analytics and standalone Settings entries were removed; account settings resolve to Profile. User and appointment tables provide server-backed pagination, search, filters, sorting, loading, empty, error, and retry states. Feedback and public support lists provide the same operational states.

User suspension and role/status changes require recent MFA, exact target-email confirmation, and a 10-500 character reason. The current administrator cannot suspend or demote themselves, and the last active administrator cannot be suspended or demoted. Suspension revokes HTTP and socket sessions while retaining dependent records. Doctor suspension and clinic deactivation also require recent MFA, target identity, and reason.

Admin scopes are `operations`, `compliance`, and `super-admin`. Medical-record and attachment access is limited to compliance/super-admin and retains break-glass reason checks. Doctor verification, role changes, suspension, appointment-history access, feedback/support handling, and clinic changes write immutable audit events. No appointment-override UI or endpoint is exposed, so there is no unaudited override path.

From the repository root, run `npm run migrate:m5-workflows --workspace @curevo/web`. It gives existing administrators without a scope the least-privileged operations scope and creates required indexes. It never grants or changes super-admin access. The synthetic admin created by a fresh seed is explicitly scoped as super-admin; any real elevation requires a separately approved identity-management process.

## Verification

- `npm run verify:m5 --workspace @curevo/web`
- `npm run audit:controls --workspace @curevo/web`
- `npm run check:links`
- `npm run build`

SMTP delivery, ownership assignment, response-time commitments, and public contact publication require real infrastructure and named organizational owners; the UI does not claim those are complete.
