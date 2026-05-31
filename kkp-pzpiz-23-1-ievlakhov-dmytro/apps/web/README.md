# Web client (apps/web)

Next.js 14 (App Router) + Tailwind + shadcn/ui. Consumes the REST API (`apps/api`) and reuses `@app/shared` types.

## Run (dev)

1. Start the API: `npm run db:up` then `npm run api:dev` (root) — API at http://localhost:3000 (CORS allows the web origin `WEB_ORIGIN`, default http://localhost:3001).
2. `cp apps/web/.env.local.example apps/web/.env.local` (once).
3. `npm run web:dev` (root) — web at http://localhost:3001.
4. Log in with the seeded admin (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).

## Scripts

- `npm run web:build`, `npm run web:lint`, `npm run web:test`.

## Conventions

- Auth: JWT in `localStorage`, attached as `Bearer` by `lib/api-client.ts`; a `401` clears the token and redirects to `/login`.
- Data: TanStack Query (queries + mutations with cache invalidation). Forms: react-hook-form + zod. i18n: react-i18next (uk default, en); language persists to `localStorage` and the backend (`PATCH /auth/me`).
- Design system: "industrial control-panel" — Archivo / IBM Plex Sans / IBM Plex Mono fonts, teal primary on a warm canvas, semantic status colours, tabular figures (`.nums`). Tokens live in `src/app/globals.css`; dark mode via the topbar toggle.
- Structure: `app/` routes (protected group `(app)` behind an auth guard), `components/ui` (shadcn), `components/app-shell`, `components/data`, `features/<domain>`, `lib`, `i18n`.
