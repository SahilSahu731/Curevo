# Curevo web

This package is the complete Curevo runtime:

- Next.js App Router pages and components live in `src/app` and `src/components`.
- Browser state and same-origin API clients live in `src/store`, `src/api`, and `src/lib`.
- The existing REST, MongoDB, upload, auth, and Socket.IO implementation lives in
  `src/server`.
- `server.mjs` starts Next.js and the API on one HTTP server so pages, `/api/*`, and
  Socket.IO share a single origin and deployment.

Run commands from the repository root:

```bash
npm run dev
npm run verify
```

Native Next Route Handlers can gradually replace Express endpoints after equivalent
DB-backed contract tests exist. Socket.IO still requires this persistent custom
server unless realtime is moved to a managed service.
