## Context

`DocumentsService` 目前是一个混合体：

- `list/getDetail` 为兼容读模型
- `create/executeAction` 同时处理内存 demo 路径与 Prisma 正式路径
- `PO/GRN` 与 `SO/OUT` 的正式写逻辑已经存在，但散落在同一个 service 的私有方法里

这导致两个问题：

1. trading 模块虽然已经有 catalog 和 boundary，但还没有承接真正的主写路径。
2. 任何对采购、收货、销售、发运写逻辑的增强，都会继续扩大 `DocumentsService` 的体积和耦合。

本轮目标不是改 API，也不是一次性移除 `/documents`，而是先把 Prisma 写路径拆成正式 trading services，再由 `DocumentsService` 做兼容委托。

## Goals / Non-Goals

**Goals:**
- 为 `PO/GRN` 与 `SO/OUT` 新增正式 trading write service。
- `DocumentsService.create` 和 `DocumentsService.executeAction` 对 Prisma 正式路径改成委托调用。
- 保持 controller/BFF/API 形状不变。
- 保持现有 idempotency / inflight dedup 行为不回退。

**Non-Goals:**
- 本轮不移除 `/documents` 兼容接口。
- 本轮不改 `list/getDetail` 的读模型实现。
- 本轮不把内存 demo 路径移到 trading 模块。
- 本轮不切 BFF / web 到新的 canonical 写接口。

## Decisions

### 1. 按交易链路拆成两个 write service，而不是先引入一个巨型 trading service

新增两个服务：

- `PurchaseInboundWriteService`
- `SalesShipmentWriteService`

原因：
- 采购/收货与销售/发运的上下游引用和库存方向不同，天然就是两条链。
- 一次只引入两个服务，比先做一个统一大 service 更容易维持边界清晰。

备选方案：
- 一个 `TradingWriteService` 全包：会把刚拆出来的逻辑重新堆成新大类。

### 2. `DocumentsService` 保留 façade 职责，不立刻改 controller

`DocumentsController`、BFF 和前端当前都依赖 `/documents`。本轮只改 service 内部委托，不改 controller 协议。

原因：
- 可以把重构风险限制在 server 模块内部。
- 先保住现有测试和联调，再逐步切到 canonical route。

### 3. 保留 `DocumentsService` 的幂等和 in-flight dedup 外壳

`DocumentsService` 继续处理：

- `Idempotency-Key` 校验
- `createIdempotencyCache`
- `idempotencyCache`
- `inflightActionRequests`

正式 trading write services 只负责单次业务执行。

原因：
- 这是当前 `/documents` 兼容入口的重要运行行为，不适合在本轮一起挪动。
- 先拆业务写路径，再决定后续是否把幂等外壳迁到 controller 或 shared action middleware。

### 4. 允许短期复制少量 helper，而不是先做大规模 shared helper 提炼

本轮优先抽离 orchestration 责任，允许新 service 带少量局部 helper。

原因：
- 先把边界切开，比一次性追求 helper 完全去重更重要。
- 如果 helper 真正稳定，再在下一轮抽成 support service。

## Risks / Trade-offs

- [局部 helper 复制] → 会有少量重复逻辑；通过把范围限定在 write path，后续再抽 support service 收敛。
- [兼容 façade 仍存在] → `DocumentsService` 体积不会一次变小很多；通过明确“写路径已委托、读路径待后续处理”控制范围。
- [测试面较广] → documents 相关单测较多；通过保持 controller/API 形状不变来降低回归面。

## Migration Plan

1. 新增 OpenSpec proposal/design/spec/tasks。
2. 在 `modules/trading/application` 下新增 purchase/inbound 和 sales/shipment write services。
3. 更新 `DocumentsModule` provider，向 `DocumentsService` 注入新 services。
4. 让 `DocumentsService.create/executeAction` 在 Prisma 正式路径下委托 trading services。
5. 运行 `bun run --filter server test` 验证。

## Open Questions

- 下一轮是否把 `list/getDetail` 也迁出 `DocumentsService`，形成真正的 read-model service。
- 是否要把幂等缓存也从 `DocumentsService` façade 继续下沉到 trading action 层。
