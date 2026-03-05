## ADDED Requirements

### Requirement: Server MUST expose Swagger UI and OpenAPI JSON endpoints
NestJS server SHALL register Swagger/OpenAPI during bootstrap and expose:
- Swagger UI at `/api/docs`
- OpenAPI JSON at `/api/docs-json`

#### Scenario: Open docs after server startup
- **WHEN** server starts successfully
- **THEN** visiting `/api/docs` MUST render Swagger UI
- **AND** visiting `/api/docs-json` MUST return valid OpenAPI JSON

### Requirement: OpenAPI metadata MUST include project identity and auth scheme
OpenAPI document SHALL include title, description, version, and bearer authentication scheme.

#### Scenario: Inspect generated document metadata
- **WHEN** a client fetches `/api/docs-json`
- **THEN** the document MUST contain non-empty `info.title`, `info.version`
- **AND** security scheme MUST define bearer token authentication