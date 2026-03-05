# SAL-OUT-READY

## Gate
- Marker: `SAL-OUT-READY`
- Stream: D (sales + outbound)
- Date: 2026-03-05

## Completed Scope
- SO/OUT 在 documents service 中已接入 Prisma 持久化 list/detail/action。
- OUT post 已接入库存过账契约与库存不足语义化错误。
- controller 错误映射包含 `OUTBOUND_STOCK_INSUFFICIENT`。

## Validation
- `bun run --filter server test -- src/modules/documents/services/documents.service.spec.ts`
- `bun run --filter server test -- src/modules/documents/controllers/documents.controller.spec.ts`
