## ADDED Requirements

### Requirement: Public endpoints MUST provide clear operation-level descriptions
Each public REST endpoint SHALL declare `summary` and `description` explaining purpose, usage conditions, and key business constraints.

#### Scenario: Validate endpoint description completeness
- **WHEN** an endpoint is included in OpenAPI output
- **THEN** the endpoint operation MUST have non-empty `summary`
- **AND** SHOULD have non-empty `description` with business context

### Requirement: Public endpoints MUST declare response semantics
Endpoints SHALL declare success responses and major error responses relevant to business and validation failures.

#### Scenario: Review endpoint response documentation
- **WHEN** a consumer views one command endpoint in Swagger
- **THEN** success response code and payload schema MUST be documented
- **AND** at least common failure responses (e.g. validation/permission/conflict) MUST be discoverable