# M0 release checklist

Every item requires evidence and a named signer. Empty or role-only sign-off means no release.

- [ ] Product owner: name, authority, date, target users/customer, product classification, intended use
- [ ] Security owner: threat-model review, penetration test, upload/session/socket controls, logging/backup access, residual acceptance
- [ ] Privacy owner: complete deployment/data inventory, lawful basis/authorization, controller/processor roles, retention, subprocessors, export/deletion verification
- [ ] Clinical-safety reviewer: credentials, intended-use statement, hazard review, emergency copy, provider verification, assessment disposition
- [ ] Legal approver: operating entity, jurisdictions, terms/notices/consents, complaint channel, contracts, breach/law-enforcement process
- [ ] All live/preview URLs, domains, accounts, stores, logs, backups, regions, audiences, and owners recorded
- [ ] Real-data audit completed and evidence linked; synthetic fixtures clearly distinguishable
- [ ] `ALLOW_PRODUCTION_WRITES` remains false until all approvals are complete
- [ ] Indexing remains disabled on review/preview environments
- [ ] Content claims inventory has evidence/owner/approval/expiry for every claim
- [ ] `npm run verify` and `npm run verify:m0 --workspace @curevo/web` pass, and rendered desktop/mobile pages are reviewed
- [ ] Export and deletion tested against database, object store, logs, and backups
- [ ] Incident exercise and emergency escalation test completed
- [ ] `npm audit --omit=dev --audit-level=high` passes against the root workspace lockfile; dependency review record is current
- [ ] Session, CSRF, OAuth state/callback, recovery-token, MFA, logout-all, and Socket.IO tests pass on the deployed same-origin layout; any legacy split origins are disabled or explicitly inventoried
- [ ] The Express `/api` fallback and Next App Router handlers are integration-tested so neither routing layer shadows the other
- [ ] `NEXT_PUBLIC_ENABLE_WELLNESS_TOOLS` remains false until the clinical-safety reviewer approves a documented intended use or the legacy tools are removed
- [ ] Residual risks signed individually with scope and expiry

Final decision: **BLOCKED** until all boxes are complete.
