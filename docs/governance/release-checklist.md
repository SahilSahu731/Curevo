# Release checklist

Every item requires evidence and a named signer. Empty or role-only sign-off means
no release.

- [ ] Product owner approves target users, age range, jurisdictions, intended use, and non-medical classification
- [ ] Product-safety reviewer approves crisis boundaries, reflection labels, reminders, and residual risks
- [ ] Security owner reviews sessions, MFA, CSRF, ownership, uploads, logs, backups, and penetration evidence
- [ ] Privacy owner approves data map, lawful basis, retention, providers, exports/deletion, and legacy-data disposition
- [ ] Legal owner approves operating entity, terms/notices, complaint channel, provider agreements, and jurisdictions
- [ ] Accessibility owner verifies keyboard, screen reader, zoom/reflow, motion, contrast, errors, and responsive states
- [ ] All current/former deployments, stores, logs, backups, OAuth/SMTP projects, domains, regions, and owners are inventoried
- [ ] Synthetic-data audit is complete and unclassified records remain quarantined
- [ ] `ALLOW_PRODUCTION_WRITES=false` and indexing remains disabled until all approvals complete
- [ ] Claims inventory contains evidence/owner/approval/expiry for every factual or outcome claim
- [ ] `npm ci`, `npm audit --omit=dev --audit-level=high`, and `npm run verify` pass on the release commit
- [ ] Register, verify, login/MFA, recovery, logout-all, Google OAuth, and account suspension pass on the deployed origin
- [ ] Focus session, routine, reflection, notification, export, and deletion ownership tests pass against MongoDB
- [ ] Profile upload and Cloudinary replace/delete behavior is tested, including failure recovery
- [ ] Routine reminder scheduling, retry, frequency, unsubscribe, and delivery ownership are approved
- [ ] Incident, privacy-request, backup/restore, and emergency-language exercises are complete
- [ ] The Express `/api` boundary and Next blog-preview handler cannot shadow or bypass each other
- [ ] External legacy clinical data has an approved quarantine/retention/disposal decision
- [ ] Residual risks are signed individually with scope and expiry

Final decision: **BLOCKED** until every box is complete.
