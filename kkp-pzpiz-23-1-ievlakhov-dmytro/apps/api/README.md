# Warehouse API (apps/api)

NestJS + TypeORM + PostgreSQL backend. Infrastructure spine for the warehouse catering management system.

## Run (dev)

1. `cp .env.example .env` (once, from repo root)
2. `npm run db:up` (from repo root) — start PostgreSQL via Docker
3. `npm run migration:run -w @app/api` — apply schema migrations
4. `npm run api:dev` — start API with file-watching at http://localhost:3000; Swagger UI at /api/docs

## Test

- Unit: `npm run api:test` (from repo root) or `npm run test -w @app/api`
- e2e (needs DB up + migrations applied): `npm run api:test:e2e` (from repo root)

## Build + run production

> **Note:** `@app/shared` must be compiled to `packages/shared/dist/` before the API is started or built,
> because the workspace symlink resolves `@app/shared` via `package.json` `"main": "dist/index.js"` at runtime.
> The scripts below handle this automatically — always prefer them over invoking `nest build` directly.

```bash
# Builds @app/shared first, then the API:
npm run build          # from repo root

# Start the compiled API:
npm run start -w @app/api   # runs node dist/main.js
```

If you build the API workspace in isolation, build shared first:

```bash
npm run build:shared   # from repo root
npm run build -w @app/api
```

## Auth

JWT bearer tokens (short TTL, configured via `JWT_EXPIRES_IN`). An ADMIN user is seeded on startup using `ADMIN_EMAIL` / `ADMIN_PASSWORD` from the environment (idempotent). Roles: `USER`, `ADMIN` — deny-by-default via `@Roles` decorator and `RolesGuard`.

## Env vars

See `.env.example` at the repo root. Required:

| Variable            | Description                    |
| ------------------- | ------------------------------ |
| `POSTGRES_HOST`     | DB host (default: `localhost`) |
| `POSTGRES_PORT`     | DB port (default: `5432`)      |
| `POSTGRES_USER`     | DB user                        |
| `POSTGRES_PASSWORD` | DB password                    |
| `POSTGRES_DB`       | Database name                  |
| `API_PORT`          | Listen port (default: `3000`)  |
| `JWT_SECRET`        | Secret for signing JWT tokens  |
| `JWT_EXPIRES_IN`    | Token TTL (default: `900s`)    |
| `ADMIN_EMAIL`       | Seed admin email               |
| `ADMIN_PASSWORD`    | Seed admin password            |
| `ADMIN_NAME`        | Seed admin display name        |

## API endpoints

| Method | Path                        | Auth   | Description                         |
| ------ | --------------------------- | ------ | ----------------------------------- |
| GET    | `/api/health`               | public | Health check                        |
| POST   | `/api/auth/login`           | public | Obtain JWT token                    |
| POST   | `/api/auth/logout`          | bearer | Session end (client discards token) |
| GET    | `/api/auth/me`              | bearer | Current user profile                |
| PATCH  | `/api/auth/me`              | bearer | Update display name / locale        |
| POST   | `/api/auth/change-password` | bearer | Change own password                 |

Full interactive docs: `http://localhost:3000/api/docs`
