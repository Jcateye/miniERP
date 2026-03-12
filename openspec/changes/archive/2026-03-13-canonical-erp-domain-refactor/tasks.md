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

## 5. Prisma Canonical Phase 1 Governance

- [x] 5.1 Extend the OpenSpec artifacts and migration docs for additive canonical Prisma rollout.
- [x] 5.2 Update the canonical contract freeze and DB migration checklist with the phase-1 compatibility rules.

## 6. Prisma Canonical Phase 1 Implementation

- [x] 6.1 Add additive Prisma models for `company`, `org_unit`, `uom`, `tax_code`, `warehouse_bin`, `inventory_txn`, and `inventory_txn_line`.
- [x] 6.2 Add canonical `item`, `goods_receipt`, and `shipment` tables while keeping `sku/grn/outbound` as compatibility tables.
- [x] 6.3 Enrich existing master data and trading tables with `company_id`, `org_id`, `status`, `ext`, and canonical header/line extension fields.
- [x] 6.4 Add a reviewed migration artifact for the phase-1 schema rollout and regenerate Prisma client.

## 7. Server Trading Baseline

- [x] 7.1 Add a dedicated server trading domain catalog that centralizes canonical/legacy document type and status mappings.
- [x] 7.2 Rewire purchase, sales, inbound, and outbound boundaries to consume the shared trading catalog instead of redefining status unions locally.
- [x] 7.3 Add tests covering the trading catalog and boundary compatibility behavior.

## 8. Validation And Remote DB Decision

- [x] 8.1 Run Prisma schema validation and the relevant server test suite after the schema/module changes.
- [x] 8.2 Record whether the remote database migration was applied or intentionally deferred in `memory/2026-03-13.md`.
