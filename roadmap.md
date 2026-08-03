# Curevo / SmartQueue Remediation and Production-Readiness Roadmap

> Status: Draft remediation plan based on the full repository, build, dependency, API, security, product, and responsive-UI audit performed on 2026-08-01.
>
> Purpose: This file is the implementation source of truth for turning the current prototype into a safe, trustworthy, testable, and production-operable healthcare platform.
>
> Important: A checked task means its implementation, tests, documentation, review, and rollout requirements are complete. It does not mean that code was merely written.

---

## 1. How to use this roadmap

### 1.1 Status convention

- `[ ]` Not started.
- `[~]` In progress. Add the owner and pull request next to the task.
- `[x]` Complete and verified against all acceptance criteria.
- `[!]` Blocked. Record the blocker, owner, and next decision date.
- `[D]` Deliberately deferred. Record who accepted the risk, why, and until when.

### 1.2 Priority convention

- **P0 — Release blocker:** Patient safety, privacy, authentication, critical security, data corruption, or materially misleading healthcare claims. No public production launch is permitted while any P0 item remains open.
- **P1 — Core product blocker:** Broken primary flows, unreliable booking, major accessibility failures, or missing operational safeguards.
- **P2 — Production quality:** SEO, performance, maintainability, analytics, documentation, and secondary workflows.
- **P3 — Enhancement:** Valuable improvements that can follow a safe and stable first production release.

### 1.3 Required fields when starting a task

Every implementation pull request must record:

- Task ID from this file.
- Responsible engineer and reviewer.
- Security/privacy reviewer when the task touches authentication, health information, telehealth, uploads, or authorization.
- Product decision or design link when behavior changes.
- Database migration and rollback plan, when applicable.
- Test evidence, including commands and relevant screenshots.
- Deployment, monitoring, and rollback notes.

### 1.4 Global definition of done

A task is complete only when all applicable conditions are satisfied:

- The implementation is merged and deployed to the staging environment.
- Unit, integration, authorization, and end-to-end tests cover the success and failure paths.
- No new TypeScript, ESLint, dependency-audit, accessibility, or build regressions are introduced.
- User-visible loading, empty, success, and error states exist.
- Logs do not contain secrets, tokens, medical details, passwords, or unnecessary personal information.
- API and user documentation are updated.
- Metrics and alerts exist for new critical flows.
- Keyboard, screen-reader, mobile, slow-network, and dark/light-theme behavior is verified where relevant.
- A rollback path is documented and has been considered before release.

---

## 2. Current-state release blockers

The current application should be treated as an interactive prototype rather than a production healthcare system. The following findings define the initial remediation scope.

| Area | Current problem | Severity | Primary remediation milestone |
|---|---|---:|---|
| Telehealth | Socket rooms and signaling accept unauthenticated participants; no appointment authorization; STUN-only connectivity | P0 | M2 |
| Medical records | Notes labeled private are returned in patient record responses | P0 | M3 |
| Healthcare claims | Unsupported HIPAA/GDPR, AI, accuracy, usage, provider, ratings, and security claims | P0 | M0 |
| Dependencies | Production dependency audit reports critical and high vulnerabilities in frontend and backend packages | P0 | M1 |
| Authentication | Browser-readable JWT persistence, incomplete logout, broken Google login, no reset/verification/session revocation | P0/P1 | M1 |
| Doctor trust | Unverified doctors can appear publicly and can be booked | P0 | M4 |
| Booking integrity | Slot and queue-token allocation use race-prone read-then-write behavior | P0 | M4 |
| Reviews | Unlimited reviews without completed-appointment verification | P1 | M4 |
| Simulated features | Labs, medicine cart, contact, careers, blog, and portions of AI/telehealth present fake success states | P1 | M5 |
| Navigation | Mobile public navigation omits the menu, authentication, and account actions | P1 | M6 |
| Broken links | Several shipped internal links return 404; homepage requests missing `/grid.svg` | P1 | M5 |
| Accessibility | Missing accessible names, input associations, semantic controls, reduced-motion support, and complete audit | P1 | M7 |
| SEO | All pages inherit homepage metadata and canonical `/`; no entity-specific structured data | P2 | M8 |
| Quality | 305 frontend lint warnings, no backend tests, no CI, duplicate API layers, weak typing | P1/P2 | M9 |
| Operations | No observability, audit trail, backup verification, incident runbook, or production readiness process | P0/P1 | M10 |

---

## 3. Delivery sequence and release gates

### Gate A — Immediate risk containment

Complete M0 and the dependency/security triage portions of M1 before accepting real patient data or publicly marketing the application.

### Gate B — Private alpha

Complete M1 through M4 before inviting real doctors or patients. Private alpha may use synthetic data only until the privacy and authorization test suites pass.

### Gate C — Product beta

Complete M5 through M7, including all core workflows, accessibility blockers, and responsive navigation. Every feature shown as operational must have a real backend workflow or be clearly marked unavailable.

### Gate D — Public production

Complete M8 through M11 and all launch criteria in Section 16. Legal/compliance approval, verified backups, monitoring, security testing, and rollback exercises are mandatory.

---

# M0 — Immediate Trust, Safety, and Governance Containment

## M0-T01 — Establish a temporary production feature freeze

- **Priority:** P0
- **Problem:** The site currently makes healthcare, compliance, security, and feature claims that are not supported by the implementation.
- **Objective:** Prevent new production-facing claims or health-data collection until safety controls and ownership are established.

### Implementation tasks

- [ ] Identify every live or preview deployment and record its URL, owner, environment, data source, and audience.
- [ ] Confirm whether any real patient, doctor, clinic, appointment, medical-record, license, or contact data has already been collected.
- [ ] Disable public indexing or password-protect non-production deployments containing unfinished healthcare workflows.
- [ ] Freeze new feature work except remediation tasks in M0–M4.
- [ ] Create a risk register with owner, impact, likelihood, mitigation, target date, and accepted residual risk for every P0 finding.
- [ ] Assign a product owner, security owner, privacy owner, and clinical-safety reviewer.
- [ ] Define which jurisdictions and customer types the first release actually targets; do not claim global compliance by default.

### Acceptance criteria

- [ ] All deployments and data stores are inventoried.
- [ ] No unreviewed environment can collect real health data.
- [ ] Every P0 item has an accountable owner and target date.
- [ ] The team has documented whether the product is a prototype, wellness tool, clinical tool, marketplace, clinic SaaS platform, or a combination of these.

## M0-T02 — Remove or qualify unsupported claims

- **Priority:** P0
- **Affected areas:** Homepage, authentication layout, health check, telehealth, doctor and clinic pages, contact FAQ, blog, about page, footer, legal pages, seeded content.

### Claims requiring verification or removal

- [ ] “HIPAA compliant,” “HIPAA secure,” or equivalent statements.
- [ ] “GDPR compliant” or blanket global-compliance statements.
- [ ] “Bank-grade,” “enterprise-grade,” “encrypted medical data,” and “secure room” claims unless the relevant control and threat model are documented.
- [ ] “AI-powered,” “AI model,” “real-time AI triage,” and “advanced algorithms” where behavior is deterministic client-side scoring.
- [ ] “98% accuracy,” “50K+ assessments,” “thousands of providers,” “top-rated,” “verified doctors,” “world-class care,” and similar unsubstantiated metrics.
- [ ] Named healthcare-provider trust logos unless permission and an actual relationship exist.
- [ ] Fixed clinic ratings, response times, accreditation, instant confirmation, state-of-the-art facility, and availability claims not sourced from data.
- [ ] Company history, founders, team biographies, fundraising announcements, addresses, support numbers, authors, and social profiles that are placeholders.
- [ ] Any implication that an automated result is a diagnosis or clinically validated risk assessment.

### Implementation tasks

- [ ] Create a content-claims inventory containing page, exact claim, supporting evidence, owner, expiry/review date, and approved wording.
- [ ] Replace unsupported statements with accurate prototype wording or remove them.
- [ ] Add prominent, plain-language limitations before users begin any health assessment—not only after the result.
- [ ] Add urgent-symptom escalation copy and emergency-service guidance appropriate to the target jurisdiction.
- [ ] Clearly distinguish wellness education from medical advice, diagnosis, triage, treatment, or emergency services.
- [ ] Ensure marketing copy never outruns implemented controls.

### Acceptance criteria

- [ ] Every quantified, compliance, clinical, security, partner, rating, and social-proof claim has documentary evidence and approval.
- [ ] Unsupported claims cannot be found in source or rendered UI.
- [ ] Health assessment limitations are visible before data entry and in exported reports.
- [ ] Content review is included in the release checklist.

## M0-T03 — Complete legal and privacy product mapping

- **Priority:** P0
- **Problem:** Existing privacy and terms pages are generic templates and refer to collection and business practices that may not exist.

### Implementation tasks

- [ ] Map every collected field to purpose, lawful basis/authorization, storage location, recipients, retention period, deletion method, and sensitivity classification.
- [ ] Include accounts, profile images, identity-provider data, doctor license files, symptoms, diagnoses, prescriptions, private notes, appointments, queue events, telehealth metadata, reviews, feedback, logs, cookies, and analytics.
- [ ] Determine whether the product or any customer is a covered entity/business associate or otherwise subject to healthcare-specific regulation.
- [ ] Determine controller/processor roles and execute required agreements before claiming compliance.
- [ ] Rewrite privacy policy, terms, cookie policy, telehealth consent, and assessment disclaimer for actual behavior and jurisdictions.
- [ ] Add effective dates, versioning, contact details, complaint path, data-subject request path, retention policy, deletion policy, and subprocessors.
- [ ] Remove references to SSNs, passports, advertising, payment processing, California law, or Australian addresses unless accurate.
- [ ] Define age restrictions, parental consent rules, and handling of minors.
- [ ] Define breach notification, law-enforcement request, and account-deletion procedures.

### Acceptance criteria

- [ ] Policy statements match actual code and infrastructure.
- [ ] Consent is captured, versioned, auditable, and revocable where required.
- [ ] Data-deletion and export requests can be completed end to end.
- [ ] Legal/privacy approval is recorded before public launch.

## M0-T04 — Produce a healthcare threat model and clinical safety case

- **Priority:** P0

### Implementation tasks

- [ ] Diagram trust boundaries across browser, Next.js, Express, MongoDB, Cloudinary, Google OAuth, Socket.IO, WebRTC/STUN/TURN, hosting providers, logs, and backups.
- [ ] Model unauthorized record access, room intrusion, account takeover, malicious uploads, token theft, NoSQL injection, queue manipulation, review fraud, insider access, data leakage through logs, and denial of service.
- [ ] Define safety hazards for bad assessment output, missed emergency symptoms, incorrect doctor verification, duplicate bookings, queue misordering, stale availability, and wrong-patient records.
- [ ] Assign preventive, detective, and recovery controls to every high-risk threat.
- [ ] Document residual risks and require explicit approval.

### Acceptance criteria

- [ ] Threat model is reviewed whenever authentication, records, telehealth, uploads, or infrastructure changes.
- [ ] P0 threats have implemented controls and automated regression tests.

---

# M1 — Dependency Security and Authentication Foundation

## M1-T01 — Remediate vulnerable frontend dependencies

- **Priority:** P0
- **Audit baseline:** 12 production vulnerabilities: 2 critical, 7 high, 3 moderate.

### Implementation tasks

- [ ] Upgrade Next.js from the vulnerable 16.0.3 release to a patched supported release.
- [ ] Upgrade jsPDF and test every generated medical-record and assessment PDF.
- [ ] Upgrade Axios, DOMPurify, `form-data`, `follow-redirects`, Lodash, Socket.IO client/parser, `ws`, Sharp, and PostCSS through direct or parent dependency upgrades.
- [ ] Review changelogs and migration notes rather than applying `npm audit fix --force` blindly.
- [ ] Rebuild and manually test authentication, image rendering, PDF generation, API requests, React Server Component behavior, middleware/proxy behavior, and sockets.
- [ ] Pin supported versions and define a regular dependency update cadence.
- [ ] Add automated dependency scanning and fail CI on unapproved critical/high production findings.

### Acceptance criteria

- [ ] `npm audit --omit=dev` has no unapproved critical or high finding.
- [ ] Production build, lint, unit, integration, and end-to-end suites pass.
- [ ] Any temporarily accepted advisory has a documented exploitability assessment, owner, and expiry date.

## M1-T02 — Remediate vulnerable backend dependencies

- **Priority:** P0
- **Audit baseline:** 12 production vulnerabilities: 8 high, 4 moderate.

### Implementation tasks

- [ ] Upgrade Mongoose, Multer, Socket.IO/Engine.IO, `ws`, JWT/JWS packages, Morgan, `body-parser`, `path-to-regexp`, `qs`, and Lodash dependency paths.
- [ ] Revalidate Express 5 middleware and error behavior after upgrades.
- [ ] Test MongoDB filter sanitization and prohibit operator/prototype injection.
- [ ] Test malformed multipart uploads, aborted uploads, oversized fields, fragmented sockets, invalid JWT algorithms/signatures, and pathological URL-encoded bodies.
- [ ] Pin the MongoDB container to an explicit supported version rather than `mongo:latest`.

### Acceptance criteria

- [ ] Backend production dependency audit has no unapproved critical/high finding.
- [ ] Security regression tests cover each vulnerability class relevant to the application.

## M1-T03 — Consolidate the authentication model

- **Priority:** P0
- **Problem:** The application simultaneously uses an HttpOnly cookie and a JavaScript-readable bearer token persisted in local storage.

### Target design

- Prefer server-issued `Secure`, `HttpOnly`, appropriately scoped cookies with short-lived access sessions and rotating refresh/session records.
- Do not expose reusable authentication tokens to JavaScript unless a documented architecture requires it.
- Store server-side session metadata to support revocation, device/session listing, logout-all, and incident response.

### Implementation tasks

- [ ] Select cookie/session or token architecture and document the threat tradeoffs.
- [ ] Stop returning the reusable JWT in the login/register JSON response when cookie authentication is selected.
- [ ] Remove token and user persistence from local storage; retain only non-sensitive preferences.
- [ ] Set explicit cookie `path`, `domain` when needed, `secure`, `httpOnly`, `sameSite`, max age, and environment-specific behavior.
- [ ] Add CSRF protection for cookie-authenticated state-changing requests; validate `Origin`/`Referer` as defense in depth.
- [ ] Rotate session identifiers after login, password change, privilege change, and OAuth linking.
- [ ] Add server-side revocation and session expiration.
- [ ] Prevent cached authenticated pages and sensitive API responses.
- [ ] Remove authentication and full-user console logs from client and server output.

### Acceptance criteria

- [ ] Browser storage contains no bearer token or unnecessary health/user profile data.
- [ ] Logout immediately invalidates the server session and clears cookies with matching attributes.
- [ ] Stolen or revoked sessions fail on API and socket connections.
- [ ] CSRF tests cover all state-changing endpoints.

## M1-T04 — Complete login, logout, registration, and redirect flows

- **Priority:** P1

### Implementation tasks

- [ ] Wire the login-page Google button to the OAuth endpoint; it currently only starts a spinner.
- [ ] Ensure the Google failure redirect returns to the frontend, not the API server’s `/login` path.
- [ ] Validate OAuth `state`, callback URL, verified email, missing email/photo cases, account linking, and duplicate provider IDs.
- [ ] Honor a validated relative `redirect`/`from` parameter after login and registration.
- [ ] Block open redirects by rejecting absolute or cross-origin targets.
- [ ] Redirect each role to the correct dashboard.
- [ ] Make logout a protected POST endpoint and call it from every logout UI.
- [ ] Clear client query caches and sensitive state after logout.
- [ ] Make “Remember me” actually control session duration or remove it.
- [ ] Ensure authentication errors use a consistent API field and do not reveal whether an account exists.
- [ ] Remove duplicate toasting so one failure produces one message.

### Acceptance criteria

- [ ] Password and Google login work on desktop/mobile and same-site/cross-site deployment layouts.
- [ ] Deep-link return works after authentication.
- [ ] Logout is effective across page refresh, API calls, sockets, and multiple tabs.
- [ ] Loading controls recover from OAuth popup/redirect failures.

## M1-T05 — Add account recovery and account verification

- **Priority:** P1

### Implementation tasks

- [ ] Implement the missing `/forgot-password` page and API request endpoint.
- [ ] Generate single-use, hashed, expiring reset tokens; never store raw reset tokens.
- [ ] Implement reset confirmation with password policy and session revocation.
- [ ] Add email ownership verification for local accounts.
- [ ] Prevent unverified accounts from high-risk workflows according to product policy.
- [ ] Add resend limits, generic responses, audit events, and expiration behavior.
- [ ] Add change-email verification for both old and new addresses.
- [ ] Add optional or required MFA for doctors and mandatory MFA for administrators.
- [ ] Provide recovery codes and safe MFA reset procedures.

### Acceptance criteria

- [ ] Recovery does not permit account enumeration, replay, or reuse.
- [ ] Password changes revoke prior sessions.
- [ ] Admin MFA is enforced in production.

## M1-T06 — Harden login and account endpoints

- **Priority:** P0

### Implementation tasks

- [ ] Add dedicated per-IP and per-account rate limits for login, registration, recovery, resend, OAuth callback abuse, and password changes.
- [ ] Add progressive delays or temporary lockouts without enabling denial-of-service against a known user.
- [ ] Validate password length and compromised-password policy; allow password managers and paste.
- [ ] Normalize email consistently before uniqueness checks.
- [ ] Ensure local users cannot be created without a password and OAuth users cannot accidentally authenticate with an undefined password.
- [ ] Add audit events for login success/failure, password reset, MFA, email change, role change, session revocation, and account deletion.
- [ ] Return safe production errors; attach correlation IDs for support.

## M1-T07 — Replace client-only route guarding

- **Priority:** P1

### Implementation tasks

- [ ] Replace deprecated `middleware.ts` convention with the current Next.js proxy convention.
- [ ] Delete abandoned AI/prompt-style implementation commentary from middleware.
- [ ] Protect patient, doctor, admin, profile, booking, queue, and telehealth routes consistently.
- [ ] Make route authorization based on a server-verifiable session, not local-storage hydration.
- [ ] Redirect wrong-role users before protected page content renders.
- [ ] Retain backend authorization as the authoritative control; frontend guards are UX only.
- [ ] Define behavior for expired sessions, suspended users, deleted users, and role changes.

### Acceptance criteria

- [ ] Unauthenticated requests to protected page routes redirect without protected content flash.
- [ ] Cross-role route tests pass for patient, doctor, admin, anonymous, suspended, and expired-session cases.

---

# M2 — Telehealth Privacy, Reliability, and Safety

## M2-T01 — Authenticate and authorize Socket.IO connections

- **Priority:** P0

### Implementation tasks

- [ ] Authenticate the Socket.IO handshake using the same revocable server session as HTTP.
- [ ] Reject missing, expired, revoked, or malformed sessions before connection is established.
- [ ] Attach the minimal authenticated user identity and role to the socket server-side.
- [ ] Validate every event payload with a schema and strict size limits.
- [ ] Add rate limits for connections, joins, signaling messages, and malformed payloads.
- [ ] Remove trust in client-supplied names, roles, doctor IDs, clinic IDs, and appointment IDs.
- [ ] Sanitize production socket logs and add correlation/session IDs without health data.

## M2-T02 — Authorize queue and telehealth room membership

- **Priority:** P0

### Implementation tasks

- [ ] For `join-queue`, verify the user owns the appointment or is its assigned doctor/admin.
- [ ] For clinic/doctor queue rooms, verify doctor/admin scope or define a separate public display payload containing no personal data.
- [ ] For telehealth, resolve room membership from an appointment; do not accept arbitrary room IDs as authority.
- [ ] Permit only the assigned patient and assigned verified doctor during an allowed time window.
- [ ] Enforce a participant limit and reject extra connections.
- [ ] Issue short-lived signed room access grants and support revocation.
- [ ] Record join, leave, denial, start, and end events without recording media content.
- [ ] Remove or rotate predictable room identifiers from persistent public URLs.

### Acceptance criteria

- [ ] An authenticated unrelated patient, unrelated doctor, anonymous user, and expired session cannot join or signal into a room.
- [ ] Replayed and tampered room grants fail.
- [ ] No signaling event can target a room the sender has not joined and been authorized for.

## M2-T03 — Add production-grade WebRTC connectivity

- **Priority:** P1

### Implementation tasks

- [ ] Deploy or subscribe to authenticated TURN service with short-lived credentials.
- [ ] Configure regional STUN/TURN servers, UDP/TCP/TLS fallbacks, and environment-specific endpoints.
- [ ] Add connectivity diagnostics without exposing local IP details in logs.
- [ ] Implement negotiation collision handling, ICE restart, reconnect, network switching, and participant refresh.
- [ ] Handle camera/microphone permission denial and allow audio-only fallback.
- [ ] Add pre-call device selection, preview, microphone test, and bandwidth check.
- [ ] Add clear connection-quality, reconnecting, failed-call, and support states.
- [ ] Test behind symmetric NAT, VPN, hospital/corporate firewalls, mobile networks, and low bandwidth.

## M2-T04 — Complete telehealth product controls

- **Priority:** P1

### Implementation tasks

- [ ] Add a waiting room so patients cannot enter before the clinician.
- [ ] Prevent entry outside the appointment window unless explicitly allowed.
- [ ] Add participant identity display based on server data.
- [ ] Add consent confirmation and emergency limitations before joining.
- [ ] Add accessible labels/tooltips for microphone, camera, and end-call buttons.
- [ ] Confirm before ending a call and return users to the correct role dashboard.
- [ ] Add call-duration handling, appointment-state integration, and post-call workflow.
- [ ] Decide whether screen sharing, chat, attachments, recording, or captions are supported; do not imply them without implementation.
- [ ] If recording is ever added, require explicit consent, retention, access controls, and jurisdiction review.

---

# M3 — Medical Records, Privacy Boundaries, and File Safety

## M3-T01 — Separate private clinical notes from patient-visible records

- **Priority:** P0

### Implementation tasks

- [ ] Define a field-level visibility matrix for diagnosis, symptoms, prescriptions, treatment plan, clinician-private notes, follow-up, attachments, and metadata.
- [ ] Rename fields to remove ambiguity, such as `patientInstructions` and `clinicianPrivateNotes`.
- [ ] Split private notes into a distinct model or explicitly excluded API projection.
- [ ] Ensure patient list/detail/PDF endpoints never return private notes.
- [ ] Ensure only the authoring clinician and explicitly authorized clinical/admin roles can read or change private notes.
- [ ] Record access and edits in an immutable audit trail.
- [ ] Backfill or migrate existing data safely and verify historical records.

### Acceptance criteria

- [ ] Automated field-level authorization tests prove private notes are absent from patient responses, logs, exports, caches, and PDFs.
- [ ] UI copy and actual visibility match exactly.

## M3-T02 — Strengthen medical-record authorization

- **Priority:** P0

### Implementation tasks

- [ ] Enforce role authorization for every list, detail, create, update, attachment, and export operation.
- [ ] Verify the doctor is assigned to the referenced appointment and the appointment belongs to the patient.
- [ ] Define whether a doctor may access only their own records or a broader care-team history; implement explicit consent and policy for broader access.
- [ ] Prevent IDOR through guessed record, appointment, patient, or attachment IDs.
- [ ] Restrict administrators to support/compliance use cases; consider break-glass access with reason capture.
- [ ] Add immutable author, creation time, revision history, and correction/addendum workflow.
- [ ] Prevent silent overwrite of finalized clinical records.

## M3-T03 — Secure medical and verification file handling

- **Priority:** P0

### Implementation tasks

- [ ] Do not trust MIME type or extension supplied by the browser; inspect file signatures.
- [ ] Separate image uploads from doctor-license documents and apply per-purpose allowlists.
- [ ] Add antivirus/malware scanning and quarantine before availability.
- [ ] Strip image metadata where appropriate and re-encode profile images.
- [ ] Use private object storage for medical records and license documents.
- [ ] Replace permanent public Cloudinary URLs with short-lived signed download URLs.
- [ ] Authorize every download server-side and log access.
- [ ] Define file-size, page-count, pixel-dimension, decompression, field-count, timeout, and concurrent-upload limits.
- [ ] Clean up partial/aborted uploads and orphaned objects.
- [ ] Add retention and deletion jobs synchronized with database state.

## M3-T04 — Protect sensitive data at rest, in transit, and in logs

- **Priority:** P0

### Implementation tasks

- [ ] Enforce TLS for browser, API, database, storage, socket, and TURN traffic.
- [ ] Confirm database and backup encryption; consider application-level encryption for especially sensitive fields.
- [ ] Use a managed secrets store and rotate JWT, OAuth, database, Cloudinary, TURN, and email secrets.
- [ ] Redact authorization headers, cookies, reset tokens, room grants, symptoms, diagnoses, prescriptions, private notes, and file URLs from logs.
- [ ] Define log retention and access control.
- [ ] Add data classification and code-review guidance.
- [ ] Verify environment files remain gitignored and add automated secret scanning.

## M3-T05 — Add patient data rights and lifecycle operations

- **Priority:** P1

### Implementation tasks

- [ ] Implement account data export in a documented portable format.
- [ ] Implement deletion/anonymization according to medical-record retention obligations.
- [ ] Handle dependent appointments, reviews, queues, doctor profiles, files, sessions, notifications, feedback, and audit records deliberately.
- [ ] Prevent orphaned records when an admin deletes a user, doctor, or clinic.
- [ ] Add deactivate/suspend workflows rather than destructive deletion where records must be retained.
- [ ] Add restoration and mistaken-deletion processes.

---

# M4 — Doctor Trust, Booking, Queue, Reviews, and Data Integrity

## M4-T01 — Enforce doctor onboarding and verification states

- **Priority:** P0

### Implementation tasks

- [ ] Define onboarding states: account created, profile incomplete, verification not submitted, pending, approved, rejected, suspended, expired.
- [ ] Prevent doctor accounts from creating arbitrary profiles for another user.
- [ ] Require complete qualification, specialization, clinic association, license number, and approved document before public listing.
- [ ] Filter public doctor queries and clinic doctor lists to approved, active doctors only.
- [ ] Prevent bookings and availability publication for unapproved/suspended doctors.
- [ ] Show truthful verification status to the doctor and admin.
- [ ] Add rejection reasons, resubmission, expiry dates, renewal reminders, and suspension audit events.
- [ ] Make admin verification require MFA and record reviewer, timestamp, reason, and prior state.

## M4-T02 — Build authoritative availability validation

- **Priority:** P0

### Implementation tasks

- [ ] Store clinic and doctor schedules in a canonical timezone-aware format.
- [ ] Validate date, local time, working day, breaks, blocked slots, leave, appointment duration, buffer, maximum daily capacity, and consultation type server-side.
- [ ] Reject past appointments and dates beyond the supported booking horizon.
- [ ] Verify clinic ID matches the doctor’s permitted clinic relationship.
- [ ] Verify the clinic and doctor are active and the doctor is verified.
- [ ] Define rescheduling, cancellation cutoff, late-arrival, no-show, and emergency behavior.
- [ ] Make slot responses and booking validation use the same scheduling service.
- [ ] Do not trust fee, doctor name, specialization, clinic, or availability passed in URL query parameters.

## M4-T03 — Make slot allocation concurrency-safe

- **Priority:** P0

### Implementation tasks

- [ ] Add a database-level unique constraint for active doctor/clinic/date/slot occupancy or use a dedicated slot-reservation model.
- [ ] Normalize slot time before indexing; avoid free-form strings as the authoritative value.
- [ ] Use transactions or atomic conditional writes for reservation and appointment creation.
- [ ] Handle duplicate-key conflicts as a normal 409 response.
- [ ] Add idempotency keys to booking requests so retries cannot create duplicates.
- [ ] Add temporary reservation expiry if a multi-step/payment flow requires it.
- [ ] Load-test simultaneous booking attempts for the same and different slots.

### Acceptance criteria

- [ ] Exactly one of at least 100 concurrent same-slot attempts succeeds.
- [ ] Client retries return the original booking rather than creating another appointment.

## M4-T04 — Make queue token generation atomic

- **Priority:** P0

### Implementation tasks

- [ ] Replace “find maximum token then add one” with an atomic per-clinic/per-doctor/per-day counter.
- [ ] Allocate token and create appointment in one transaction where supported.
- [ ] Define timezone boundaries for “day.”
- [ ] Preserve uniqueness at the database layer.
- [ ] Define behavior after cancellations; do not reuse tokens unless explicitly intended.
- [ ] Test concurrent allocation, database retry, rollback, and midnight boundary behavior.

## M4-T05 — Formalize appointment and queue state machines

- **Priority:** P1

### Implementation tasks

- [ ] Define allowed appointment transitions for booked, checked-in/waiting, called/in-progress, completed, cancelled, and no-show.
- [ ] Define which role can perform each transition and under what timing conditions.
- [ ] Reject invalid transitions such as completing a cancelled appointment or checking in twice.
- [ ] Make queue membership update atomically with appointment status.
- [ ] Prevent duplicate queue entries and duplicate “call next” operations under concurrency.
- [ ] Calculate wait time from doctor/clinic duration and active queue state rather than a hard-coded 15 minutes.
- [ ] Define emergency-priority policy, authorization, auditing, and fairness safeguards.
- [ ] Make socket events derive from committed database state.
- [ ] Add idempotency and optimistic concurrency/version checks to state changes.

## M4-T06 — Correct date, timezone, and scheduling behavior

- **Priority:** P1

### Implementation tasks

- [ ] Choose canonical storage in UTC plus explicit clinic timezone.
- [ ] Avoid server-local `setHours` for clinic-day calculations.
- [ ] Test daylight-saving changes, non-hour offsets, midnight boundaries, browser/server timezone mismatch, and invalid dates.
- [ ] Display appointment timezone clearly and include it in reminders and telehealth windows.
- [ ] Define localization for dates, currencies, phone numbers, and units.

## M4-T07 — Make reviews verified and abuse-resistant

- **Priority:** P1

### Implementation tasks

- [ ] Allow only patient accounts to review.
- [ ] Require a completed appointment with the reviewed doctor or clinic.
- [ ] Associate each review with an appointment and enforce one review per appointment.
- [ ] Define edit window, deletion, moderation, reporting, appeal, and provider response behavior.
- [ ] Validate comment length/content and reject invalid doctor/clinic IDs.
- [ ] Add spam/rate controls and audit moderation actions.
- [ ] Remove hard-coded ratings from cards; display computed counts and an honest “No reviews yet” state.
- [ ] Recompute/cache aggregates safely and test rounding.

## M4-T08 — Add transactional notifications

- **Priority:** P1

### Implementation tasks

- [ ] Select email/SMS/push providers and obtain user consent where required.
- [ ] Send verification, booking confirmation, reschedule, cancellation, check-in, queue call, telehealth link, follow-up, and password-recovery messages.
- [ ] Use server-generated links and never include excessive health information.
- [ ] Add templates, localization, delivery status, retries, deduplication, bounce handling, and user preferences.
- [ ] Add an in-app notification API/UI if the existing notification model is retained.

---

# M5 — Replace Fake Success States and Repair Broken Workflows

## M5-T01 — Inventory every interactive control

- **Priority:** P1

### Implementation tasks

- [ ] Create an inventory of every form, link, button, card, menu item, filter, CTA, and modal.
- [ ] Classify each as implemented, partially implemented, placeholder, broken, duplicate, or intentionally informational.
- [ ] For each nonfunctional control, implement it, disable it with explanatory copy, label it “Demo,” or remove it.
- [ ] Add automated link checking for internal routes.

## M5-T02 — Fix confirmed 404 routes and missing assets

- **Priority:** P1

### Confirmed broken destinations

- [ ] `/forgot-password` — implement account recovery.
- [ ] `/dashboard/appointments` — redirect to or replace with `/patient-dashboard/appointments`.
- [ ] `/admin-dashboard/analytics` — implement or remove the navigation entry.
- [ ] `/admin-dashboard/settings` — implement or remove the navigation entry.
- [ ] `/appointments` and `/admin` from the legacy/common navbar — update or delete unused navbar code.
- [ ] `/grid.svg` — add the intended asset or remove both references.
- [ ] Social links using `href="#"` — replace with verified destinations or remove.
- [ ] About-page team social links — replace or remove.
- [ ] Cookie-policy external links — switch to HTTPS and verify relevance.

### Acceptance criteria

- [ ] Automated crawl of every internal link produces no unexpected 404.
- [ ] Browser console/network logs contain no missing first-party assets on core pages.

## M5-T03 — Implement the contact workflow

- **Priority:** P1

### Implementation tasks

- [ ] Replace the artificial delay with an API endpoint or support-provider integration.
- [ ] Bind labels to inputs, preserve entered data on failure, and validate on both client and server.
- [ ] Add spam prevention, per-IP/email throttling, maximum lengths, safe rendering, and abuse monitoring.
- [ ] Create a support ticket or send to a managed inbox with delivery confirmation.
- [ ] Store only required data with retention and deletion rules.
- [ ] Show a reference number and distinguish accepted from actually delivered.
- [ ] Replace placeholder phone, email, response-time, address, and map details with verified information.

## M5-T04 — Decide and implement the laboratory product scope

- **Priority:** P1

### Option A: Real lab marketplace

- [ ] Create lab provider, test, package, price, location, availability, preparation instruction, booking, order, collection, status, report, cancellation, and refund models.
- [ ] Implement provider/admin management and patient order history.
- [ ] Validate collection date, service area, address, phone, consent, fasting requirements, and age constraints.
- [ ] Integrate payment and provider fulfillment.
- [ ] Secure report upload/download as health information.
- [ ] Add notifications and support escalation.

### Option B: De-scope for launch

- [ ] Remove purchase language and fake booking success.
- [ ] Mark content as an illustrative catalog or remove the page from navigation and sitemap.

### Acceptance criteria

- [ ] No lab booking can report success without a persisted, traceable booking/order.

## M5-T05 — Decide and implement the medicines product scope

- **Priority:** P1

### Option A: Real commerce workflow

- [ ] Create authoritative catalog, SKU, inventory, price, tax, seller, cart, address, order, payment, fulfillment, cancellation, return, and refund models.
- [ ] Add real cart state and checkout rather than a toast.
- [ ] Enforce prescription requirements with pharmacist/provider review.
- [ ] Add dosage and safety disclaimers without giving unreviewed treatment advice.
- [ ] Define geography, licensing, age, controlled-substance, and substitution rules.
- [ ] Add order history, invoices, notifications, and support.

### Option B: De-scope for launch

- [ ] Remove prices, discounts, cart language, and purchase actions.
- [ ] Present only reviewed educational content, or remove the page.

## M5-T06 — Complete careers and blog behavior

- **Priority:** P2

### Careers

- [ ] Replace fabricated openings with an ATS or managed content source.
- [ ] Make Apply lead to a real accessible job detail/application flow.
- [ ] Add job IDs, posting/closing dates, location/legal entity, privacy notice, and equal-opportunity copy where applicable.
- [ ] Remove jobs entirely when none are open.

### Blog

- [ ] Replace fabricated articles/authors/company news with approved content.
- [ ] Add article routes, slugs, author review, medical-review attribution, citations, update dates, and corrections.
- [ ] Make category filters and Load More functional.
- [ ] Add CMS workflow, drafts, previews, editorial review, and safe rich-text rendering.

## M5-T07 — Complete admin operations

- **Priority:** P1

### Implementation tasks

- [ ] Make Create User a validated backend workflow or remove it.
- [ ] Require temporary-password delivery or invitation rather than administrator-entered permanent passwords.
- [ ] Implement or remove Analytics and Settings navigation.
- [ ] Add pagination, search, sorting, filters, loading, empty, error, and retry states for every admin table.
- [ ] Prevent an admin from accidentally deleting themselves or the last active admin.
- [ ] Replace destructive user deletion with suspension/deactivation where retention is required.
- [ ] Add confirmation requiring target identity and reason for high-risk actions.
- [ ] Audit doctor verification, role change, user suspension, record access, clinic changes, and appointment overrides.
- [ ] Scope admin privileges; do not assume every administrator needs all health data.

---

# M6 — Responsive UX, Navigation, and Design Consistency

## M6-T01 — Implement complete mobile public navigation

- **Priority:** P1

### Implementation tasks

- [ ] Add a visible mobile menu trigger to `GlobalNavbar`.
- [ ] Include Doctors, Clinics, Telehealth, Lab Tests, Health Check, Medicines, About/Contact as approved, sign in/register, and authenticated account actions.
- [ ] Trap focus inside the open menu and restore focus on close.
- [ ] Support keyboard, screen reader, escape, outside click, route change, and scroll locking.
- [ ] Show role-correct dashboard/profile/logout actions on mobile.
- [ ] Keep theme control labeled and reachable.
- [ ] Test 320, 360, 375, 390, 414, 768, 1024, and desktop widths.

## M6-T02 — Correct homepage responsive defects

- **Priority:** P1

### Implementation tasks

- [ ] Preserve location search on mobile or intentionally redesign the flow with an explicit second step.
- [ ] Prevent desktop doctor-search placeholder truncation.
- [ ] Fix trusted-provider strip clipping and avoid presenting unauthorized logos.
- [ ] Ensure popular-category cards do not create horizontal overflow.
- [ ] Add meaningful reduced-motion behavior for marquee/animations.
- [ ] Remove the missing grid asset request.
- [ ] Verify hero image focal point, contrast, and performance at each breakpoint.

## M6-T03 — Unify Curevo and SmartQueue branding

- **Priority:** P1

### Implementation tasks

- [ ] Decide the product/company name and approved descriptor.
- [ ] Create a single logo component, color system, typography system, favicon, social image, and naming glossary.
- [ ] Replace inconsistent Curevo, SmartQueue, SmartQueue Medical OS, and Curevo SmartQueue labels.
- [ ] Align titles, footer copyright, legal entity, email domains, PDFs, notifications, and OAuth consent screen.
- [ ] Remove unused duplicate navbar/button/input implementations.

## M6-T04 — Standardize asynchronous UI states

- **Priority:** P1

### Implementation tasks

- [ ] Do not display “0 results” while the query is still loading.
- [ ] Add explicit loading, empty, error, retry, offline, stale-data, and partial-data states to all queries.
- [ ] Distinguish no data from failed API or missing configuration.
- [ ] Preserve form values after recoverable errors.
- [ ] Disable duplicate submissions and show progress without trapping the user indefinitely.
- [ ] Use one notification system instead of both React Hot Toast and Sonner unless responsibilities are explicit.
- [ ] Add route-level error boundaries and friendly not-found pages.

## M6-T05 — Fix authentication-page rendering and theme behavior

- **Priority:** P1

### Implementation tasks

- [ ] Reproduce and eliminate the low-contrast/near-invisible initial mobile auth render.
- [ ] Avoid returning a blank page while persisted auth state hydrates.
- [ ] Establish deterministic server/client theme behavior without suppressing genuine hydration errors globally.
- [ ] Test system, light, and dark themes with cleared storage and saved preference.
- [ ] Remove synchronous effect state patterns flagged by React lint where a CSS or mounted-safe alternative exists.
- [ ] Confirm inputs, separators, logos, validation messages, and buttons meet contrast requirements.

## M6-T06 — Improve booking UX correctness

- **Priority:** P1

### Implementation tasks

- [ ] Fetch doctor/clinic/fee details from authoritative API data rather than trusting query-string display data.
- [ ] Preserve intended booking after login.
- [ ] Display timezone, consultation type, fee breakdown, cancellation policy, and doctor verification.
- [ ] Revalidate the slot immediately before confirmation.
- [ ] Show conflict recovery and alternative slots.
- [ ] Ensure success links go to existing patient appointment/dashboard routes.
- [ ] Never state “instantly confirmed” until persistence and, if applicable, payment/provider confirmation succeed.

---

# M7 — Accessibility and Inclusive Healthcare UX

## M7-T01 — Establish WCAG 2.2 AA as a release requirement

- **Priority:** P1

### Implementation tasks

- [ ] Add automated axe testing for public pages, auth, booking, dashboards, dialogs, tables, queue, records, and telehealth.
- [ ] Perform manual keyboard-only and screen-reader testing; automation is not sufficient.
- [ ] Record supported browser/assistive technology combinations.
- [ ] Fail CI on new serious/critical automated accessibility violations.
- [ ] Create an accessibility statement and support contact only after actual testing.

## M7-T02 — Correct semantics and accessible names

- **Priority:** P1

### Implementation tasks

- [ ] Associate every `Label` with an input ID, including contact, filters, modal forms, and profile forms.
- [ ] Give icon-only buttons accessible names: filter, download, edit, overflow menu, close dialog, date reset, microphone, camera, and end call.
- [ ] Use buttons/links for interactive cards rather than click handlers on generic containers.
- [ ] Ensure role-selection cards are radio controls with keyboard operation and selected state.
- [ ] Add meaningful alt text for informative images and empty alt for decorative images.
- [ ] Ensure headings are ordered and pages have one clear primary heading.
- [ ] Add landmarks, skip link, descriptive link text, table captions/headers, and dialog descriptions.

## M7-T03 — Make dynamic workflows accessible

- **Priority:** P1

### Implementation tasks

- [ ] Announce validation errors and move focus to an error summary.
- [ ] Announce booking status, queue position changes, patient-called events, telehealth connection state, uploads, and toast outcomes through appropriate live regions.
- [ ] Preserve focus through modal steps and return focus when dialogs close.
- [ ] Expose assessment progress semantically.
- [ ] Ensure charts have text/table alternatives.
- [ ] Do not rely only on color for status, risk, availability, or validation.

## M7-T04 — Motion, contrast, zoom, and touch

- **Priority:** P1

### Implementation tasks

- [ ] Respect `prefers-reduced-motion` for Framer Motion, marquees, animated counters, pulsing badges, and page transitions.
- [ ] Prevent initial opacity animations from hiding essential content when scripts fail or snapshots occur.
- [ ] Verify text, placeholder, disabled-control, chart, and focus-indicator contrast in both themes.
- [ ] Support 200% zoom and text spacing without loss of functionality.
- [ ] Use at least 44×44 CSS pixel touch targets for primary mobile controls.
- [ ] Avoid horizontal scrolling at supported widths except intentional data tables with clear affordances.

## M7-T05 — Improve health literacy and safety language

- **Priority:** P0/P1

### Implementation tasks

- [ ] Use plain language for risk, queue, booking, telehealth, prescription, and privacy information.
- [ ] Explain what automated assessments do and do not do before collection.
- [ ] Provide emergency guidance for chest pain, breathing difficulty, self-harm, and other high-risk responses.
- [ ] Do not reduce clinical risk to unsupported scores or labels.
- [ ] Have clinically relevant copy reviewed by a qualified professional and version the review.
- [ ] Plan localization and culturally appropriate content for target markets.

---

# M8 — SEO, Content Integrity, and Discoverability

## M8-T01 — Implement unique metadata and canonicals

- **Priority:** P2

### Implementation tasks

- [ ] Remove the root-level canonical `/` from inheritance across all pages.
- [ ] Add unique title, description, canonical, Open Graph, and Twitter metadata for every indexable page.
- [ ] Generate dynamic metadata for doctor, clinic, and article pages from authoritative data.
- [ ] Use a required production site URL; fail deployment if it falls back to localhost.
- [ ] Add appropriate noindex behavior for auth, booking confirmation, dashboards, profile, queue, telehealth rooms, search variants, and staging.
- [ ] Define pagination/filter canonical behavior.

## M8-T02 — Add appropriate structured data

- **Priority:** P2

### Implementation tasks

- [ ] Add `Organization`/`WebSite` schema only with verified company information.
- [ ] Add `Physician`, `MedicalClinic`, `BreadcrumbList`, and `Article` schema where accurate.
- [ ] Do not emit ratings unless derived from eligible real reviews.
- [ ] Validate schema in automated tests and search-engine tools.
- [ ] Keep structured data synchronized with visible content.

## M8-T03 — Correct sitemap and robots behavior

- **Priority:** P2

### Implementation tasks

- [ ] Include all approved public static routes and real dynamic doctor/clinic/article routes.
- [ ] Exclude private, duplicate, empty, demo, and unimplemented pages.
- [ ] Use meaningful content modification dates instead of generating the current time on every sitemap request.
- [ ] Verify robots rules do not substitute for authorization.
- [ ] Add staging-wide `noindex` and production validation.

## M8-T04 — Establish trustworthy content governance

- **Priority:** P1/P2

### Implementation tasks

- [ ] Assign author, medical reviewer where needed, citations, created date, reviewed date, and next review date.
- [ ] Add correction and content-expiry workflows.
- [ ] Remove fabricated authors, company news, provider relationships, and facility descriptions.
- [ ] Define approved sources for health content and prohibit uncited clinical claims.
- [ ] Add content tests for banned/unsupported claims.

---

# M9 — Code Quality, Architecture, Tests, and CI

## M9-T01 — Make lint a meaningful quality gate

- **Priority:** P1
- **Baseline:** 305 frontend warnings and zero errors, with lint still exiting successfully.

### Implementation tasks

- [ ] Save the current warning inventory by rule and directory.
- [ ] Fix React effect warnings, missing dependencies, incompatible-library usage, unescaped text, `<img>` warnings, unused imports, and unsafe `any` types.
- [ ] Set a ratchet so warning count can only decrease during cleanup.
- [ ] Set CI to fail on warnings once the baseline reaches zero.
- [ ] Remove console logging from production paths or route it through a redacted logger.
- [ ] Update baseline browser mapping data as part of dependency maintenance.

## M9-T02 — Consolidate API clients and state management

- **Priority:** P1

### Problem

The frontend has duplicate API layers (`src/api/*` and `src/lib/services/*`), duplicate interceptors, inconsistent response shapes, and unused Zustand stores.

### Implementation tasks

- [ ] Choose one typed HTTP client and one service boundary.
- [ ] Define shared response/error types that match backend envelopes.
- [ ] Remove dead clinic/doctor/appointment stores or migrate active consumers deliberately.
- [ ] Centralize authentication, correlation ID, CSRF, cancellation, timeout, and safe error behavior.
- [ ] Generate or share API types where feasible.
- [ ] Replace `any` with domain types and runtime validation at trust boundaries.
- [ ] Ensure a 401 causes one coordinated logout/redirect rather than interceptor loops.
- [ ] Add request cancellation when filters/routes change.

## M9-T03 — Refactor backend service boundaries

- **Priority:** P2

### Implementation tasks

- [ ] Remove duplicate appointment booking logic from patient and appointment controllers.
- [ ] Move scheduling, authorization, queue transitions, notification, and record projection into testable services.
- [ ] Standardize success/error envelopes and status codes.
- [ ] Add centralized async error handling and stable machine-readable error codes.
- [ ] Validate params, query, and body for every route—not only selected endpoints.
- [ ] Reject unknown fields where mass assignment would be risky.
- [ ] Add pagination and bounded limits to every list endpoint.
- [ ] Validate ObjectIds before database queries.

## M9-T04 — Add backend unit and integration tests

- **Priority:** P0/P1

### Required suites

- [ ] Registration, login, OAuth linking, logout, recovery, MFA, session expiration, and revocation.
- [ ] Patient/doctor/admin/anonymous authorization matrix for every API route.
- [ ] Medical-record field-level privacy and IDOR cases.
- [ ] Doctor verification and suspension behavior.
- [ ] Booking availability, invalid dates, clinic mismatch, unverified doctor, slot conflict, and idempotency.
- [ ] Concurrent slot booking and queue token allocation.
- [ ] Appointment/queue state transitions and socket emissions after commit.
- [ ] Review eligibility and duplicate prevention.
- [ ] Upload type, signature, size, malware/quarantine, authorization, and cleanup.
- [ ] Rate limiting, malformed JSON/form data, NoSQL operators, prototype pollution, and oversized requests.
- [ ] Data deletion/deactivation and referential cleanup.

### Test infrastructure

- [ ] Add isolated test database lifecycle and deterministic factories.
- [ ] Never run tests against development or production data.
- [ ] Make the backend `npm test` script execute real tests and exit correctly.

## M9-T05 — Add frontend component and end-to-end tests

- **Priority:** P1

### Component/integration coverage

- [ ] Form validation, loading, error, retry, and accessibility behavior.
- [ ] Responsive navigation and role-correct menus.
- [ ] Doctor/clinic filters and URL synchronization.
- [ ] Booking steps, slot conflict recovery, and redirect preservation.
- [ ] Dashboard role guards and record projections.
- [ ] Queue live announcements and reconnect behavior.
- [ ] Theme hydration, dark/light contrast, and reduced motion.

### End-to-end journeys

- [ ] New patient: register → verify → login → discover → book → check in → queue → complete → view record → review.
- [ ] Doctor: register → complete profile → submit verification → approval → schedule → call patient → complete consultation → create record.
- [ ] Admin: MFA login → clinic management → verification review → support case → audit event.
- [ ] Telehealth: authorized patient/doctor join, reconnect, unauthorized participant rejection, end call.
- [ ] Recovery, logout, expired session, suspended user, API outage, slow network, and mobile navigation.

## M9-T06 — Add continuous integration

- **Priority:** P1

### Required CI jobs

- [ ] Clean installs for client and server.
- [ ] Formatting check.
- [ ] ESLint with zero-warning target.
- [ ] TypeScript check.
- [ ] Frontend production build.
- [ ] Backend syntax/unit/integration tests.
- [ ] End-to-end smoke tests.
- [ ] Dependency, secret, and static security scanning.
- [ ] Accessibility scan.
- [ ] Internal-link and missing-asset scan.
- [ ] Container build and vulnerability scan if containers are deployed.
- [ ] Migration compatibility check.

### Acceptance criteria

- [ ] Protected branches require passing CI and review.
- [ ] Production deployment uses the exact tested artifact.

## M9-T07 — Replace the placeholder README with complete documentation

- **Priority:** P2

### Required documentation

- [ ] Product scope and clear demo/production status.
- [ ] Architecture diagram and trust boundaries.
- [ ] Prerequisites and supported Node/Mongo versions.
- [ ] Client/server install, environment, MongoDB, seed, build, test, and run instructions.
- [ ] Environment-variable reference without secrets.
- [ ] Role setup and safe test credentials.
- [ ] API conventions and error formats.
- [ ] Telehealth/TURN setup.
- [ ] File-storage setup.
- [ ] Deployment, migrations, backup, restore, rollback, and incident links.
- [ ] Contribution, branching, review, and release process.

---

# M10 — Production Infrastructure, Observability, and Resilience

## M10-T01 — Validate environment configuration at startup

- **Priority:** P1

### Implementation tasks

- [ ] Create typed startup validation for required client and server variables.
- [ ] Reject placeholder Cloudinary values and weak/missing secrets.
- [ ] Validate URL schemes/origins and prohibit localhost fallbacks in production.
- [ ] Separate development, test, staging, and production data/storage/OAuth projects.
- [ ] Document secret rotation and emergency revocation.
- [ ] Keep `.env.example` complete and non-sensitive.

## M10-T02 — Improve health, readiness, and deployment behavior

- **Priority:** P1

### Implementation tasks

- [ ] Split liveness from readiness endpoints.
- [ ] Readiness must reflect database and required dependency availability without leaking details.
- [ ] Add graceful shutdown for HTTP, sockets, database, and in-flight requests.
- [ ] Add startup/shutdown timeouts and nonzero failure exits.
- [ ] Pin runtime/container versions and use reproducible builds (`npm ci`).
- [ ] Run as non-root with minimal container privileges where applicable.
- [ ] Add deployment migrations/index synchronization before traffic shift.
- [ ] Replace Render `npm install` with reproducible install and explicit build/test gates.

## M10-T03 — Add structured logging, metrics, tracing, and error monitoring

- **Priority:** P1

### Implementation tasks

- [ ] Replace development Morgan output and scattered console calls with structured environment-aware logging.
- [ ] Add correlation/request IDs across frontend support reports, API, jobs, sockets, and notifications.
- [ ] Redact sensitive fields by default.
- [ ] Add error monitoring with source maps and environment/release tags.
- [ ] Measure request rate, latency, error rate, saturation, DB latency, socket connections, signaling failures, queue lag, booking conflicts, notification failures, and upload failures.
- [ ] Add distributed tracing for booking, queue, telehealth authorization, and record operations.
- [ ] Create actionable alerts with owners, thresholds, runbooks, and escalation.
- [ ] Do not send health information to analytics or monitoring providers without explicit review and agreements.

## M10-T04 — Implement immutable security and clinical audit events

- **Priority:** P0

### Events to record

- [ ] Authentication, recovery, MFA, session, and privilege events.
- [ ] Record create/read/export/update/correction events.
- [ ] Doctor license submission/review/suspension events.
- [ ] Admin user/role/clinic/appointment overrides.
- [ ] Telehealth room authorization, join, leave, and denial.
- [ ] File download and deletion.
- [ ] Consent acceptance/revocation and policy version.

### Requirements

- [ ] Audit events are append-only, timestamped, actor/target/action/result aware, and protected from ordinary admins.
- [ ] Audit records exclude unnecessary clinical content.
- [ ] Retention, access, export, and anomaly review procedures are documented.

## M10-T05 — Backups, restore, continuity, and data durability

- **Priority:** P0

### Implementation tasks

- [ ] Configure encrypted automated database and object-storage backups.
- [ ] Define RPO/RTO for appointments, queues, records, and account data.
- [ ] Test point-in-time restore into an isolated environment.
- [ ] Verify referential consistency between database records and stored files after restore.
- [ ] Document regional outage, database outage, storage outage, email/SMS outage, and TURN outage behavior.
- [ ] Create downtime procedures for clinics so patient care does not depend on an unavailable queue system.
- [ ] Schedule recurring restore drills and record evidence.

## M10-T06 — Abuse prevention and service limits

- **Priority:** P1

### Implementation tasks

- [ ] Define endpoint-specific rate limits rather than relying only on one global API limit.
- [ ] Bound JSON, URL-encoded, query, pagination, aggregation, socket, and upload resource consumption.
- [ ] Add timeouts, circuit breakers, retry budgets, and backpressure for dependencies.
- [ ] Protect public search and review endpoints from scraping and abuse without breaking accessibility.
- [ ] Add bot/spam protection to registration, recovery, contact, reviews, and bookings where risk warrants it.
- [ ] Test graceful degradation and ensure errors do not reveal internals.

## M10-T07 — Incident response and security operations

- **Priority:** P0

### Implementation tasks

- [ ] Create incident severity levels and on-call contacts.
- [ ] Write runbooks for credential exposure, account takeover, unauthorized record access, telehealth intrusion, malware upload, data corruption, and availability outage.
- [ ] Define evidence preservation, user/customer notification, regulatory notification, containment, recovery, and post-incident review.
- [ ] Add a vulnerability disclosure/security contact.
- [ ] Run tabletop exercises before public launch.

---

# M11 — Performance and Scalability

## M11-T01 — Establish performance budgets and measurement

- **Priority:** P2

### Implementation tasks

- [ ] Record Core Web Vitals on representative mobile and desktop devices.
- [ ] Set page-level budgets for LCP, INP, CLS, JavaScript, CSS, image bytes, requests, and API latency.
- [ ] Run repeatable Lighthouse/WebPageTest checks in CI or scheduled monitoring.
- [ ] Test cold load, repeat load, slow 4G, CPU throttling, API latency, and unavailable API.

## M11-T02 — Optimize images, fonts, and missing assets

- **Priority:** P2

### Implementation tasks

- [ ] Replace raw `<img>` usage with optimized image handling where appropriate.
- [ ] Define safe remote image allowlists or proxy/storage policy.
- [ ] Set intrinsic dimensions to prevent layout shift.
- [ ] Avoid large external Unsplash CSS backgrounds as unbounded critical assets; host optimized approved assets.
- [ ] Remove duplicate font strategies: current code loads Geist through Next while CSS imports Google fonts and package dependencies include local font sources.
- [ ] Self-host the chosen production fonts and preload only required weights.
- [ ] Resolve `/grid.svg` and all other missing assets.

## M11-T03 — Reduce client-side work and animation cost

- **Priority:** P2

### Implementation tasks

- [ ] Review every `"use client"` page and move static content to server components.
- [ ] Lazy-load heavy PDF, chart, telehealth, and assessment code.
- [ ] Analyze bundles and remove dead component libraries, icons, stores, and duplicate utilities.
- [ ] Avoid animation wrappers for content that does not benefit from them.
- [ ] Prevent repeated hydration gates and state-setting effects.
- [ ] Virtualize or paginate large admin and appointment lists.

## M11-T04 — Scale API and database access safely

- **Priority:** P1/P2

### Implementation tasks

- [ ] Add bounded pagination to doctor, clinic, review, appointment, feedback, record, and admin lists.
- [ ] Review MongoDB indexes against actual query plans.
- [ ] Avoid unbounded regex searches and aggregation over all documents.
- [ ] Add search strategy appropriate to scale and protect regex inputs.
- [ ] Use projections to return only required fields.
- [ ] Add caching only where privacy and invalidation are understood; never share user-specific health responses.
- [ ] Load-test expected clinic, queue, booking, and socket concurrency.

---

# M12 — Analytics and Product Measurement With Privacy Controls

## M12-T01 — Define a privacy-safe event model

- **Priority:** P2

### Implementation tasks

- [ ] Define business questions before selecting a vendor.
- [ ] Track only necessary events such as page viewed, search used, booking funnel step, successful booking, and recoverable failure.
- [ ] Prohibit symptoms, diagnoses, prescription text, record IDs, room IDs, tokens, emails, phone numbers, names, and free text in analytics.
- [ ] Define consent requirements, retention, deletion, access, sampling, and environment separation.
- [ ] Validate vendor agreements for the intended data category and jurisdiction.
- [ ] Add automated payload tests to prevent sensitive-field leakage.

## M12-T02 — Measure reliability separately from marketing analytics

- **Priority:** P2

### Implementation tasks

- [ ] Measure booking completion/failure by stable non-sensitive error code.
- [ ] Measure queue update latency and reconnect rate.
- [ ] Measure telehealth connection success without capturing media or health content.
- [ ] Measure notification delivery and recovery-flow success.
- [ ] Build operational dashboards owned by engineering and product.

---

# M13 — Optional Future Enhancements After Production Readiness

These tasks must not displace open P0/P1 remediation.

## M13-T01 — Payments and billing

- [ ] Define appointment, lab, and medicine payment scope.
- [ ] Use a compliant provider-hosted payment flow; never store raw card data.
- [ ] Implement price snapshotting, tax, invoices, webhook verification, idempotency, reconciliation, refunds, disputes, and audit logs.
- [ ] Ensure appointment state cannot become paid/confirmed from an unverified client callback.

## M13-T02 — Clinic tenancy and staff permissions

- [ ] Replace global roles with organization/clinic membership and scoped permissions.
- [ ] Add receptionist, clinician, verifier, billing, support, and read-only roles as required.
- [ ] Prevent cross-clinic data access and test tenant isolation comprehensively.

## M13-T03 — Interoperability

- [ ] Define export/import requirements and standards such as FHIR only if product strategy requires them.
- [ ] Add patient matching, consent, provenance, validation, and reconciliation safeguards.
- [ ] Do not advertise integration until conformance and security testing are complete.

## M13-T04 — Progressive web/mobile experience

- [ ] Add manifest, icons, install behavior, offline-safe public pages, and notification permissions only after security review.
- [ ] Never cache sensitive authenticated pages or health API responses in a service worker.

---

## 14. Cross-role authorization test matrix

Every protected resource must be tested against this matrix. “Denied” means a safe 401/403 with no resource-existence or sensitive-field leakage.

| Resource/action | Anonymous | Owning patient | Other patient | Assigned doctor | Other doctor | Clinic staff | Admin | Suspended user |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Appointment list/detail | Denied | Allowed | Denied | Allowed | Denied | Policy-defined | Allowed with audit | Denied |
| Book appointment | Denied | Allowed | N/A | Denied | Denied | Policy-defined | Allowed with audit | Denied |
| Cancel/reschedule | Denied | Policy-defined | Denied | Policy-defined | Denied | Policy-defined | Allowed with audit | Denied |
| Queue position | Denied | Allowed | Denied | Allowed | Denied | Policy-defined | Allowed | Denied |
| Full doctor queue | Denied | Denied | Denied | Assigned only | Denied | Policy-defined | Allowed | Denied |
| Medical record patient view | Denied | Allowed without private notes | Denied | Assigned/policy-defined | Denied | Policy-defined | Break-glass/audited | Denied |
| Private clinical notes | Denied | Denied | Denied | Assigned/author policy | Denied | Policy-defined | Break-glass/audited | Denied |
| Telehealth join/signaling | Denied | Assigned appointment only | Denied | Assigned appointment only | Denied | Denied | Support policy-defined | Denied |
| Doctor verification file | Denied | Denied | Denied | Own submission only | Denied | Denied | Authorized verifier only | Denied |
| Review create | Denied | Completed appointment only | Completed appointment only | Denied | Denied | Denied | Denied/moderation only | Denied |

---

## 15. Required nonfunctional test matrix

### Browsers and devices

- [ ] Current and previous major Chrome, Safari, Firefox, and Edge releases.
- [ ] iOS Safari and Android Chrome on real devices.
- [ ] 320px through large desktop layouts.
- [ ] Touch, mouse, keyboard-only, VoiceOver, NVDA, and at least one Android screen reader.

### Themes and preferences

- [ ] Light, dark, system theme, cleared preference, stored preference, and theme switch during active workflow.
- [ ] Reduced motion, increased text size, high contrast where supported, and 200% zoom.

### Network and failure conditions

- [ ] Offline, slow network, request timeout, API 401/403/404/409/422/429/500, database unavailable, storage unavailable, socket disconnected, TURN unavailable, and partial notification failure.
- [ ] Refresh/back/forward during multi-step forms.
- [ ] Duplicate click, browser retry, multi-tab use, and expired session during submission.

### Security regression

- [ ] IDOR, CSRF, XSS, NoSQL injection, prototype pollution, mass assignment, open redirect, SSRF-relevant inputs, upload bypass, token replay, socket event spoofing, rate-limit bypass, and sensitive-cache/log leakage.

---

## 16. Public production launch checklist

### Safety and legal

- [ ] No open P0 task.
- [ ] Clinical-safety review complete for all health content and automated assessments.
- [ ] Privacy, terms, cookie, telehealth consent, and data practices approved and accurate.
- [ ] Unsupported claims and fake social proof removed.
- [ ] Data-retention, deletion, export, and breach procedures tested.

### Security

- [ ] No unapproved critical/high production dependency finding.
- [ ] Independent penetration test completed; high findings remediated and retested.
- [ ] Authentication, MFA, session revocation, CSRF, socket authorization, uploads, and record authorization verified.
- [ ] Secret rotation and vulnerability disclosure processes ready.

### Reliability

- [ ] Booking and queue concurrency tests pass.
- [ ] Backup restoration and deployment rollback drills pass.
- [ ] Monitoring dashboards, alerts, runbooks, and on-call ownership are active.
- [ ] Telehealth connectivity tested through supported network conditions.

### Product and UX

- [ ] Every visible CTA is functional or clearly unavailable.
- [ ] No unexpected internal 404 or missing asset.
- [ ] Mobile navigation and primary journeys pass on real devices.
- [ ] WCAG 2.2 AA blocking issues resolved.
- [ ] All loading/error/empty states are implemented.

### Engineering

- [ ] Production build, zero-warning lint target, typecheck, tests, accessibility, security scans, and E2E suite pass in CI.
- [ ] README, architecture, environment, deployment, rollback, incident, and support documentation are complete.
- [ ] Staging uses production-like infrastructure with synthetic data.
- [ ] Release artifact is immutable and matches the tested commit.

---

## 17. Suggested implementation order inside the first remediation cycle

1. **Days 1–2:** M0-T01 through M0-T04; remove risky claims and inventory deployments/data.
2. **Days 2–5:** M1-T01 and M1-T02 dependency upgrades; create CI skeleton so future changes are checked.
3. **Week 2:** M1-T03 through M1-T07 authentication/session/route foundation.
4. **Week 3:** M2 telehealth authorization and TURN design; disable public telehealth until complete.
5. **Week 3:** M3 record projections, private notes, upload storage, and audit events.
6. **Weeks 4–5:** M4 doctor verification, atomic booking/token allocation, state machines, reviews, and timezone behavior.
7. **Weeks 5–6:** M5 broken routes and fake-success feature decisions; remove anything not ready.
8. **Weeks 6–7:** M6 responsive UX and M7 accessibility remediation.
9. **Weeks 7–8:** M8 SEO/content governance and M9 architecture/test completion.
10. **Weeks 8–9:** M10 operations, backup/restore, incident drills, and M11 performance validation.
11. **Launch preparation:** Complete Section 16 with written evidence and explicit go/no-go approval.

The schedule above is only an ordering aid. It is not a commitment estimate. Actual duration depends on team size, regulatory scope, selected infrastructure, and whether labs, medicines, payments, and clinical assessments remain in the launch scope.

---

## 18. Decisions that must be made before implementation expands

- [ ] Is the launch brand Curevo, SmartQueue, or Curevo SmartQueue?
- [ ] Is the product a clinic queue tool, healthcare marketplace, telehealth provider, wellness assessment product, pharmacy, laboratory marketplace, or a staged subset?
- [ ] Which country/jurisdiction launches first?
- [ ] Will any real protected health information be stored before formal compliance readiness?
- [ ] Are doctors independent providers, clinic staff, or platform employees?
- [ ] Who legally verifies licenses and how are renewals/suspensions handled?
- [ ] Is the health assessment retained, sent to providers, or processed only locally?
- [ ] Are lab tests and medicines launch features or prototypes to remove?
- [ ] Is appointment payment required at booking?
- [ ] What are the supported cancellation, refund, emergency, minor, and telehealth policies?
- [ ] Which staff roles need access to which patient fields?
- [ ] What are the RPO, RTO, uptime, support-hours, and incident-notification commitments?

No assumption on these questions should silently become implementation or marketing behavior. Each decision must be documented with product, legal/privacy, security, and clinical input where applicable.

---

## 19. Current implementation traceability map

This appendix identifies the primary current files to inspect when beginning each workstream. It is a starting point, not a boundary: implementations must search for all callers and duplicated behavior before editing.

| Workstream | Primary current files | Roadmap tasks |
|---|---|---|
| Root metadata, canonical, fonts, themes | `client/src/app/layout.tsx`, `client/src/app/globals.css`, `client/src/app/providers.tsx` | M6-T03, M6-T05, M8-T01, M11-T02 |
| Public navigation and footer | `client/src/components/home/GlobalNavbar.tsx`, `client/src/components/home/Navbar.tsx`, `client/src/components/common/Navbar.tsx`, `client/src/components/home/Footer.tsx` | M5-T01, M5-T02, M6-T01, M6-T03, M7-T02 |
| Homepage search and visual defects | `client/src/components/home/SearchHero.tsx`, `HomeHero.tsx`, `TrustedStrip.tsx`, `PopularCategories.tsx`, `BentoGrid.tsx` | M0-T02, M6-T02, M7-T04, M11-T02 |
| Authentication UI/state | `client/src/app/(auth)/*`, `client/src/store/authStore.ts`, `client/src/hooks/useAuth.ts`, `client/src/hooks/useRequireAuth.tsx` | M1-T03 through M1-T07, M6-T05 |
| Authentication API | `server/routes/auth.routes.js`, `server/controllers/auth.controller.js`, `server/config/passport.js`, `server/utils/generateToken.js`, `server/middlewares/auth.middleware.js` | M1-T03 through M1-T06 |
| Route protection | `client/src/middleware.ts`, protected route-group layouts, backend route modules | M1-T07, M9-T04 |
| Doctors and verification | `server/models/doctor.model.js`, `server/controllers/doctor.controller.js`, `server/controllers/admin.controller.js`, doctor/profile/admin pages | M4-T01, M4-T02, M5-T07 |
| Booking and appointments | `server/controllers/appointment.controller.js`, `server/controllers/patient.controller.js`, `server/models/appointment.model.js`, `client/src/app/(home)/book/page.tsx`, doctor detail and dashboard pages | M4-T02 through M4-T06, M6-T06 |
| Queue | `server/controllers/queue.controller.js`, `server/utils/queueManager.js`, `server/utils/tokenGenerator.js`, `server/models/queue.model.js`, queue page and socket store | M2-T01, M2-T02, M4-T04 through M4-T06 |
| Telehealth | `server/config/socket.js`, `client/src/app/(home)/telehealth/*`, `client/src/store/socketStore.ts`, appointment telehealth helpers | M2-T01 through M2-T04 |
| Medical records | `server/models/medicalRecord.model.js`, `server/controllers/medicalRecord.controller.js`, record service, patient record page, doctor consultation form | M3-T01, M3-T02, M9-T04 |
| Uploads and storage | `server/middlewares/upload.middleware.js`, `server/config/cloudinary.js`, profile image and doctor verification controllers | M3-T03, M3-T04 |
| Reviews | `server/controllers/review.controller.js`, `clinicReview.controller.js`, review models, doctor/clinic detail pages | M4-T07 |
| Labs | `client/src/lib/services/labService.ts`, `client/src/app/(home)/lab-tests/page.tsx`, `client/src/components/labs/*` | M5-T04 |
| Medicines | `client/src/lib/services/medicineService.ts`, `client/src/app/(home)/medicines/page.tsx`, `client/src/components/medicines/*` | M5-T05 |
| Health assessments and PDFs | `client/src/components/health-check/*`, `client/src/lib/healthCalculations.ts`, health-check page | M0-T02, M7-T05, M8-T04, M1-T01 |
| Contact | `client/src/app/(home)/contact/page.tsx` | M0-T02, M5-T03, M7-T02 |
| Blog/careers/about claims | corresponding pages under `client/src/app/(home)` | M0-T02, M5-T06, M8-T04 |
| Admin | `client/src/app/(admin)/*`, `client/src/components/admin/*`, `server/routes/admin.routes.js`, `server/controllers/admin.controller.js` | M3-T02, M5-T07, M10-T04 |
| API duplication | `client/src/api/*`, `client/src/lib/api.ts`, `client/src/lib/services/*`, `client/src/store/*` | M9-T02 |
| Backend architecture/validation | all `server/routes`, `controllers`, `validations`, and models | M9-T03, M9-T04 |
| Deployment/configuration | `docker-compose.yml`, `render.yaml`, environment examples, client Vercel config, Next config | M10-T01, M10-T02 |

### Baseline verification commands

These commands capture the current quality baseline. CI may later wrap them in project-level scripts, but equivalent checks must remain available locally.

```bash
cd client
npm ci
npm run lint
npm run build
npm audit --omit=dev

cd ../server
npm ci
npm test
npm audit --omit=dev
```

Additional required project scripts to add:

- [ ] Root `npm run verify` or equivalent that runs format, lint, typecheck, build, unit, integration, and safe smoke tests.
- [ ] `npm run test:authz` for the cross-role matrix.
- [ ] `npm run test:concurrency` for slot, token, queue, and idempotency behavior.
- [ ] `npm run test:e2e` for role journeys.
- [ ] `npm run test:a11y` for automated accessibility checks.
- [ ] `npm run test:links` for internal routes and first-party assets.
- [ ] `npm run audit:prod` for both workspaces with a documented exception mechanism.
- [ ] `npm run scan:secrets` and a static security scan.

### Baseline facts to close before launch

- [ ] Frontend production build currently succeeds; preserve that throughout remediation.
- [ ] Frontend lint currently reports 305 warnings; reduce to zero and make warnings fail CI.
- [ ] Frontend production dependency audit currently reports 12 vulnerabilities, including 2 critical and 7 high.
- [ ] Backend production dependency audit currently reports 12 vulnerabilities, including 8 high.
- [ ] Backend JavaScript currently passes syntax checking, but the test script contains no tests.
- [ ] Local API startup currently depends on MongoDB being started separately; document and automate a safe development/test setup.
- [ ] The current README is the default Next.js template and does not document the full-stack system.
- [ ] No CI workflow, comprehensive tests, production monitoring, or verified restore process was found during the audit.
- [ ] The repository currently contains local environment files that are ignored by Git; keep them untracked and add secret-scanning enforcement.
