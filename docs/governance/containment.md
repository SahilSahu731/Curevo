# Containment and inventory

## Feature freeze

Production mutations are denied by default with `PRODUCTION_REVIEW_ONLY` except
existing-account login, logout, and MFA completion. Enabling writes requires
`ALLOW_PRODUCTION_WRITES=true` and completed release approval. Search indexing is
disabled unless `NEXT_PUBLIC_ALLOW_INDEXING=true`.

## Deployment inventory

| Surface | Evidence | Audience | Status |
|---|---|---|---|
| Local full-stack workspace | root workspace; `apps/web/server.ts`; local Mongo container | Developers | Review-only; synthetic data |
| Render service configuration | `render.yaml`; URL/account not discoverable from source | Private reviewers only | Deployment and collected data unverified |
| MongoDB | `MONGO_URI`; local Docker volume; provider not identified | Application | Database/backup owners and regions unassigned |
| Cloudinary | Profile-image integration | Authenticated members | Account, objects, logs, region, deletion and contract unverified |
| Google OAuth | Optional provider configuration | Members | Project ownership, consent screen and lifecycle unverified |
| SMTP | Optional account/support/reminder email | Members/operators | Provider, region, logs and retry operations unverified |
| Former deployments/stores | Not discoverable from current source | None approved | Inventory and quarantine required |

The active runtime contains focus sessions, routines, reflections, accounts,
notifications, feedback/support, consents, sessions, audit events, and privacy
requests. Removed clinical source does not prove older databases, objects, logs, or
backups were deleted.

## Hard gates

- No public launch, indexing, or real personal data until the release checklist is signed.
- No cure, diagnosis, treatment, therapy, crisis, outcome, compliance, partner, or social-proof claim without evidence and approval.
- No deletion or transformation of old clinical stores without inventory, owner, backup, retention decision, and rollback.
- No new Next-owned mutating API may bypass the guarded Express boundary.
