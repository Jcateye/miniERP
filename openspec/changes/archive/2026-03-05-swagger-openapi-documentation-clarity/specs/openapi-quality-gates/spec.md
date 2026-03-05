## ADDED Requirements

### Requirement: Project MUST provide OpenAPI generation command
Repository SHALL include a deterministic command to generate or export OpenAPI document for validation use.

#### Scenario: Generate OpenAPI artifact in CI
- **WHEN** CI runs documentation checks
- **THEN** command MUST produce OpenAPI output without manual interaction

### Requirement: Project MUST enforce minimum OpenAPI quality checks
CI SHALL fail when newly added public endpoints miss operation summary or required schema descriptions according to project rules.

#### Scenario: Block undocumented new endpoint
- **WHEN** a pull request introduces a new public endpoint without required doc annotations
- **THEN** OpenAPI quality check MUST fail with actionable diagnostics