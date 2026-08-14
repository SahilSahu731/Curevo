# M2 Telehealth Privacy, Reliability, and Safety Record

> Historical record: the telehealth, appointment, queue, WebRTC, and Socket.IO runtime described below was removed on 2026-08-14. This document is retained only as an audit trail.

## Implemented controls

- `apps/web/server.mjs` attaches Next.js, the Express API, and Socket.IO to one persistent HTTP server. Pages, REST requests, OAuth callbacks, and WebSocket upgrades therefore use one configured origin by default; additional browser origins remain denied unless explicitly allowlisted.
- Socket.IO authenticates the `curevo_session` cookie against the revocable `Session` collection on handshake and on every protected event. Expired, revoked, missing, inactive-user, cross-origin, and malformed connections are rejected.
- Event payloads use strict Zod schemas, bounded SDP/candidate sizes, a socket buffer limit, connection/join/signaling/malformed-payload budgets, and correlation IDs. Production audit metadata stores hashes and identifiers only; media and health content are never logged.
- Queue rooms require appointment ownership or the assigned clinician/admin scope. Telehealth rooms are appointment-backed and require a short-lived HMAC grant bound to appointment, opaque room ID, user, role, and grant version. Status/cancellation changes revoke grants. A room has at most two participants, and join/leave/denial/start/end events are audited.
- Telehealth access is limited to the appointment window (15-minute early grace and 90-minute duration), an accepted current telehealth consent, the assigned patient, or an approved assigned clinician. Browser URLs no longer create authority and legacy predictable room IDs rotate on access.
- The room UI has an emergency limitation notice, explicit consent, device selection/preview, microphone and audio-only fallback, clinician waiting state, server-provided participant identity, connection/reconnect/ICE-restart states, a duration timer, accessible controls, end confirmation, and role-aware return navigation. Recording, chat, screen sharing, captions, and attachments are explicitly unavailable.

## Deployment gates still required

- Multiple regional endpoints can be supplied through the comma-separated `NEXT_PUBLIC_TURN_URLS` value; use `turn:`, `turns:`, and provider-specific UDP/TCP/TLS endpoints as appropriate. The repository does not claim that a TURN service is deployed.
- `NEXT_PUBLIC_TURN_USERNAME` and `NEXT_PUBLIC_TURN_CREDENTIAL` are visible to browser code. Static values are not an acceptable production short-lived-credential design; real clinical use requires an authenticated server-issued ephemeral ICE configuration and a reviewed rotation/abuse policy.
- Run a controlled WebRTC matrix behind symmetric NAT, VPN, hospital/corporate firewalls, mobile networks, and low bandwidth. Capture connection success and recovery metrics without local IP addresses.
- Complete clinical emergency-language review, privacy/security review, jurisdictional consent review, and an operational exercise for grant/session revocation before production launch.

The single-process deployment does not approve telehealth use. It also creates a shared availability boundary: a process failure interrupts pages, REST, queue sockets, and telehealth signaling together. Capacity, graceful-restart, connection-drain, and horizontal-scaling behavior remain deployment gates.
