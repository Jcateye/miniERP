## ADDED Requirements

### Requirement: BFF fixture fallback MUST be disabled by default
BFF routes SHALL default to upstream-only mode, and fixture fallback SHALL require explicit enablement in development.

#### Scenario: Backend unavailable in production
- **WHEN** upstream API is unavailable in production
- **THEN** BFF MUST return explicit upstream unavailable error without fixture data

### Requirement: Fallback usage MUST be observable
When fallback is enabled and used, BFF responses SHALL include traceable headers for monitoring.

#### Scenario: Development fallback hit
- **WHEN** a request is served by fixture fallback
- **THEN** response MUST include a marker header indicating fallback was used

### Requirement: Client-visible errors MUST be deterministic
Unavailable upstream responses SHALL use consistent error code and message contract.

#### Scenario: Upstream timeout
- **WHEN** BFF cannot reach backend
- **THEN** response MUST use a stable error envelope and status code
