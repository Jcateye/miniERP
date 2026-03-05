## ADDED Requirements

### Requirement: Prisma migration governance MUST classify compatibility
Every schema change SHALL be labeled as backward-compatible or breaking and include migration notes.

#### Scenario: Propose a breaking schema update
- **WHEN** a required field is added or existing field is removed
- **THEN** the change MUST include migration plan and rollback notes before merge

### Requirement: Tenant-first indexes MUST cover hot paths
Prisma model indexes SHALL prioritize `tenant_id` as leading key for list and ledger query paths.

#### Scenario: Define ledger query index
- **WHEN** inventory ledger supports tenant + SKU + posted time queries
- **THEN** an index with tenant-leading order MUST exist

### Requirement: Idempotency semantics MUST be persisted
Idempotency records SHALL be persisted with tenant-aware uniqueness and payload hash conflict detection support.

#### Scenario: Replay command with same idempotency key but different payload
- **WHEN** repeated request uses same key and different payload hash
- **THEN** the system MUST return conflict and reject write
