## ADDED Requirements

### Requirement: Posting MUST be idempotent and atomic
All posting commands SHALL require an idempotency key and SHALL execute inventory validation, ledger write, balance update, and document state transition within one atomic transaction.

#### Scenario: Repeated posting request with same key
- **WHEN** the same posting command is submitted multiple times with identical idempotency key and payload hash
- **THEN** only one posting result MUST be committed and subsequent requests MUST return the original result

### Requirement: System MUST prevent negative inventory
Outbound and adjustment posting SHALL enforce non-negative inventory via application checks and persistent data constraints.

#### Scenario: Outbound request exceeds available stock
- **WHEN** a posting request would reduce on-hand quantity below zero
- **THEN** the system MUST reject the posting and keep inventory unchanged

### Requirement: Corrections MUST use reversal postings
After successful posting, corrections MUST be implemented by reversal entries rather than deleting or mutating committed ledger history.

#### Scenario: Correct a posted document
- **WHEN** an operator needs to undo a previously posted inventory effect
- **THEN** the system MUST create reversal postings linked to original entries and preserve the full audit chain