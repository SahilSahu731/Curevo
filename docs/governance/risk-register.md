# P0 risk register

Likelihood and impact use Low/Medium/High/Critical. Proposed target dates are containment targets, not accepted commitments. A named accountable person must replace every `UNASSIGNED` before launch.

| ID | Risk | Impact | Likelihood | Implemented mitigation | Owner | Proposed target | Residual risk / approval |
|---|---|---:|---:|---|---|---|---|
| P0-01 | Unreviewed production collects health data | Critical | High | Production write freeze; opt-in writes; noindex | Product owner: UNASSIGNED | 2026-08-03 | Remote deployments/data unknown; not accepted |
| P0-02 | Unsupported regulatory/security/clinical claims | Critical | High | Public copy replaced; automated source scan | Product + legal: UNASSIGNED | 2026-08-03 | Rendered review and legal approval pending |
| P0-03 | Unauthorized Socket.IO/telehealth room access | Critical | High | JWT/cookie handshake, exact-origin admission, object authorization, membership-checked relay, two-person cap, payload limit, and signaling rate limit | Security: UNASSIGNED | 2026-08-03 | Adversarial integration and load testing pending; not accepted |
| P0-04 | Unauthorized record or appointment access | Critical | Medium | Auth middleware and object/role checks in controllers | Security: UNASSIGNED | 2026-08-07 | Full integration/IDOR test suite pending |
| P0-05 | Token theft through JavaScript/browser persistence | Critical | Medium | Opaque server-side sessions in HttpOnly cookies; no browser token persistence; no-store API responses; socket session lookup | Security: UNASSIGNED | 2026-08-07 | CSRF, XSS, device/session review, and incident exercise pending; not accepted |
| P0-06 | Malicious uploads or orphaned sensitive files | Critical | High | Size/MIME/magic-byte allowlist, authenticated upload routes, private clinician-document delivery, tracked public IDs, and deletion hooks | Security/privacy: UNASSIGNED | 2026-08-07 | Malware scanning, provider assurance, and legacy-object inventory pending; not accepted |
| P0-07 | No reliable export/deletion | High | High | Self-service JSON export; cascade DB deletion; tracked Cloudinary cleanup; 90-day pseudonymous audit | Privacy: UNASSIGNED | 2026-08-03 | Backup/replica deletion and remote-store validation pending; not accepted |
| P0-08 | Invalid or missing consent | High | High | Versioned registration/OAuth and telehealth consent records | Privacy/legal: UNASSIGNED | 2026-08-03 | Google wording/legal basis/revocation UX review pending |
| P0-09 | Bad wellness score delays care | Critical | High | Pre-entry limitation, urgent symptom warning, 18+ restriction, PDF disclaimer, no AI/validation claim | Clinical safety: UNASSIGNED | 2026-08-03 | Calculators still output medicalized scores; disable or validate before launch |
| P0-10 | Incorrect clinician verification | Critical | High | Public UI no longer asserts credentialing | Clinical/product: UNASSIGNED | 2026-08-03 | Admin workflow is not credentialing; launch blocked |
| P0-11 | Duplicate booking / queue corruption | High | Medium | Unique slot check/index and controlled status fields | Engineering: UNASSIGNED | 2026-08-07 | Concurrency test and atomic token allocation pending |
| P0-12 | Privacy policy/regulated role mismatch | Critical | High | Product-accurate interim notices and data map | Privacy/legal: UNASSIGNED | 2026-08-07 | Jurisdiction, entity, controller/processor, BA status/contracts undecided |
| P0-13 | Breach response failure | Critical | Medium | Interim runbook | Security/privacy: UNASSIGNED | 2026-08-07 | Contacts, notification matrix, insurer/counsel unassigned |
| P0-14 | Real data mixed with synthetic seed data | Critical | Medium | Exact legacy seed graph tagged; new fixtures carry provenance; seed refuses unmarked overwrite; one unrelated local account remains quarantined/unreviewed | Privacy/product: UNASSIGNED | 2026-08-07 | Remote stores and the unmarked account remain unverified; not accepted |

Residual-risk acceptance must include ID, named approver, scope, evidence, date, expiry, and rationale. No P0 residual risk is currently accepted.
