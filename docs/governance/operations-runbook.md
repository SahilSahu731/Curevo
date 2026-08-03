# Incident and privacy operations

## Suspected security or privacy incident

1. Do not delete evidence. Record reporter, time, environment, affected identifiers, and actions in a restricted incident record.
2. Contain: set `ALLOW_PRODUCTION_WRITES=false`, revoke exposed credentials, isolate affected deployment/storage, and restrict operator access.
3. Determine data types, people, jurisdictions, duration, recipients, backup/upload/log exposure, and whether health data was involved.
4. Engage the named security, privacy, product, and legal owners. These roles are currently unassigned, so public launch is blocked.
5. Use the applicable notification matrix. Do not assume one healthcare law displaces consumer, state, national, or contractual duties.
6. Recover from a verified clean state, monitor, document decisions, and track corrective actions to closure.

## Data export

The signed-in user selects **Download my data** in Profile. `GET /api/auth/export` returns account, clinician profile, appointments, records, reviews, feedback, notifications, and consents as JSON without password/provider subject. The API records a minimal audit containing a one-way email hash and deletes that audit automatically after 90 days.

## Account deletion

The user selects **Delete account**, confirms the exact email and, for local accounts, current password. `DELETE /api/auth/account` removes linked database records and queue references, deletes tracked Cloudinary profile/license objects, deletes the user last, clears the cookie, and retains only the short-lived hashed audit. A response flag identifies failed external cleanup. Legacy uploads without public IDs and provider backups still require operator verification.

## Law-enforcement and complaint requests

Preserve the request, authenticate the requester through an independently sourced channel, require valid legal process, minimize scope, log approvals/disclosures, and notify the affected person unless lawfully prohibited. No production disclosure may occur until counsel, operator identity, jurisdiction, and a verified request address are assigned.
