## ADDED Requirements

### Requirement: BFF must expose canonical top-level item and order resources

The web BFF MUST expose canonical top-level resources for item, purchase order, and sales order access while keeping legacy paths readable as compatibility aliases.

#### Scenario: SKU page reads through canonical item resource

- **WHEN** the SKU management view requests list data
- **THEN** its hook reads from `/api/bff/items`
- **AND** the underlying BFF behavior remains compatible with the existing page shape

#### Scenario: Purchase order page uses canonical order resource

- **WHEN** the purchase order page performs list or mutation requests
- **THEN** it targets `/api/bff/purchase-orders`
- **AND** legacy `/api/bff/procure/purchase-orders` remains available as a compatibility alias

#### Scenario: Sales order page uses canonical order resource

- **WHEN** the sales order page performs list or mutation requests
- **THEN** it targets `/api/bff/sales-orders`
- **AND** legacy `/api/bff/sales/orders` remains available as a compatibility alias

### Requirement: Canonical order routes must normalize list and detail shapes through shared mappers

Purchase order and sales order canonical BFF routes MUST normalize draft and upstream data through shared mapper functions, rather than duplicating shape conversion in each route.

#### Scenario: Purchase order list and detail share canonical status normalization

- **WHEN** purchase order list or detail data is emitted from the BFF
- **THEN** status conversion is produced by a shared purchase-order mapper
- **AND** canonical and legacy alias routes keep returning the same shape

#### Scenario: Sales order list and detail share canonical status normalization

- **WHEN** sales order list or detail data is emitted from the BFF
- **THEN** status conversion is produced by a shared sales-order mapper
- **AND** canonical and legacy alias routes keep returning the same shape

### Requirement: Canonical order list rows must carry stable ids for detail workflows

Purchase order and sales order canonical BFF resources MUST keep display document numbers while also exposing stable ids for edit and detail preload flows.

#### Scenario: Purchase order page uses backend id for persisted detail

- **WHEN** the purchase order list contains persisted upstream rows
- **THEN** each row includes a stable `id` in addition to `po`
- **AND** the edit flow can request `/api/bff/purchase-orders/{id}` without treating `po` as the resource identifier

#### Scenario: Sales order page uses backend id for persisted detail

- **WHEN** the sales order list contains persisted upstream rows
- **THEN** each row includes a stable `id` in addition to `so`
- **AND** the edit flow can request `/api/bff/sales-orders/{id}` without treating `so` as the resource identifier

### Requirement: Canonical order detail must preserve upstream counterparty ids and line snapshots

Purchase order and sales order canonical detail routes MUST carry forward upstream counterparty ids and item snapshots when persisted detail exists.

#### Scenario: Purchase order edit preload receives real supplier id

- **WHEN** `/api/bff/purchase-orders/{id}` loads a persisted upstream purchase order
- **THEN** the response includes a real `supplierId` derived from upstream detail
- **AND** line payloads keep item snapshot labels when the backend provides them

#### Scenario: Sales order edit preload receives real customer id

- **WHEN** `/api/bff/sales-orders/{id}` loads a persisted upstream sales order
- **THEN** the response includes a real `customerId` derived from upstream detail
- **AND** line payloads keep item snapshot labels when the backend provides them

#### Scenario: Persisted detail resolves counterparty lookup label from masterdata

- **WHEN** a persisted purchase order or sales order detail includes a real counterparty id
- **THEN** the canonical detail route attempts to resolve the corresponding customer or supplier detail
- **AND** the response prefers a human-readable lookup label over a raw numeric id when masterdata lookup succeeds

#### Scenario: Customer and supplier canonical detail routes remain the readable source

- **WHEN** the BFF needs masterdata detail for canonical order enrichment
- **THEN** `/api/bff/customers/{id}` and `/api/bff/suppliers/{id}` provide readable GET access
- **AND** legacy `mdm/customers/{id}` and `mdm/suppliers/{id}` continue as compatibility aliases

#### Scenario: Persisted order lines resolve canonical item labels when snapshots are absent

- **WHEN** a persisted purchase order or sales order detail line does not include `itemNameSnapshot`
- **THEN** the canonical detail route attempts to resolve the corresponding item detail
- **AND** the response prefers a human-readable `code · name` label over a raw `itemId` or generic placeholder when item lookup succeeds

#### Scenario: Canonical masterdata detail routes and enrichment share the same fallback rules

- **WHEN** canonical customer, supplier, or item detail is read either by a BFF route or by order-detail enrichment
- **THEN** both paths use the same shared detail resolver behavior
- **AND** backend success, fixture fallback, and not-found handling stay consistent across these consumers

#### Scenario: Customer and supplier pages use canonical top-level BFF resources

- **WHEN** customer or supplier list pages perform list or mutation requests
- **THEN** they target `/api/bff/customers` and `/api/bff/suppliers`
- **AND** editing preloads canonical detail rather than relying only on the current list row snapshot

#### Scenario: SKU edit dialog preloads canonical item detail

- **WHEN** the SKU management page opens an existing item for editing
- **THEN** it requests `/api/bff/items/{id}` for canonical detail preload
- **AND** the form may start from the current list row fallback but should prefer returned item detail fields when available

#### Scenario: SKU item form carries richer canonical item fields

- **WHEN** the SKU management page creates or edits an item
- **THEN** the form includes barcode, batch/serial management, stock thresholds, and lead-time fields
- **AND** canonical item detail preload can repopulate these richer fields when they are available
