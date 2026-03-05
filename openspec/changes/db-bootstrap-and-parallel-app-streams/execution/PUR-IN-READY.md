# PUR-IN-READY

## Gate
- Marker: `PUR-IN-READY`
- Stream: C (purchase + inbound)
- Date: 2026-03-05

## Completed Scope
- 6.1 PO/GRN 状态机持久化与错误语义
- 6.2 GRN 过账前校验与库存调用契约

## Implementation Notes
- 文档服务 PO/GRN 切到 Prisma 持久化：`apps/server/src/modules/documents/services/documents.service.ts`
  - `list/getDetail` 对 `PO/GRN` 读取真实表 `purchase_order` / `grn` + line 表。
  - `executeAction` 对 `PO/GRN` 写回持久化状态，并写入 `state_transition_log`。
  - 保留 `SO/OUT/ADJ` 内存路径，避免扩大本次 stream 影响面。
- GRN 过账前校验（post 前）
  - 必须有 `warehouse_id`。
  - 必须有行项目，且每行 qty 为正整数（用于 inventory int ledger）。
  - 若关联 PO：PO 必须存在且状态为 `confirmed|closed`。
  - 若关联 PO：GRN SKU 必须在 PO 内，且 GRN 数量不得超过 PO 对应数量。
- 库存调用契约
  - GRN post 调用 `InventoryPostingService.post`。
  - `referenceType=GRN`，`referenceId=<grn_id>`。
  - lines 映射为 `{ skuId, warehouseId, quantityDelta }`。

## Validation
- `bun run --filter server build`
- `bun run --filter server test -- src/modules/documents/services/documents.service.spec.ts src/modules/documents/controllers/documents.controller.spec.ts`

