## ADDED Requirements

### Requirement: Application work MUST be organized into six parallel streams with explicit gates
Delivery SHALL be split into platform, masterdata, purchase+inbound, sales+outbound, inventory, and evidence streams with mandatory unlock conditions.

#### Scenario: Start business flow without dependencies
- **WHEN** purchase+inbound or sales+outbound starts before required gates are ready
- **THEN** the task MUST be marked blocked with missing gate labels

### Requirement: Foundation gates MUST be completed before parallel execution
`DB-BASELINE-READY` and `PLATFORM-READY` SHALL be completed before launching parallel core streams.

#### Scenario: Launch core streams
- **WHEN** foundation gates are complete
- **THEN** masterdata, inventory, and evidence streams MUST become ready in parallel

### Requirement: Parallel development kickoff MUST require cross-stream readiness
The team SHALL start full parallel business development only after publishing readiness markers for all prerequisite streams.

#### Scenario: Announce parallel development start
- **WHEN** readiness markers are incomplete
- **THEN** kickoff MUST be denied until all required markers are present
