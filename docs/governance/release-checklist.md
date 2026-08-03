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
- [ ] `npm run verify:m0` passes and rendered desktop/mobile pages are reviewed
- [ ] Export and deletion tested against database, object store, logs, and backups
- [ ] Incident exercise and emergency escalation test completed
- [ ] `npm audit --omit=dev --audit-level=high` passes for client and server; dependency review record is current
- [ ] Session, CSRF, OAuth state, recovery-token, MFA, and logout-all tests pass on the deployed origin layout
- [ ] Residual risks signed individually with scope and expiry

Final decision: **BLOCKED** until all boxes are complete.
