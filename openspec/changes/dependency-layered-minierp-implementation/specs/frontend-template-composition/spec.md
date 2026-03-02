## ADDED Requirements

### Requirement: Pages MUST be composed from approved template families
Business pages SHALL be composed from the T1/T2/T3/T4 template families and MUST preserve template structure while allowing field/data configuration.

#### Scenario: Build a new GRN wizard page
- **WHEN** a new GRN workflow page is created
- **THEN** it MUST use the T4 wizard template contract rather than a custom ad-hoc page shell

### Requirement: Data orchestration MUST be separated from presentational templates
Template components SHALL be presentation-only, while data fetching and aggregation SHALL be handled by SDK/BFF/hooks layers.

#### Scenario: Detect API call inside template component
- **WHEN** a template component introduces direct API fetching logic
- **THEN** the implementation MUST be rejected and data logic moved to SDK/BFF/hooks

### Requirement: Frontend delivery order MUST follow backend dependency readiness
Feature page integration SHALL start only after dependent shared contracts and backend API contracts are marked ready.

#### Scenario: Start integration before API contract readiness
- **WHEN** a page integration task starts without required contract readiness label
- **THEN** the task MUST be marked blocked until dependency readiness is satisfied