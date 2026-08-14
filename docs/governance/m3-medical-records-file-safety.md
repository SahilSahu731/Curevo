# M3 Medical Records, Privacy Boundaries, and File Safety Record

> Historical record: the medical-record, clinical-note, attachment, and clinician workflow described below was removed on 2026-08-14. This document is retained only as an audit trail.

## Field visibility matrix

| Field | Patient | Authoring clinician | Support/admin | Public listing |
| --- | --- | --- | --- | --- |
| Diagnosis, symptoms | Read | Read/write before finalization | Break-glass read only | Never |
| Prescription, treatment plan | Read | Read/write before finalization | Break-glass read only | Never |
| Patient instructions, follow-up | Read | Read/write before finalization | Break-glass read only | Never |
| Clinician private notes | Never | Authoring clinician read/write | Break-glass only with reason | Never |
| Attachments | Metadata/read through authorized signed download | Upload/read | Break-glass release/download | Never |
| Audit/revision metadata | No sensitive internals | Own workflow metadata | Compliance access | Never |

Medical records now expose a public projection that removes legacy `doctorNotes`, storage keys, and private note fields. Clinician notes live in `ClinicalNote`; revisions and addenda are separately recorded. Finalized records cannot be silently overwritten. From the repository root, run `npm run migrate:m3-records --workspace @curevo/web` once against an approved backup to backfill legacy notes and author metadata.

## File controls

Uploads are memory-bounded, purpose-checked, signature-inspected, dimension/page-limited, and rejected for the EICAR test signature. Profile images are transformed by Cloudinary; license files and medical attachments use authenticated storage and short-lived signed download URLs. Medical attachments remain quarantined until an approved malware-scanning/release workflow marks them available.

## Lifecycle and deployment gates

Account deletion is an authenticated anonymization/deactivation workflow: clinical appointments, records, revisions, and audit evidence are retained; personal account identifiers and non-required communications are scrubbed. Admin user deletion is deactivation, never destructive graph deletion. Production requires TLS at the unified application ingress and for database/storage/TURN connections, managed secret storage and rotation, a real antivirus/quarantine service, retention jobs, encrypted backups, and privacy/legal confirmation of jurisdiction-specific medical-record retention.
