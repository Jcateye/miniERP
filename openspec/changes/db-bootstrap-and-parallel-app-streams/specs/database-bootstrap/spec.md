## ADDED Requirements

### Requirement: Database bootstrap MUST provide executable Prisma baseline
The system SHALL provide a runnable Prisma baseline including schema, migrations, and seed data for core domains.

#### Scenario: Initialize database from empty state
- **WHEN** the developer runs `db:generate`, `db:migrate`, and `db:seed`
- **THEN** the database MUST be initialized with core schema and minimum integration seed records

### Requirement: Core schema MUST include tenant, audit, and soft-delete baseline
All tenant-owned transactional entities SHALL include `tenant_id`, status baseline, and audit fields (`created_at/by`, `updated_at/by`, optional `deleted_at/by`).

#### Scenario: Add a transactional table
- **WHEN** a new transactional model is introduced in Prisma schema
- **THEN** it MUST include tenant and audit baseline fields before acceptance

### Requirement: Inventory and evidence constraints MUST be enforced at DB layer
The database SHALL enforce non-negative inventory balance and evidence scope consistency.

#### Scenario: Persist invalid evidence scope data
- **WHEN** a write attempts `scope='line'` with null `line_ref`, or `scope='document'` with non-null `line_ref`
- **THEN** the database MUST reject the write via check constraint
