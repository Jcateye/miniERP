## ADDED Requirements

### Requirement: Backend modules MUST enforce layered architecture boundaries
Each domain module SHALL implement controller, application, domain, and infrastructure layers, and cross-module interactions MUST occur through application interfaces only.

#### Scenario: Prevent repository-level cross-module access
- **WHEN** module A attempts to access module B repository directly
- **THEN** architecture validation MUST fail and require switching to module B application interface

### Requirement: Command and query responsibilities MUST be separated
Write operations SHALL be exposed as command endpoints, and read operations SHALL be exposed as query endpoints with independent evolution paths.

#### Scenario: Validate command endpoint behavior
- **WHEN** a create/confirm/post/cancel request is implemented
- **THEN** it MUST be defined as a command path with explicit state-transition and audit requirements