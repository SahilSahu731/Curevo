# Threat model

Review triggers: any change to authentication, authorization, models/records, uploads, Socket.IO, WebRTC, hosting, logging, backups, subprocessors, or network boundaries.

```mermaid
flowchart LR
  U[User browser] -->|HTTPS, HttpOnly session cookie| N[Next.js client / Vercel configured]
  U -->|HTTPS REST| E[Express API / Render configured]
  U -->|WSS Socket.IO| S[Socket.IO]
  U <-->|WebRTC media; public STUN| P[Authorized peer browser]
  E --> M[(MongoDB + unknown backups)]
  E --> C[Cloudinary uploads]
  U --> G[Google OAuth]
  G --> E
  E --> L[Host/application logs]
  S --> M
```

Trust boundaries exist at the browser, client host, API edge, WebSocket upgrade, OAuth callback, database, object store, media peer/STUN service, operator access, and every log/backup copy.

| Threat | Preventive controls | Detection | Recovery | Residual |
|---|---|---|---|---|
| Record/appointment IDOR | Server-side session auth; patient/assigned-doctor/admin object checks | 403 responses; correlation/audit events; regression tests | Revoke sessions, review access, notify as required | Full deployed integration and IDOR exercise incomplete |
| Video room intrusion/signaling injection | Session handshake; exact-origin admission; appointment lookup; eligible status; current consent; two participants; relay only after join; payload and event limits | `room-error`; correlation/security logs | End room, revoke session, invalidate room ID | TURN policy and adversarial load test pending |
| Account takeover/token theft | Password hashing, expiry, opaque HttpOnly cookie, CSRF, Helmet, rate limits, MFA | Login/MFA/reset audit events | Password reset, session revocation, logout-all | XSS defense and anomaly operations still need review |
| Malicious upload | Auth, size limit, extension-independent MIME allowlist, magic bytes, authenticated clinician delivery | Cloudinary/provider alerting unknown | Remove tracked object and account | Malware scanning/provider assurance pending |
| NoSQL/injection | Zod schemas on high-risk creates; Mongoose casts; role allowlists | Validation errors | Reject/patch | Coverage inconsistent across updates/query params |
| Queue manipulation/duplicate booking | Object authorization; controlled fields; unique index; slot conflict query | Conflict response | Cancel/rebuild queue | Race/atomicity tests pending |
| Review fraud | Authenticated patient identity; completed appointment and duplicate checks | Moderation tooling absent | Admin removal procedure absent | Content moderation and abuse operations pending |
| Insider/operator access | No control evidenced | No audit log evidenced | No runbook contacts | Critical launch blocker |
| Sensitive logs | Production errors generalized; socket identifiers removed | Log inventory pending | Purge per provider process | Morgan may log URLs/IP; host retention unknown |
| Denial of service | HTTP/IP/account rate limits, body limits, Socket buffer cap, signaling rate limit, upload limits | Host metrics unknown; audit events for auth abuse | Host-level block/scale unknown | Distributed load and connection-limit exercise pending |

References used for control selection: [OWASP WebSocket Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html), [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html), [HHS covered-entity/business-associate guidance](https://www.hhs.gov/hipaa/for-professionals/covered-entities/index.html), and [FTC Health Breach Notification Rule guidance](https://www.ftc.gov/business-guidance/resources/health-breach-notification-rule-basics-business). Regulatory applicability is not determined by this threat model.
