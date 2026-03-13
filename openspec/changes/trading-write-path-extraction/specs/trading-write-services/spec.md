## ADDED Requirements

### Requirement: Documents facade delegates formal trading writes
The server MUST delegate persisted trading document writes from `DocumentsService` to formal trading write services.

#### Scenario: Documents service creates persisted trading document through delegated service
- **WHEN** `DocumentsService.create` receives a persisted trading doc type (`PO`, `GRN`, `SO`, or `OUT`) and Prisma is available
- **THEN** it MUST validate idempotency and input at the façade layer
- **THEN** it MUST delegate the actual Prisma write orchestration to a trading write service
- **THEN** it MUST return the same `DocumentCreateResult` contract used by the existing `/documents` API

### Requirement: Trading write services own status-changing persisted actions
Formal trading write services MUST own persisted status transitions and inventory/audit side effects for their document families.

#### Scenario: Purchase or inbound action uses purchase-inbound write service
- **WHEN** a persisted `PO` or `GRN` action is executed through `/documents`
- **THEN** the purchase/inbound write service MUST execute the status transition, persistence update, audit logging, and inventory posting behavior required for that action

#### Scenario: Sales or shipment action uses sales-shipment write service
- **WHEN** a persisted `SO` or `OUT` action is executed through `/documents`
- **THEN** the sales/shipment write service MUST execute the status transition, persistence update, audit logging, and inventory posting behavior required for that action

### Requirement: Documents facade preserves compatibility behavior
The extraction MUST preserve the current `/documents` compatibility contract for callers.

#### Scenario: Existing controller contract remains unchanged
- **WHEN** existing controller or BFF code calls `DocumentsService`
- **THEN** the request and response shapes MUST remain unchanged
- **THEN** idempotency and in-flight dedup behavior at the façade layer MUST continue to work
