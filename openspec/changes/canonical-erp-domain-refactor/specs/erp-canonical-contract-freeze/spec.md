## ADDED Requirements

### Requirement: Canonical ERP contract source
The repository MUST define a canonical ERP contract source for master data, trading, inventory, and finance domains under `packages/shared/src/types/erp`.

#### Scenario: Canonical type entrypoint exists
- **WHEN** an engineer adds or updates a cross-layer ERP entity
- **THEN** the canonical definition MUST be added under `packages/shared/src/types/erp/*`
- **THEN** legacy shared files MUST only forward or alias canonical definitions

### Requirement: Canonical naming policy
The system MUST treat `item`, `goods_receipt`, `shipment`, `invoice`, `receipt`, `payment`, and `journal_entry` as the formal business domain names.

#### Scenario: Legacy naming remains compatibility-only
- **WHEN** existing code still references `sku`, `grn`, or `outbound`
- **THEN** those names MUST be documented as compatibility aliases
- **THEN** new domain capabilities MUST NOT introduce additional primary definitions under the legacy names

### Requirement: Common ERP entity fields
All new canonical ERP entities MUST expose the shared audit and extension fields required for multi-tenant extensibility.

#### Scenario: Shared entity fields are frozen
- **WHEN** a canonical ERP entity type is defined
- **THEN** it MUST include `tenantId`
- **THEN** it MUST include `companyId`
- **THEN** it MUST allow optional `orgId`
- **THEN** it MUST include status, audit, and `ext` extension fields
