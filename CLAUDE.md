# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

miniERP is a **design-first + runnable scaffold** monorepo:
- Product/interaction intent lives in `designs/` (spec docs)
- Runtime code lives in `apps/web`, `apps/server`, `packages/shared`

If design and code differ, treat `designs/` as intent and `apps/*` as current implementation truth.

## Read first (high ROI)

1. `README.md`
2. `designs/ui/minierp_page_spec.md` (T1–T4 template system)
3. `designs/ui/miniERP_evidence_system.md` (two-layer evidence model)
4. `designs/ui/miniERP_design_summary.md`
5. `.claude/rules/erp-rules.md`
6. `openspec/config.yaml`

## Monorepo map

- `apps/web` — Next.js 15 + React 19 frontend (`src/app`)
- `apps/server` — NestJS 11 backend
- `packages/shared` — shared contracts/constants/utils
- `designs` — UI/PRD/spec source of truth
- `openspec` — spec-driven change artifacts

## Common commands (repo root)

```bash
bun install

bun run dev
bun run dev:web
bun run dev:server

bun run lint
bun run test
bun run build
```

### Targeted commands

```bash
# server
bun run --filter server dev
bun run --filter server test
bun run --filter server test -- src/path/to/file.spec.ts
bun run --filter server test:watch
bun run --filter server test:cov
bun run --filter server test:e2e

# web
bun run --filter web dev
bun run --filter web build
bun run --filter web lint
```

Notes:
- `apps/web` currently has no test script.
- Root `db:generate` / `db:migrate` proxy to server, but server does not yet define those scripts.

## Big-picture architecture

### 1) Template-driven UI

Pages should be built from the four archetypes in `designs/ui/minierp_page_spec.md`:
- T1 OverviewLayout
- T2 WorkbenchLayout
- T3 DetailLayout
- T4 WizardLayout

If a page matches ~80%+ of an archetype, reuse that template and only replace fields/data.

### 2) Evidence is cross-domain capability

`designs/ui/miniERP_evidence_system.md` defines two layers used across purchase/sales/inventory:
- Document-level evidence (global attachments)
- Row-level evidence (SKU-line drawer workflow)

Keep this model consistent when implementing GRN/OUT/stocktake-like flows.

### 3) Runtime layering

- Web (`apps/web`): routing, page composition, interaction
- Server (`apps/server`): domain APIs and state transitions
- Shared (`packages/shared`): cross-layer contracts and utility primitives

### 4) Current maturity (important)

Runtime is scaffold-level today:
- Web: minimal landing page
- Server: basic hello-world skeleton (AppController/AppService)
- Shared: foundational ERP types/constants/utils already present

Implement features incrementally on top of this scaffold.

## Business constraints (from `.claude/rules/erp-rules.md`)

- Document number: `DOC-{type}-{YYYYMMDD}-{seq}`
- Monetary calculation: use `decimal.js` (avoid raw float arithmetic)
- Document states: explicit transitions + auditable changes

## OpenSpec workflow

Common commands:
- `/opsx:new`
- `/opsx:ff`
- `/opsx:apply`
- `/opsx:verify`
- `/opsx:archive`

Recommended flow:
1. Plan (`/plan` or `/opsx:new`)
2. Implement (`/opsx:apply`, optional `/tdd`)
3. Verify (`/opsx:verify`, optional `/verify`)
4. Archive (`/opsx:archive`)

## Also check these instruction files when present

- `.cursor/rules/*` or `.cursorrules`
- `.github/copilot-instructions.md`
