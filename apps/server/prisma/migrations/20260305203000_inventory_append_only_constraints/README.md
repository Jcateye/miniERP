Inventory stream hardening migration:
- Enforce append-only semantics for inventory_ledger (block UPDATE/DELETE)
- Enforce reversal consistency and one-reversal-per-source-ledger
- Reject zero quantity_delta writes
