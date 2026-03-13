## 1. OpenSpec Artifacts

- [x] 1.1 Add proposal, design, and spec artifacts for documents facade compatibility shrink.

## 2. Documents Facade Shrink

- [x] 2.1 Remove dead persisted helper logic from `DocumentsService`, keeping only façade + compatibility responsibilities.
- [x] 2.2 Keep persisted read/write delegation behavior unchanged.

## 3. Validation

- [x] 3.1 Add or update focused tests for compatibility fallback behavior.
- [x] 3.2 Run `bun run --filter server test`.
