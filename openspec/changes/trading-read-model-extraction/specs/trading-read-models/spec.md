## ADDED Requirements

### Requirement: Documents facade delegates persisted trading reads
The server MUST delegate persisted trading document read models from `DocumentsService` to a formal trading read model service.

#### Scenario: Documents service lists persisted trading documents through read model service
- **WHEN** `DocumentsService.list` receives a persisted trading doc type (`PO`, `GRN`, `SO`, or `OUT`) and Prisma is available
- **THEN** it MUST delegate the persisted query to a trading read model service
- **THEN** it MUST return the same pagination and item shape used by the existing `/documents` API

#### Scenario: Documents service fetches persisted trading document detail through read model service
- **WHEN** `DocumentsService.getDetail` receives a persisted trading doc type (`PO`, `GRN`, `SO`, or `OUT`) and Prisma is available
- **THEN** it MUST delegate the persisted query to a trading read model service
- **THEN** it MUST return the same `DocumentDetail` shape used by the existing `/documents` API

### Requirement: Compatibility facade remains stable
The read extraction MUST preserve the current `/documents` compatibility contract for callers.

#### Scenario: Existing callers keep their contract
- **WHEN** existing controller or BFF code calls `DocumentsService.list` or `DocumentsService.getDetail`
- **THEN** request and response shapes MUST remain unchanged
- **THEN** demo and `ADJ` compatibility paths MUST continue to work
