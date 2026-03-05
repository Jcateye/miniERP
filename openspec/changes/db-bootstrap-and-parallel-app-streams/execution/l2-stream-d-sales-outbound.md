# Stream D（sales+outbound）交付记录

## 完成项

- SO/OUT 在 DocumentsService 中接入 Prisma 持久化读写路径（list/detail/action）。
- 保留非 SO/OUT 的既有路径，避免阻塞其他 stream。
- OUT 过账时调用 inventory posting，并对库存不足返回语义化错误 `OUTBOUND_STOCK_INSUFFICIENT`。
- 更新 controller 错误映射（`DOCUMENT_NOT_FOUND`、`UNKNOWN_ACTION`、`OUTBOUND_STOCK_INSUFFICIENT`）。
- 补充并更新单元测试（service/controller），覆盖 SO 持久化列表与 OUT 库存不足分支。

## 验证点

- SO/OUT 状态迁移仍受 core-document 状态机约束。
- OUT `post` 触发库存写入契约（InventoryPostingService）。
- 库存不足时返回冲突语义，不吞掉底层错误。

## 交付标记

- `SAL-OUT-READY`
