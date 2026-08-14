# Product safety case

Safety conclusion: **NOT APPROVED FOR PUBLIC OR CLINICAL USE**. The prototype may
be evaluated with synthetic information only. The historical filename is retained
so existing evidence links do not break.

| Hazard | Current control | Required before release | Status |
|---|---|---|---|
| Product interpreted as diagnosis, therapy, or treatment | Repeated non-medical boundary; no diagnostic outputs or health scores | Independent claims and product-safety review | Unaccepted |
| Person in crisis waits for the product | Landing/terms state that Curevo is not crisis response | Jurisdiction/age decision, reviewed escalation copy and test | Unaccepted |
| Reflection labels are interpreted as a wellbeing score | No aggregate health score; language calls inputs private self-description | Usability and accessibility study; content review | Unaccepted |
| Streaks or reminders intensify shame/compulsion | No streak penalty; reminders are optional invitations | Notification-frequency limits and member research | Unaccepted |
| Private notes exposed to another user/admin | Owner-scoped queries; aggregate-only admin overview | Database-backed IDOR tests and privacy review | Unaccepted |
| Focus timer loses state or records wrong duration | Explicit finish action; bounded durations; saved history | Browser interruption/reconnect testing | Unaccepted |
| Old clinical data is assumed deleted because code was removed | Migration does not import or delete it; documentation requires quarantine | External data inventory and approved disposal plan | Unaccepted |

Distraction, procrastination, low energy, and overwhelm can coexist with conditions
that require qualified care. Curevo must not infer those conditions or present its
tools as a substitute for assessment or support from a qualified professional.
