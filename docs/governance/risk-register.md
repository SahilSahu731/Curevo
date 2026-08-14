# P0 risk register

Owners remain **UNASSIGNED** and residual risks unaccepted.

| ID | Risk | Impact | Current mitigation | Remaining gate |
|---|---|---:|---|---|
| P0-01 | Review deployment accepts real sensitive data | Critical | Write freeze, noindex, synthetic seeding | Deployment/data inventory and privacy approval |
| P0-02 | Focus/wellbeing language is interpreted as medical care or proven treatment | Critical | Non-medical boundaries; no scores/outcome claims | Product-safety, claims and legal review |
| P0-03 | Member accesses another member's sessions/reflections | Critical | Server session auth and owner-scoped Mongo queries | Database-backed IDOR/adversarial tests |
| P0-04 | Account takeover or recovery abuse | Critical | Opaque cookies, CSRF, rate limits, hashed one-time tokens, MFA | Deployed-origin security exercise |
| P0-05 | Private free text leaks through logs/admin/export | Critical | Aggregate-only admin overview; scoped export; generalized errors | Log and field-level privacy review |
| P0-06 | Malicious or orphaned profile image | High | 5 MB cap, signature/dimension checks, tracked public ID | Scanner/provider assurance and failure recovery |
| P0-07 | Export/deletion incomplete across providers/backups | High | Self-service export/delete and short privacy audit TTL | Provider and backup verification |
| P0-08 | Reminders create pressure or unwanted disclosure | High | Optional preferences and nonjudgmental copy | Frequency/retry/unsubscribe and user research |
| P0-09 | Old clinical data assumed erased by code removal | Critical | Migration does not import/delete it; quarantine documented | External inventory and approved disposal |
| P0-10 | Shared process or API dispatch failure | High | Health endpoint, graceful shutdown, explicit Next API allowlist | Deployed restart/load/routing tests |
| P0-11 | Unknown jurisdiction/operator/provider obligations | Critical | Interim terms and blocked release | Named entity, jurisdictions, contracts and legal approval |
| P0-12 | Dependency or configuration regression | High | Root lockfile, CI audit/test/build, production env validation | Repeat on release commit and deployed origin |
