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

1. **Design-driven + family-governed frontend**: keep T1–T4 names, but family only governs page skeletons; formal pages must recreate the mapped pencil design and land as page-level views rather than generic assemblies (`designs/ui/minierp_page_spec.md`, `docs/plans/2026-03-07-erp-page-reconstruction-design.md`).
2. **Two-layer evidence model**: document-level + row-level evidence (`designs/ui/miniERP_evidence_system.md`).
3. **Web data path**: hooks/components -> SDK/BFF -> `/api/bff/*` -> backend.
4. **Fixture fallback boundary**: BFF fallback is allowed only in `development/test`; non-dev env should surface upstream unavailability.
5. **Shared contract boundary**: cross-layer types/constants/utilities belong in `packages/shared`.
6. **Legacy frontend boundary**: `WorkbenchAssembly` / `OverviewAssembly` and their old layout semantics are legacy/fallback only; do not use them as the default runtime path for rebuilt pages.

## Business invariants (non-negotiable)

From `.claude/rules/erp-rules.md`:
- Document number format: `DOC-{type}-{YYYYMMDD}-{seq}`
- Monetary computation: must use `decimal.js`
- Document states: explicit transitions + auditable history

## Engineering redlines (must follow)

1. New pages must use **T1/T2/T3/T4** only; no fifth page family.
2. T1/T2/T3/T4 are **family shells**, not fixed UI templates:
   - T1 = Hub / Dashboard family
   - T2 = List / Index family
   - T3 = Detail / Record family
   - T4 = Flow / Wizard family
3. Formal pages must recreate the mapped pencil design; family only constrains skeleton, not concrete UI.
4. List pages must URL-encode filter/sort/pagination state (shareable + replayable).
5. Template/shell components must not call APIs directly; pages use VM hooks + BFF only.
6. Frontend must not define custom status enums; use `packages/shared` as the single source.
7. Inventory truth source is `inventory_ledger`; balance table is query acceleration only.
8. All posting endpoints must require `Idempotency-Key`.
9. Physical deletion of posted documents is forbidden; use void/reversal only.
10. All write operations must carry `tenant_id` and audit fields (who/when/what).
11. BFF is the only frontend data entry layer; no bypass to backend APIs.
12. PR gate must pass: design parity review + status contract + posting consistency tests.
13. Do not introduce a new universal page assembly. Reuse is allowed only at primitives / shells / local business blocks.
14. `WorkbenchAssembly` / `OverviewAssembly` are legacy/fallback only for unmigrated routes and placeholders.
15. When coordinating parallel agents, assign work by route or document scope, keep shared fact updates synchronized across `CLAUDE.md`, `AGENTS.md`, `README.md`, `CLAW.md`, and `.claude/rules/erp-rules.md`, and do not let one agent redefine page family rules in isolation.

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
