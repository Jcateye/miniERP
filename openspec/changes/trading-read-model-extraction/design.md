## Context

当前 `DocumentsService` 的职责还剩两块：

- façade：`/documents` 兼容 API、幂等缓存、in-flight dedup、内存 demo
- persisted read model：`PO/GRN/SO/OUT` 的 `list/getDetail`

上一轮 `trading-write-path-extraction` 已经把 persisted `create/action` 抽到正式 trading write services。现在要继续把 persisted `list/getDetail` 迁出，形成：

- `DocumentsService`：兼容 façade + demo
- `TradingDocumentsReadService`：persisted 查询
- `PurchaseInboundWriteService` / `SalesShipmentWriteService`：persisted 写路径

## Goals / Non-Goals

**Goals:**
- 新增正式 trading read model service。
- `DocumentsService.list/getDetail` 在 Prisma persisted 路径下改成委托调用。
- 保持 controller/BFF/API 形状不变。

**Non-Goals:**
- 本轮不移除 `DocumentsService`。
- 本轮不改 `ADJ` 或 demo 数据的读模型。
- 本轮不切 BFF/web 到 canonical 新 route。

## Decisions

### 1. 读模型先合并成一个 service，而不是按两条链再拆两个 read service

本轮新增单一 `TradingDocumentsReadService`，覆盖 `PO/GRN/SO/OUT` 的 persisted 查询。

原因：
- `list/getDetail` 的结构高度相似，本轮按一个 service 整理更容易去掉 `DocumentsService` 中的重复逻辑。
- 和写路径不同，读路径目前没有复杂的 side effect，不需要先按链路强拆。

### 2. façade 继续保留内存 demo 与 `ADJ`

`DocumentsService` 对 `ADJ` 和 demo 文档仍保留现状。

原因：
- 本轮目标是 persisted read model 抽离，不扩大到历史 demo 兼容层。
- 先把 Prisma 路径收出去，后续再决定是否彻底分离 demo store。

### 3. 允许 `DocumentsService` 暂时保留旧私有 helper

就算 persisted read helpers 迁出后，`DocumentsService` 暂时还有未删掉的旧私有方法也接受。

原因：
- 本轮先确保依赖关系和调用边界正确。
- 后续可再做一次“清理 dead private methods”的小步重构。

## Risks / Trade-offs

- [暂时存在未删除 helper] → 会有少量历史私有方法残留；后续清理即可。
- [read/write 分治后 service 数量增加] → 模块文件变多；但边界更清楚，收益大于成本。

## Migration Plan

1. 新增 OpenSpec proposal/design/spec/tasks。
2. 在 `modules/trading/application` 下新增 `TradingDocumentsReadService`。
3. 更新 `TradingModule` / `DocumentsModule` provider。
4. 让 `DocumentsService.list/getDetail` 在 persisted 路径下委托 read model service。
5. 运行 `bun run --filter server test` 验证。

## Open Questions

- 下一轮是否把 `ADJ` 读模型也从 `DocumentsService` 中分离。
- 是否在再下一轮把 demo store 也挪到独立 compatibility service。
