## ADDED Requirements

### Requirement: Web build baseline is green
The web workspace MUST compile successfully after canonical contract baseline changes are introduced.

#### Scenario: Integration logs page builds successfully
- **WHEN** `bun run --filter web build` is executed
- **THEN** the integration logs route MUST resolve all component imports without missing export errors

### Requirement: Form status payloads use canonical codes
Purchase and sales draft forms SHALL submit canonical status codes instead of localized display strings.

#### Scenario: Sales order draft uses canonical status code
- **WHEN** a user creates or edits a sales order draft from the web form
- **THEN** the submitted payload MUST contain a stable status code
- **THEN** the UI MAY render a localized label separately from the payload value

#### Scenario: Purchase order draft uses canonical status code
- **WHEN** a user creates or edits a purchase order draft from the web form
- **THEN** the submitted payload MUST contain a stable status code
- **THEN** the BFF draft store MUST map the code to the existing list presentation shape
