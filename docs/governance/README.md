# M0 containment record

Status: **PUBLIC LAUNCH BLOCKED**

Original review date: 2026-08-03

Workspace migration review: 2026-08-14

Classification: pre-release healthcare workflow prototype; not approved as a wellness product, clinical tool, marketplace, or clinic SaaS service.

This directory is the auditable record for the M0 containment work. Technical controls are implemented in code, but the operating organization has not assigned named product, security, privacy, or clinical-safety approvers. Target jurisdictions, customer types, contracts, and regulated roles are also undecided. Those are human governance decisions and remain hard release gates.

Documents:

- [Containment and deployment inventory](./containment.md)
- [Claims inventory](./claims-inventory.md)
- [Data map](./data-map.md)
- [Risk register](./risk-register.md)
- [Threat model](./threat-model.md)
- [Clinical safety case](./clinical-safety-case.md)
- [Incident and privacy request runbook](./operations-runbook.md)
- [Release checklist](./release-checklist.md)
- [M1 dependency and authentication record](./m1-auth-dependency-record.md)
- [M2 telehealth privacy, reliability, and safety record](./m2-telehealth-record.md)
- [M3 medical records and file safety record](./m3-medical-records-file-safety.md)
- [M4 booking, queue, reviews, and notifications record](./m4-booking-queue-reviews.md)
- [M5 workflow integrity and scope decisions](./m5-workflow-integrity.md)
- [M6 interface and naming standard](./m6-design-system.md)
- [Repository-wide audit and migration decision](../repository-analysis.md)

From the repository root, run `npm run verify:m0 --workspace @curevo/web` before review. The root workspace also exposes `npm run verify` for the combined link, lint, test, and build baseline. Neither command replaces privacy, legal, security, or clinical approval.
