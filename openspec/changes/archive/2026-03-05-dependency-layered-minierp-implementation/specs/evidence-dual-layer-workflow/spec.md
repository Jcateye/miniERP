## ADDED Requirements

### Requirement: Evidence model MUST support document and line scopes
The evidence system SHALL support two binding scopes: document-level and line-level (`line_ref`), and both scopes MUST be queryable independently.

#### Scenario: Query line-level evidence for discrepancy row
- **WHEN** a client requests evidence for a specific document line with discrepancy
- **THEN** the system MUST return evidence linked by line scope and matching `line_ref`

### Requirement: Evidence asset and link concerns MUST be separated
Object metadata and processing state SHALL be stored in `evidence_asset`, while business associations SHALL be stored in `evidence_link`.

#### Scenario: Attach one asset to multiple business contexts
- **WHEN** one evidence asset needs to be associated with different entities or scopes
- **THEN** the system MUST create separate link records without duplicating asset metadata

### Requirement: Evidence lifecycle MUST include processing and security states
Evidence upload SHALL progress through controlled states including upload, validation, active availability, and risk states.

#### Scenario: Quarantine suspicious evidence
- **WHEN** asynchronous validation flags a file as unsafe
- **THEN** the asset state MUST transition to quarantined and download access MUST be denied