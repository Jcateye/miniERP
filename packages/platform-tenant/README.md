# @minierp/platform-tenant

## 目的

提供“租户上下文（TenantContext）”与“租户解析（TenantResolver）”的可复用实现：

- `TenantContext`: 基于 `AsyncLocalStorage` 的 request-scope 上下文存储
- `TenantResolver`: 统一租户来源与校验策略
- `createTenantContextMiddleware`: Express middleware，用于写入 TenantContext

## 解析规则（当前）

1. **优先**使用 authenticated context（JWT claims 等价物）：`req.authContext.tenantId`
2. `X-Tenant-Id`（或 `TENANT_HEADER` 指定的 header）仅在满足以下条件时才作为 fallback：
   - `NODE_ENV=development`
   - `TENANT_HEADER_FALLBACK_ENABLED=true`
3. 若同时存在 `authTenantId` 与 `headerTenantId` 且不一致：
   - 非 `platform_admin`：拒绝（403 / `TENANT_MISMATCH`）
   - `platform_admin`：允许（仍以 auth tenant 为准）
4. 租户缺失：拒绝（400 / `TENANT_MISSING`）

## 在 apps/server 中如何接入

已通过适配层接入（不要求业务侧改 import 路径）：

- middleware 入口：`apps/server/src/common/tenant/tenant-context.middleware.ts`
- context storage 入口：`apps/server/src/common/tenant/tenant-context.ts`
- Nest 注入服务：`apps/server/src/common/tenant/tenant-context.service.ts`

运行时配置：

- `TENANT_HEADER`：租户 header 名（默认 `x-tenant-id`）
- `TENANT_HEADER_FALLBACK_ENABLED`：是否在 dev 允许 header fallback（默认 `false`）

## 如何测试

- 单测：`bun run --filter server test -- src/common/tenant/tenant-context.middleware.spec.ts`
- 全量 server 单测：`bun run --filter server test`

并发隔离依赖 `AsyncLocalStorage` 行为，建议在后续补充 supertest 级别的并发 integration test（当前仓库已具备 middleware/service 的 unit coverage）。
