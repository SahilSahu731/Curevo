# Interim clinical safety case

Safety conclusion: **NOT ACCEPTABLE FOR CLINICAL OR PATIENT USE**. The software may be evaluated only with synthetic information. No named clinical-safety reviewer has approved intended use, hazards, content, provider verification, or residual risk.

| Hazard | Harm | Current control | Required before launch | Residual status |
|---|---|---|---|---|
| Wellness score is wrong or interpreted as diagnosis/risk | Delayed care, anxiety, unsafe self-treatment | Limitation before entry, fixed-rule disclosure, emergency copy, PDF disclaimer | Clinical review, intended-use decision, validation or disable feature | Unaccepted |
| Emergency symptoms entered into assessment/booking | Delay in emergency response | Pre-entry and telehealth urgent-symptom warning; no specific emergency number while jurisdiction undecided | Jurisdiction-specific escalation and tested interrupt logic | Unaccepted |
| Clinician incorrectly marked approved | Care from unqualified person | Public pages make no verification claim | Primary-source credentialing, expiry/sanctions checks, human SOP and audit | Unaccepted |
| Duplicate slot/token race | Missed/delayed visit, wrong order | Conflict query and unique compound index | Atomic allocation and concurrency tests | Unaccepted |
| Emergency priority/queue reordering | Less urgent user displaces urgent care or emergency waits in app | No UI claim that queue is triage; role-limited changes | Remove emergency category or clinician-approved triage protocol | Unaccepted |
| Stale clinic/clinician availability | Missed or delayed visit | Availability described as request only | Source of truth, freshness timestamps, confirmation workflow | Unaccepted |
| Wrong-patient record | Privacy breach and clinical harm | Appointment ownership and one-record-per-appointment | Two-identifier confirmation, immutable provenance, correction workflow, audit | Unaccepted |
| Video failure or wrong participant | Missed visit/disclosure | Appointment authorization, eligible statuses, room cap, consent | TURN/availability plan, participant identity confirmation, reconnect/fallback SOP | Unaccepted |

The deterministic health-check names, thresholds, summaries, and recommendations still resemble clinical outputs. The safest launch decision is to keep the feature disabled until a clinical reviewer either narrows it to non-medical education or approves evidence and validation.
