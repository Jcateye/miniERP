## ADDED Requirements

### Requirement: Single document status source
The shared package SHALL provide a single canonical source for document types and document statuses used by legacy document compatibility layers and future trading APIs.

#### Scenario: Legacy document exports forward canonical values
- **WHEN** code imports document status or document type definitions from legacy shared files
- **THEN** those exports MUST resolve to the canonical trading definitions
- **THEN** the repository MUST NOT maintain multiple conflicting document status constants

### Requirement: Canonical domain DTO coverage
The shared package SHALL define canonical DTOs for master data, trading, inventory, and finance domains with explicit field coverage for future ERP expansion.

#### Scenario: Canonical DTOs cover core ERP domains
- **WHEN** the canonical type directory is generated
- **THEN** it MUST include dedicated modules for common, master-data, trading, inventory, finance, and compatibility concerns
- **THEN** each module MUST export compile-safe TypeScript types that downstream code can import immediately

### Requirement: Compatibility aliases remain available
The shared package SHALL preserve backward-compatible aliases for existing imports during the migration window.

#### Scenario: Existing imports keep compiling
- **WHEN** existing server or web code imports current shared types
- **THEN** those imports MUST continue to compile without requiring a same-turn repo-wide rename
- **THEN** compatibility exports MUST clearly indicate the canonical replacement path
