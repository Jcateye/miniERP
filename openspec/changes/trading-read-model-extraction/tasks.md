## 1. OpenSpec Artifacts

- [x] 1.1 Add proposal, design, and spec artifacts for trading read model extraction.

## 2. Trading Read Model Service

- [x] 2.1 Add a formal trading read model service under `apps/server/src/modules/trading/application`.
- [x] 2.2 Update `DocumentsService` so persisted `list/getDetail` paths delegate to the read model service.

## 3. Validation

- [x] 3.1 Add or update focused tests for trading read delegation behavior.
- [x] 3.2 Run `bun run --filter server test`.
