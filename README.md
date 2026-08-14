# Curevo

Curevo is a single full-stack Next.js workspace for self-guided focus and everyday
wellbeing. Members can run distraction-aware focus sessions, build flexible
routines, write private reflections, and review descriptive patterns without
scores, streak penalties, or diagnostic labels.

The browser application, Express API adapter, MongoDB domain layer, and operational
scripts all live in `apps/web` and run from one Node process. The former doctor,
clinic, appointment, queue, telehealth, and medical-record product domains have
been removed from the runtime.

Curevo is not medical care, therapy, crisis response, diagnosis, or treatment.
The current deployment remains review-only until privacy, safety, and operational
release gates are approved.

## Workspace

- `apps/web` — complete Next.js application and server runtime
- `apps/app` — reserved for a future app; intentionally empty except for `.gitkeep`
- `docs` — governance, safety, and architecture records

## Local development

```bash
docker compose up -d mongo
npm install
npm run dev
```

Open `http://localhost:3000`. Copy `apps/web/.env.example` to
`apps/web/.env.local` and set a local Mongo URI and session secret before testing
authenticated flows.

## Verification and operations

```bash
npm run verify
npm run test:e2e:m6 --workspace @curevo/web
npm run seed
npm run migrate:focus-domain
npm run notifications:routines
```

`migrate:focus-domain` converts legacy non-admin account roles to `member`; it does
not import any clinical records into the new focus domain. Keep production writes
and search indexing disabled until the documented release gates are complete.
