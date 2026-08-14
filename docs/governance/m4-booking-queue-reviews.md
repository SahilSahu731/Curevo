# M4 booking, queue, review, and notification record

Review date: 2026-08-03

## Implemented controls

- Doctor lifecycle states are `account-created`, `profile-incomplete`, `not-submitted`, `pending`, `approved`, `rejected`, `suspended`, and `expired`. Public discovery and booking require an active user, active clinic, approved unexpired verification, stored license artifact, and enabled availability.
- Doctors may create only their own profile. Material credential changes suspend availability and return the profile to review. Verification decisions require recent MFA, a reason, reviewer identity, prior state, timestamp, expiry, history, notification, and audit event.
- Clinics declare an IANA timezone, working schedule, breaks, capacity, buffer, booking horizon, cancellation cutoff, check-in window, and supported consultation types. Doctors declare schedule overrides, blocked slots, and UTC leave periods.
- `apps/web/src/server/utils/scheduling.js` is authoritative for both public slot discovery and booking validation. Appointment authority is `slotStartUtc`, `slotEndUtc`, and `clinicTimezone`; `slotTime` is normalized display data.
- `SlotReservation` has a database partial unique index for active doctor/clinic/UTC-slot occupancy and a TTL for abandoned holds. Duplicate contention returns 409. Booking retries may supply `Idempotency-Key` and return the original appointment.
- `QueueCounter` atomically allocates monotonically increasing clinic/doctor/local-day tokens. Cancelled tokens are not reused. Appointment uniqueness remains enforced at the database.
- Appointment transitions are role-scoped and optimistic. Queue arrays use atomic set/pull operations, call-next atomically claims one entry, duplicate check-in is idempotent, and at most two emergency calls may bypass a waiting normal appointment.
- Emergency priority is administrator-only, requires a policy reason, and creates an audit event. Socket events are emitted only after persisted appointment and queue changes.
- Doctor and clinic reviews require the owning patient's completed appointment and have a unique appointment index. Published responses support a seven-day edit window, soft withdrawal, reporting, moderation with reason, appeal, provider response, rate limiting, and audit events. Public rating aggregates include published reviews only and round to one decimal.
- In-app and consented SMTP email notifications cover verification decisions/expiry, booking, video access, rescheduling, cancellation, check-in, approaching/current queue turns, appointment reminders, completion, and follow-up. Templates contain no symptoms or clinical record content. Delivery attempts, status, failure code, deduplication, locale, and preferences are stored. SMS and push are deliberately unsupported.

## Policy defaults

- Default clinic timezone: `Asia/Kolkata`.
- Default locale and currency: `en-IN` and INR; phone numbers use E.164; durations use minutes.
- Booking horizon: 90 days. Cancellation notice: 2 hours. Check-in: 60 minutes before through 60 minutes after the scheduled start.
- Emergency fairness: two consecutive emergency calls maximum while a normal patient is waiting.
- Credential approval expires after one year unless the reviewer supplies an earlier approved date.

Clinic administrators may override configurable timing defaults. Legal, clinical, and customer policy owners must approve those values before production use.

## Operations

Run these from the repository root through the web workspace:

```bash
npm run migrate:m4-integrity --workspace @curevo/web
npm run verify:m4 --workspace @curevo/web
npm run verify:m4-concurrency --workspace @curevo/web
npm run notifications:reminders --workspace @curevo/web
npm run doctors:verification-expiry --workspace @curevo/web
```

Schedule the reminder and verification-expiry commands from a single distributed scheduler in production. SMTP delivery requires `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `EMAIL_FROM`. Provider errors are retained as non-sensitive failure codes for retry; no health data is sent to the provider.

## Verification evidence

- Migration completed against the configured development MongoDB.
- The isolated same-slot test issued 100 concurrent reservation writes: one succeeded and 99 conflicted.
- The isolated counter test issued 100 concurrent allocations: 100 unique values were produced, spanning 1 through 100.
- Unit coverage includes malformed dates/times, non-hour timezone offsets, midnight boundaries, DST gaps/overlaps, onboarding eligibility, and appointment transition authorization.
- The Node server test suite and Next.js production build passed after the original M4 implementation. The combined workspace must be reverified after colocation before that evidence is reused for release.

The general public-launch block remains in effect until the governance release checklist, external policy approvals, production SMTP/provider configuration, monitoring, and production-like end-to-end testing are complete.
