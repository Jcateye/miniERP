# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Scope

miniERP is a design-first monorepo:
- Product intent: `designs/`
- Runtime code: `apps/web`, `apps/server`, `packages/shared`

When intent and runtime differ, use `designs/` to understand goals and `apps/*` as implementation truth.

## Non-obvious commands (repo root)

```bash
bun install
bun run dev
bun run dev:web
bun run dev:server
bun run daily
bun run project -- all doctor
bun run project -- infra health
bun run project -- server logs
bun run build
bun run lint
bun run test
```

Targeted testing/build:

```bash
bun run --filter server test
bun run --filter server test -- src/path/to/file.spec.ts
bun run --filter server test -- src/path/to/file.spec.ts -t "test name"
bun run --filter server test:e2e -- test/app.e2e-spec.ts
bun run --filter web build
```

Important command quirks:
- `apps/web` has no `test` script.
- Root `db:generate` / `db:migrate` / `db:seed` now route to server Prisma scripts.
- `turbo.json` makes root `lint` and `test` depend on upstream `build` (expect slower runs than plain lint/test).
- Team local infra operations also use `bun run daily` / `bun run project -- ...` wrappers from repo root scripts.

## Testing policy

- Preferred runner: **Jest (server)**.
- Default entrypoint: root `bun run test` (turbo aggregation).
- For deterministic debugging, prefer server-scoped commands (`--filter server ...`) over root aggregation.

## Local development infrastructure

- Source of truth for local shared middleware (PostgreSQL/Redis/RabbitMQ/Nginx): `docs/Macmini-infra.md`.
- When infra connectivity or local domain routing behaves unexpectedly, check that document first before changing app code.

## Required env quirks

From runtime config behavior (`apps/server/src/config/env.schema.ts`, BFF headers):

- Required for server startup: `DATABASE_URL`, `REDIS_URL`.
- `AUTH_CONTEXT_SECRET`:
  - required outside `development/test`
  - dev/test can use fallback secrets, but do not rely on fallback for production-like verification.
- `API_PREFIX` defaults to `api` (affects backend route prefix).
- `PORT` default is `3000` in server config; `.env.example` sets `3001`.
- `NEXT_PUBLIC_API_BASE_URL` must match actual backend endpoint used by BFF.

## Project-specific architecture decisions

1. **Template-first frontend**: T1–T4 page families are the default approach (`designs/ui/minierp_page_spec.md`).
2. **Two-layer evidence model**: document-level + row-level evidence (`designs/ui/miniERP_evidence_system.md`).
3. **Web data path**: hooks/components -> SDK/BFF -> `/api/bff/*` -> backend.
4. **Fixture fallback boundary**: BFF fallback is allowed only in `development/test`; non-dev env should surface upstream unavailability.
5. **Shared contract boundary**: cross-layer types/constants/utilities belong in `packages/shared`.

## Business invariants (non-negotiable)

From `.claude/rules/erp-rules.md`:
- Document number format: `DOC-{type}-{YYYYMMDD}-{seq}`
- Monetary computation: must use `decimal.js`
- Document states: explicit transitions + auditable history

## Repo etiquette

Current repo-enforced/source-backed expectations:
- Keep docs in sync when changing shared facts across:
  - `CLAUDE.md`
  - `AGENTS.md`
  - `README.md`
  - `CLAW.md`
- Commit message source of truth:
  - `docs/commit.md` (includes executor/session resume metadata format)
- CI source of truth:
  - `.github/workflows/ci.yml`
  - `.github/workflows/cd-staging.yml`

Not explicitly enforced in-repo today (set by PR convention when needed):
- branch naming scheme
- PR template/body format

## Common pitfalls

- Root test/lint/build behavior is turbo-driven, not single-package behavior.
- Web may appear “healthy” in dev/test while backend is down if BFF fixture fallback is active.
- `db:*` commands currently exist to fail fast (not to execute real migrations yet).

## OpenSpec workflow

Common commands:
- `/opsx:new`
- `/opsx:ff`
- `/opsx:apply`
- `/opsx:verify`
- `/opsx:archive`

## Also check when present

- `.cursor/rules/*` or `.cursorrules`
- `.github/copilot-instructions.md`
