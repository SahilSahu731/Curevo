# Incident and privacy operations

## Suspected security or privacy incident

1. Preserve evidence and record reporter, time, environment, identifiers, and actions.
2. Set `ALLOW_PRODUCTION_WRITES=false`, revoke exposed credentials/sessions, isolate affected systems, and restrict operator access.
3. Determine data types, people, jurisdictions, duration, recipients, provider/log/backup exposure, and whether an older clinical store is involved.
4. Engage named security, privacy, product, and legal owners. These remain unassigned, so public launch is blocked.
5. Recover from verified clean state; document notifications, decisions, monitoring, and corrective work.

## Data export

Profile → **Download my data** calls `GET /api/auth/export` and returns the member's
account, focus sessions, routines, reflections, feedback, notifications, and
consents. Password/provider subject and profile-image public ID are excluded. A
minimal one-way-email-hash request record expires after 90 days.

## Account deletion

Profile → **Delete my account and data** requires the exact email and, for local
accounts, current password. It removes member-owned focus data, feedback,
notifications, consents, sessions, and tokens; attempts tracked profile-image
cleanup; anonymizes/suspends the account; clears the cookie; and retains only the
short-lived privacy-request evidence. Backups and failed external cleanup require
operator verification.

## Legacy data and requests

Do not run destructive cleanup against former clinical databases or object stores
until they are inventoried, backed up, assigned to a data owner, and given an
approved retention/disposal plan. Authenticate legal or complaint requesters through
an independently sourced channel, minimize disclosure, record approvals, and involve
qualified counsel.
