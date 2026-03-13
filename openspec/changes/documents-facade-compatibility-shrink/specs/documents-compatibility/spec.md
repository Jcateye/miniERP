## ADDED Requirements

### Requirement: DocumentsService must remain a compatibility facade only

`DocumentsService` MUST delegate persisted trading read/write paths to formal trading services and keep only compatibility responsibilities locally.

#### Scenario: ADJ list remains local to facade

- **WHEN** caller lists `ADJ` documents through `/documents`
- **THEN** `DocumentsService` returns compatibility/demo data from its local store
- **AND** it does not call `TradingDocumentsReadService.list`

#### Scenario: Persisted PO detail is not implemented in facade

- **WHEN** caller requests persisted `PO` detail through `/documents`
- **THEN** `DocumentsService` delegates to `TradingDocumentsReadService.getDetail`
- **AND** the facade itself does not contain a second persisted PO detail implementation
