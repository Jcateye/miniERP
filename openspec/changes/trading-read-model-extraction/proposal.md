## Why

`DocumentsService` 虽然已经把 persisted 写路径委托给正式 trading services，但 persisted `list/getDetail` 读模型仍然留在这个兼容 façade 里，导致它继续同时承担 façade、读模型和内存 demo 三种职责。要继续把 `/documents` 从“大而全 service”收敛成兼容入口，下一步必须把 Prisma 读模型也抽到正式 trading 模块中。

## What Changes

- 新增正式 trading read model service，承接 persisted `PO/GRN/SO/OUT` 的 `list/getDetail` 查询。
- 让 `DocumentsService` 在 Prisma 可用时把 persisted `list/getDetail` 委托给 read model service。
- 保持 `/documents` controller、BFF 和前端看到的 request/response 形状不变。
- 为读模型委托补 focused test，确保 façade 行为稳定。

## Capabilities

### New Capabilities
- `trading-read-models`: 为 persisted 交易单据提供正式 read model service，并要求 `DocumentsService` 只作为兼容委托层。

### Modified Capabilities

## Impact

- 受影响代码：
  - `apps/server/src/modules/documents/services/documents.service.ts`
  - `apps/server/src/modules/documents/documents.module.ts`
  - `apps/server/src/modules/trading/*`
- 运行影响：
  - `/documents` 的 persisted list/detail 逻辑改由 trading 模块承接
  - 内存 demo 和 `ADJ` 兼容读路径维持不变
- 验证影响：
  - 需要继续通过 `bun run --filter server test`
