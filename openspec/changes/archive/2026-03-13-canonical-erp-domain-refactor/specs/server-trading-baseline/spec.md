## ADDED Requirements

### Requirement: Central trading catalog
The server MUST expose a single trading domain catalog for canonical and legacy document identifiers.

#### Scenario: Server code resolves document identifiers
- **WHEN** a server module needs to map document names or status semantics
- **THEN** it MUST use a shared trading catalog module
- **THEN** the catalog MUST expose canonical document types, legacy aliases, and the canonical status code list

### Requirement: Boundary modules reuse shared status source
Server purchase, sales, inbound, and outbound boundaries MUST not redefine their own independent status sources.

#### Scenario: Boundary status types stay aligned with shared canonical types
- **WHEN** purchase, sales, inbound, or outbound modules validate status transitions
- **THEN** they MUST derive their status types from the shared canonical trading status source
- **THEN** they MUST keep existing boundary semantics for `PO`, `SO`, `GRN`, and `OUT` transition checks

### Requirement: Trading catalog is verified by tests
The new trading catalog MUST be covered by focused tests so the compatibility mappings remain stable.

#### Scenario: Catalog behavior is exercised
- **WHEN** the server test suite runs for trading domain code
- **THEN** there MUST be a test that verifies legacy-to-canonical mappings
- **THEN** there MUST be a test that verifies canonical status membership for each boundary
