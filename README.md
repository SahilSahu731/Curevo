# Curevo

Curevo is a single full-stack Next.js workspace. The browser application, REST API,
MongoDB domain layer, and Socket.IO realtime server all live in `apps/web` and run
from one persistent Node process.

The requested product direction is self-guided wellbeing and focus support for
everyday overwhelm, distraction, and procrastination. That direction has not been
approved as a wellness product or for public launch. Curevo is not a medical service,
crisis service, diagnostic tool, treatment, cure, or substitute for professional
care. Existing clinical workflow code remains review-only while it is separated from
the proposed product domain.

## Workspace

- `apps/web` — the complete Next.js application and server runtime
- `apps/app` — reserved for a future app; intentionally empty except for `.gitkeep`
- `docs` — governance, safety, and architecture records

See the [repository analysis](docs/repository-analysis.md) for the migration
decision, audited inventory, retained legacy risks, and verification boundaries.

## Local development

```bash
docker compose up -d mongo
npm install
npm run dev
```

Open `http://localhost:3000`. Copy `apps/web/.env.example` to
`apps/web/.env.local` and provide the required local values before exercising
authenticated API flows.

## Verification

```bash
npm run verify
npm run test:e2e:m6 --workspace @curevo/web
```

The second command runs the refreshed responsive landing, navigation, pathfinder,
theme, reduced-motion, and auth-hydration browser suite.

Production writes, search indexing, and the existing wellness calculators stay
disabled until their respective governance gates are completed. The controlling
status remains **PUBLIC LAUNCH BLOCKED**.
