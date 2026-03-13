## Why

`DocumentsService` 当前同时承担了读模型聚合、内存 demo、Prisma 持久化写入、状态流转、库存过账和审计编排，已经成为 canonical ERP 继续演进的主要阻塞点。既然 Prisma canonical phase 1 已经落库，下一步必须先把交易单据的主写路径从这个兼容聚合器里拆出来，避免后续继续把采购、收货、销售、发运的正式逻辑堆回 `DocumentsService`。

## What Changes

- 为采购/收货与销售/发运分别新增正式 trading write service，承接 `create` 和 `action` 写路径。
- 让 `DocumentsService` 降级为兼容 façade：保留现有 API 形状、idempotency/inflight dedup 和读模型行为，但把 Prisma 写入委托给 trading services。
- 保持 `/documents` 兼容入口不变，确保 controller / BFF / 现有测试不需要同步改协议。
- 为新的 trading write split 补 focused test，覆盖至少一条 façade delegation 和一条正式 trading write 行为。

## Capabilities

### New Capabilities
- `trading-write-services`: 为 `purchase_order`、`goods_receipt`、`sales_order`、`shipment` 提供正式 server 写服务，并要求 `DocumentsService` 只作为兼容委托层。

### Modified Capabilities

## Impact

- 受影响代码：
  - `apps/server/src/modules/documents/services/documents.service.ts`
  - `apps/server/src/modules/documents/documents.module.ts`
  - `apps/server/src/modules/trading/*`
- 运行影响：
  - `/documents` controller 保持不变
  - Prisma 写入、状态流转、库存过账、审计记录改由 trading 模块承接
- 验证影响：
  - 需要继续通过 `bun run --filter server test`
