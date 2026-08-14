# Curevo interface and naming standard

## Approved identity

- Product name: **Curevo**
- Descriptor: **Self-guided focus and everyday-wellbeing prototype**
- Product status language: **pre-release**, **prototype**, and **review environment**
- Do not use: SmartQueue, Medical OS, ClinicOS, public launch, trusted by, instant confirmation, or production-ready

This descriptor describes product scope, not public-launch or outcome approval. Do not describe Curevo as an “online cure,” use stigmatizing “mental sickness” language, or imply diagnosis, therapy, treatment, clinician oversight, crisis response, or validated outcomes.

`BrandLogo` in `apps/web/src/components/brand/BrandLogo.tsx` is the canonical in-product logo. The app icon and social image use the same Curevo name and emerald accent.

## Interface foundations

- Heading type: Outfit
- Body type: Plus Jakarta Sans
- Primary action: emerald on a neutral light or dark surface
- Status colors: amber for warnings, red for destructive/error, emerald for success, blue for informational states
- Surfaces: use semantic `background`, `card`, `muted`, `foreground`, `border`, and `ring` tokens so light and dark themes remain paired
- Shape: 2px to 8px radii for controls and repeated content; circular treatment is reserved for avatars and icons
- Controls: use the shared components under `apps/web/src/components/ui`; do not introduce page-local button or input primitives

## Product terms

- “Appointment request” describes the patient action until the server returns the actual appointment status.
- “Available slot” is a server-returned slot and must be revalidated before submission.
- “Queue position” is an estimate reported by the clinic workflow, never an arrival-time promise.
- “Video visit” is the patient-facing term; “telehealth room” is an internal technical term.
- “Clinician-private notes” are never called patient notes and are never exposed to patient surfaces.
- “Review environment” means synthetic information only and no approved patient-care use.

## Governance

Changes to the product name, logo, public claims, clinical-safety language, or patient-visible medical terminology require product and governance review. Email subjects, PDFs, notifications, OAuth screens, metadata, legal pages, and navigation must use the same approved terms.
