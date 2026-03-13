## 1. OpenSpec Artifacts

- [x] 1.1 Add proposal, design, and spec artifacts for order form lookup selectors.

## 2. Form Lookups

- [x] 2.1 Add a reusable remote lookup selector for simple master-data entities.
- [x] 2.2 Replace purchase order supplier text input with supplier lookup.
- [x] 2.3 Replace sales order customer text input with customer lookup.
- [x] 2.4 Evolve purchase and sales order forms to submit `header + lines` payloads with item lookups.
- [x] 2.5 Add purchase/sales order detail preload routes and repopulate edit forms from stored draft lines when available.

## 3. Validation

- [x] 3.1 Run `bun run --filter web build`.
- [x] 3.2 Re-run `bun run --filter web build` after detail preload changes.
