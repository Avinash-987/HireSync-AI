# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `artifacts/hiresync` (`@workspace/hiresync`)

React + Vite frontend for the HireSync AI job finder platform. Served at path `/`.

- **Tech**: React 19, Vite, TypeScript, TailwindCSS v4, Wouter (routing), TanStack Query (data fetching)
- **Auth**: Custom JWT (stored as `hiresync_token` in localStorage, `Authorization: Bearer <token>` header)
- **Design**: Premium dark SaaS theme - deep navy (#0D1224) background, violet/indigo primary, glassmorphism cards
- **Key pages**: Landing (`/`), Login, Register, Dashboard (Recharts stats), Jobs, AI Matches, Resume ATS, Applications (Kanban), Saved Jobs, Alerts, Notifications, Profile, Admin
- **API integration**: All data fetched via Orval-generated React Query hooks from `@workspace/api-client-react`
- `getAuthRequestOptions()` in `lib/auth.ts` → returns `{ headers: { Authorization: "Bearer <token>" } }`
- Toasts: Uses `sonner` library directly (`toast.success()`, `toast.error()`)
- Images: `public/images/hero-bg.png`, `public/images/auth-abstract.png`

### `artifacts/api-server` — Key Routes

- `POST /api/auth/register` - Register user, returns `{token, user}`
- `POST /api/auth/login` - Login, returns `{token, user}`
- `GET /api/auth/me` - Get current user (requires Bearer token)
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/jobs/search` - Search/filter jobs (12 seeded demo jobs)
- `GET /api/jobs/recommended` - AI-matched jobs based on user resume
- `POST /api/saved-jobs` - Save a job `{jobId: string}`
- `DELETE /api/saved-jobs/:id` - Remove saved job
- `GET /api/resume` - Get user resumes
- `POST /api/resume/upload` - Upload and ATS-analyze resume
- `GET /api/applications` - Get user applications
- `PUT /api/applications/:id` - Update application status
- `GET /api/alerts` - Get job alerts
- `POST /api/alerts` - Create job alert `{keywords, location, frequency, isActive}`
- `DELETE /api/alerts/:id` - Delete alert
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark notification read
- `PUT /api/notifications/read-all` - Mark all notifications read
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `GET /api/admin/stats` - Admin stats (admin role required)
- `GET /api/admin/users` - Admin users list (admin role required)

### Database Schema (8 tables)

`users`, `profiles`, `resumes`, `jobs`, `applications`, `saved_jobs`, `alerts`, `notifications`

- All UUIDs as primary keys
- Jobs seeded with 12 demo jobs at server startup if empty
- `resumes` table stores ATS score and extracted skills JSON

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.
