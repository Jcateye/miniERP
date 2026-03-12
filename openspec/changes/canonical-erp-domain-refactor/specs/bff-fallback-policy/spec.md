## MODIFIED Requirements

### Requirement: BFF fixture fallback stays read-only
The BFF MUST restrict fixture fallback to GET-based read routes in `development` or `test`, and MUST NOT rely on fixture or view metadata to invent missing backend facts for write payloads or canonical shared fields.

#### Scenario: Read route may degrade to fixture
- **WHEN** a GET route targets an unavailable upstream in `development` or `test`
- **THEN** the BFF MAY return a fixture response
- **THEN** the response MUST expose fallback metadata headers

#### Scenario: Write route cannot invent missing backend facts
- **WHEN** a POST, PATCH, PUT, DELETE, or action route receives canonical ERP payload fields
- **THEN** the BFF MUST validate and forward only fields supported by its canonical request contract
- **THEN** it MUST NOT fabricate authoritative domain values from fixture or presentation metadata

#### Scenario: Shared canonical field mapping remains explicit
- **WHEN** a BFF route maps upstream DTOs into shared canonical DTOs
- **THEN** any field not supplied by the upstream MUST either remain null/empty by contract or be marked as compatibility-only
- **THEN** the route MUST NOT silently pretend a fixture-derived value is backend truth
