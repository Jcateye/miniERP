## Context

当前 server 边界已经形成：

- `DocumentsService`：兼容 façade
- `PurchaseInboundWriteService` / `SalesShipmentWriteService`：persisted 写路径
- `TradingDocumentsReadService`：persisted 读路径

但 `DocumentsService` 文件里还残留上一代 persisted helper。它们不再被主路径调用，却继续保有数据库查询、状态映射、过账校验和 outbox 逻辑，容易让后续维护误判真实边界。

## Goals / Non-Goals

**Goals**
- 收缩 `DocumentsService` 到 façade + compatibility store 角色。
- 删除已经被 trading services 替代的 persisted helper。
- 补测试证明 `ADJ` / demo fallback 仍正常。

**Non-Goals**
- 本轮不移除 `DocumentsService`
- 本轮不改 `/documents` API 形状
- 本轮不切 BFF / web 到 canonical 新资源

## Decisions

### 1. 只做 dead persisted logic removal，不重命名 façade API

本轮不改 public 方法签名，也不改 controller。

原因：
- 当前目标是清边界，不是做外部契约变更。
- 让后续 BFF / Web 切换时仍能复用兼容入口。

### 2. `ADJ` 与 demo store 继续放在 `DocumentsService`

原因：
- 它们仍属于 compatibility/demonstration 范围。
- 先把 persisted 逻辑删净，再决定是否单独拆 compatibility service。

## Risks / Trade-offs

- `DocumentsService` 仍然较大，因为保留了 demo store 与 in-memory action 逻辑。
- 若后续继续保留 `/documents` 太久，compatibility façade 还是会成为旧新边界的聚集点。

## Validation

- 运行 focused documents delegation/fallback tests
- 运行 `bun run --filter server test`
