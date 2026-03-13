## ADDED Requirements

### Requirement: Order forms must use lookup selectors for counterparties

Purchase order and sales order forms MUST select counterparties from BFF-backed lookup options instead of free-text id fields.

#### Scenario: Purchase order form uses supplier lookup

- **WHEN** a user opens the purchase order form
- **THEN** the supplier field loads options from the suppliers BFF resource
- **AND** the user selects a supplier instead of typing a free-form supplier id

#### Scenario: Sales order form uses customer lookup

- **WHEN** a user opens the sales order form
- **THEN** the customer field loads options from the customers BFF resource
- **AND** the user selects a customer instead of typing a free-form customer id

### Requirement: Edit forms must preload real draft lines when detail exists

Purchase order and sales order edit dialogs MUST prefer real draft detail data over compatibility summary rows.

#### Scenario: Purchase order edit dialog loads stored draft detail

- **WHEN** a user edits a purchase order that already exists in the local draft store
- **THEN** the page requests the purchase order detail BFF route
- **AND** the form is repopulated with the stored `header + lines` payload

#### Scenario: Sales order edit dialog loads stored draft detail

- **WHEN** a user edits a sales order that already exists in the local draft store
- **THEN** the page requests the sales order detail BFF route
- **AND** the form is repopulated with the stored `header + lines` payload

#### Scenario: Legacy summary row keeps fallback behavior

- **WHEN** a user edits a purchase order or sales order whose detail route returns not found
- **THEN** the form keeps using the compatibility summary row fallback
- **AND** the page does not block the edit workflow
