## ADDED Requirements

### Requirement: DTO fields MUST include business-readable field descriptions
Request and response DTO fields SHALL include clear Chinese descriptions, representative examples, and required/optional semantics.

#### Scenario: Inspect DTO schema in Swagger
- **WHEN** a consumer expands a DTO schema in Swagger UI
- **THEN** each key field MUST expose `description`
- **AND** SHOULD expose `example` that matches domain semantics

### Requirement: Special field types MUST describe format and constraints
Fields with enum/date-time/decimal/pagination semantics SHALL include explicit format or constraint hints.

#### Scenario: Validate decimal and enum fields
- **WHEN** schema contains amount or enum status fields
- **THEN** amount-related fields MUST describe unit/precision intent
- **AND** enum fields MUST list allowed values and their meanings