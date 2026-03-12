## ADDED Requirements

### Requirement: Additive canonical Prisma rollout
The repository MUST roll out the first canonical ERP Prisma schema increment in an additive way so that legacy `sku/grn/outbound` tables remain readable during the compatibility window.

#### Scenario: Canonical tables are introduced without removing legacy tables
- **WHEN** the canonical ERP Prisma schema is extended for phase 1
- **THEN** the schema MUST add canonical tables for `item`, `goods_receipt`, and `shipment`
- **THEN** the schema MUST keep `sku`, `grn`, and `outbound` models available for compatibility reads and writes
- **THEN** no existing runtime path may require an immediate rename of the legacy Prisma client properties

### Requirement: Root and support ERP models
The Prisma schema MUST provide the root and support models required for multi-company and richer ERP master data.

#### Scenario: Company and support tables exist
- **WHEN** engineers implement canonical ERP phase 1 persistence
- **THEN** the schema MUST include `company` and `org_unit`
- **THEN** the schema MUST include `uom`, `tax_code`, and `warehouse_bin`
- **THEN** the schema MUST include `inventory_txn` and `inventory_txn_line`

### Requirement: Existing business tables expose extensibility fields
Existing master data and trading tables MUST expose additive fields for compatibility with the canonical ERP contract.

#### Scenario: Legacy tables gain canonical extension columns
- **WHEN** legacy business tables remain active during the compatibility window
- **THEN** `sku`, `warehouse`, `supplier`, `customer`, `purchase_order`, `grn`, `sales_order`, `outbound`, and `stocktake` MUST expose additive `company_id`, `org_id`, `status`, and `ext` style columns where missing
- **THEN** relevant trading header tables MUST expose additive canonical document fields such as approval, currency, tax, and source reference columns
- **THEN** relevant trading line tables MUST expose additive canonical line extension fields such as line status, bin, batch, serial, and source line reference columns
