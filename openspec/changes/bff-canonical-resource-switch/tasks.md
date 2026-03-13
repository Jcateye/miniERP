## 1. OpenSpec Artifacts

- [x] 1.1 Add proposal, design, and spec artifacts for BFF canonical resource switch.

## 2. Canonical BFF Resources

- [x] 2.1 Add canonical top-level BFF routes for `items`, `purchase-orders`, and `sales-orders`.
- [x] 2.2 Keep legacy item/order BFF routes available as compatibility aliases.

## 3. Web Consumers

- [x] 3.1 Update hooks and page mutations so SKU, purchase order, and sales order views use canonical BFF resources.

## 4. Canonical Mapper Consolidation

- [x] 4.1 Extract shared purchase/sales order BFF mappers for status, list, and detail normalization.
- [x] 4.2 Add stable ids to canonical order list rows and let detail preload fall back to upstream persisted documents.
- [x] 4.3 Carry upstream counterparty ids and line snapshot fields through canonical order detail mapping.
- [x] 4.4 Resolve persisted counterparty lookup labels from customer/supplier masterdata detail when available.
- [x] 4.5 Add readable GET handlers for canonical customer/supplier detail routes and convert legacy mdm detail routes into aliases.
- [x] 4.6 Resolve persisted order line labels from canonical item detail when upstream snapshots are absent.
- [x] 4.7 Unify canonical customer/supplier/item detail reads behind a shared resolver result model.
- [x] 4.8 Switch customer/supplier list pages to canonical top-level resources and preload edit detail.
- [x] 4.9 Preload canonical item detail for SKU edit dialogs.
- [x] 4.10 Expand SKU/Item form payloads to include richer canonical item fields in web/BFF.

## 5. Validation

- [x] 5.1 Run `bun run --filter web build`.
- [x] 5.2 Re-run `bun run --filter web build` after mapper consolidation.
- [x] 5.3 Re-run `bun run --filter web build` after stable-id and upstream-detail changes.
- [x] 5.4 Run `bun run --filter server test` after shared/server detail contract expansion.
