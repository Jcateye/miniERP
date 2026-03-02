## ADDED Requirements

### Requirement: Shared contracts MUST be the single source of cross-layer truth
All cross-layer document types, statuses, API envelope structures, and monetary semantics SHALL be defined in `packages/shared` and consuming modules MUST NOT redefine conflicting schemas.

#### Scenario: Detect conflicting local DTO schema
- **WHEN** a server or web module introduces a DTO or enum that conflicts with the shared contract definition
- **THEN** the change MUST be rejected until the module aligns to shared definitions

### Requirement: Contract changes MUST follow compatibility governance
Any contract evolution SHALL include compatibility classification (backward-compatible or breaking), migration notes, and a deprecation window for removals.

#### Scenario: Process a breaking contract change
- **WHEN** a contract field removal or required-field addition is proposed
- **THEN** the change MUST include migration notes and a deprecation window before enforcement