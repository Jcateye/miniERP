Inventory schema gap draft migration:
- Scope: unique constraint hardening + tenant-first query indexes + non-negative checks.
- Compatibility: backward-compatible for clean data; may fail on apply if existing dirty rows violate constraints.
- Notes:
  - Normalized unique index is added for `inventory_balance` to block case/space drift duplicates.
  - Ledger and balance read-path indexes are added for `/inventory/ledger` and `/inventory/balances` hot paths.
  - Quantity non-negative constraints are added for inventory-related document lines.
  - This is a draft migration for review; apply only after running preflight SQL checks in `migration.sql`.
