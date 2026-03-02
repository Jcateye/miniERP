## ADDED Requirements

### Requirement: Tenant-aware data model MUST be enforced for all core entities
All tenant-owned core tables SHALL include non-null `tenant_id`, and business uniqueness MUST be represented by tenant-prefixed composite unique constraints.

#### Scenario: Validate tenant-prefixed uniqueness
- **WHEN** the model defines document numbers or SKU codes
- **THEN** uniqueness MUST be enforced using composite keys that include `tenant_id`

### Requirement: Core entities MUST include audit and state baseline fields
All transactional business entities SHALL include status and audit fields (`created_at/by`, `updated_at/by`, optional soft-delete fields) and SHALL support explicit state transitions.

#### Scenario: Create a new transactional entity
- **WHEN** a new transactional table is introduced
- **THEN** the table MUST include status and audit baseline fields before it is accepted

### Requirement: Query performance paths MUST be backed by tenant-first indexes
Hot-path list and ledger queries SHALL define tenant-first composite indexes aligned to filter and sort patterns.

#### Scenario: Define inventory ledger query index
- **WHEN** inventory ledger query patterns include tenant, SKU, and time ordering
- **THEN** an index with tenant-leading order MUST be present for that query path