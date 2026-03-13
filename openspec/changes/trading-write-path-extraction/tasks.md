## 1. OpenSpec Artifacts

- [x] 1.1 Add proposal, design, and spec artifacts for trading write path extraction.

## 2. Trading Write Services

- [x] 2.1 Add formal purchase/inbound and sales/shipment write services under `apps/server/src/modules/trading/application`.
- [x] 2.2 Update `DocumentsModule` and `DocumentsService` so persisted write paths delegate to the new trading services.

## 3. Validation

- [x] 3.1 Add or update focused tests for trading write extraction behavior.
- [x] 3.2 Run `bun run --filter server test`.
