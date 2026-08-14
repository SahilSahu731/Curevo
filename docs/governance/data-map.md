# Data map

Status: code-derived interim inventory, reviewed 2026-08-14. Lawful basis,
jurisdictions, operator roles, retention approval, and provider contracts remain
**UNDECIDED**.

| Data | Purpose | Storage/recipient | Current lifecycle | Sensitivity |
|---|---|---|---|---|
| Account/profile | Authentication, account display, preferences | MongoDB; optional Cloudinary profile image | Exported; personal datasets deleted and account anonymized on deletion | Personal and credential data |
| Google identity | Optional sign-in/linking | Google and MongoDB | Removed from active account on deletion; Google lifecycle is external | Identifier/linkage |
| Session/account tokens | Authentication, recovery, verification, MFA | Hashed tokens in MongoDB; HTTP-only cookie contains opaque value | TTL/revocation; deleted with account | Credentials |
| Focus sessions | Intention, times, duration, status, distraction count, closing note | MongoDB; owning member | Export/delete with account; retention sweep currently reports only | Private activity/free text |
| Routines | Title, cue, schedule, duration, completion metadata | MongoDB; owning member | Export/delete with account | Private habit/activity data |
| Reflections | Self-described focus, energy, feeling, wins, friction, next step, notes | MongoDB; owning member | Export/delete with account; not shown to administrators | Potentially sensitive free text |
| Feedback/support | Product/account requests and administrator response | MongoDB; email delivery if configured | Feedback deleted with account; support retention configured separately | Free text may be sensitive |
| Notifications/preferences | Routine/system messages and delivery choices | MongoDB; SMTP provider when email enabled | Export/delete with account | Activity metadata |
| Consent/privacy audit | Policy action and one-way email hash for request evidence | MongoDB | Consent deleted with account; privacy request TTL is 90 days | Legal/audit metadata |
| Security/audit logs | Request status, IP/user-agent metadata, admin/account events | Application host/provider and MongoDB | Configurable audit TTL; host retention unknown | Identifiers and security events |
| Backups | Recovery copies if enabled | MongoDB, Cloudinary, host/provider | Configuration and deletion propagation unknown | Same as source data |

Potential recipients are MongoDB hosting, Cloudinary, Google OAuth, SMTP, and the
application host. No provider agreement, region choice, subprocessors list, or
backup-deletion guarantee is evidenced in the repository.

Clinical collections and objects from older deployments are no longer referenced by
the runtime. They remain an external inventory and quarantine problem; do not delete
or migrate them without a named data owner, backup, retention decision, and tested
rollback.
