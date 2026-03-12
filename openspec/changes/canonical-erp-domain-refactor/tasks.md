## 1. Governance And Freeze

- [x] 1.1 Create OpenSpec proposal, design, and spec artifacts for canonical ERP refactor.
- [x] 1.2 Add an ERP canonical contract freeze document covering naming, shared fields, status sources, and compatibility window.
- [x] 1.3 Sync README, CLAUDE.md, CLAW.md, AGENTS.md, and `.claude/rules/erp-rules.md` with the new canonical contract governance facts.

## 2. Shared Canonical Types

- [x] 2.1 Add `packages/shared/src/types/erp/{common,master-data,trading,inventory,finance,compat}.ts`.
- [x] 2.2 Update shared exports so canonical ERP types are available without breaking current imports.
- [x] 2.3 Convert legacy document type/status exports into compatibility layers that forward canonical sources.

## 3. Web Baseline Repairs

- [x] 3.1 Restore a valid `DataTable` export for the integration logs route.
- [x] 3.2 Switch sales order draft form payloads from localized status labels to canonical status codes.
- [x] 3.3 Switch purchase order draft form payloads from localized status labels to canonical status codes.

## 4. Validation

- [x] 4.1 Run `bun run --filter web build`.
- [x] 4.2 Run `bun run --filter server test`.
- [x] 4.3 Record the verification results and remaining migration scope in `memory/2026-03-13.md`.
