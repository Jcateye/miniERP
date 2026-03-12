Canonical ERP phase 1 additive migration:
- Scope: add company/org support models, canonical item/goods_receipt/shipment tables, inventory transaction tables, and additive compatibility columns on existing business tables.
- Compatibility: additive only; legacy `sku/grn/outbound` tables remain available for current runtime paths.
- Remote DB policy:
  - Generate and review SQL first.
  - Do not delete prior hand-authored indexes or `inventory_ledger` reversal FK in this phase.
  - Apply to the remote `192.168.1.68:5432/minierp` database only after SQL review and backup confirmation.
