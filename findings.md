# Findings：origin-dccb69fa 设计落地盘点

## 文档关系与结论
- origin-dccb69fa-middle-platform-design.md：更“蓝图/全量设计稿”，包含建议的 packages 划分（foundation/auth/tenant/request-context/db/migrations/iam/policy/api-kit）。
- platform-design.md：更“现状固化 + gap analysis”，明确 #49~#52 已落地，并点出未对齐之处（业务侧未全面使用 withTenantTx；auth 未完全 JWT claims 化；migrations runner 主要在 apps/server/scripts）。
- 结论：两份核心方向一致，但 platform-design.md 更接近当前 repo 的 canonical；origin 文档可作为背景材料。

## 已落地能力（代码证据）
### schema-per-tenant & withTenantTx
- packages/platform-db/src/index.ts
  - AsyncLocalStorage 保存 tenant tx context
  - tx 内 `SET LOCAL search_path = "<schema>", public`
  - dev guard：assertInTenantTx（非 production）
- 业务侧已出现部分采用（证明可落地）：
  - Inventory store：PrismaInventoryConsistencyStore 已用 PlatformDbService.withTenantTx（Serializable）
  - Trading purchase inbound write：已用 PlatformDbService.withTenantTx，并对 P2002/P2034 返回 409，明确提示用户重试（不做自动重试）

### tenant context（ALS）
- packages/platform-tenant/src/tenant-context.ts + tenant-context.middleware.ts
- tenant-resolver.ts：优先 authTenantId；dev 可 fallback header；并做 tenant mismatch 校验（非 platform_admin）。

### RBAC/Policy
- packages/platform-policy：Action/Resource 校验、permission code 规则、mergeObligations（data 暂占位）。
- packages/platform-iam：createAuthorizer（依赖 GrantedPermissionsStore，返回 allow/deny + obligations）。

### migrations & tenant init
- apps/server/scripts/tenant-migrations.ts：支持 tenant-init / migrate-all-tenants
- apps/server/scripts/tenant-init.ts：旧脚本，行为弱且有 console.log，platform-design.md 已提示容易误用。

## 未落地/差距（对照 platform-design.md 与 origin 文档）
1) 业务模块强制 withTenantTx：大量模块仍直接使用 PrismaService（search_path 隔离能力尚未“全局生效”）。
   - ✅ 已推进（masterdata controller）：将直接 PrismaService 访问的 controllers 迁移到 PlatformDbService.withTenantTx：
     - [apps/server/src/modules/masterdata/controllers/uom.controller.ts](apps/server/src/modules/masterdata/controllers/uom.controller.ts)
     - [apps/server/src/modules/masterdata/controllers/tax-code.controller.ts](apps/server/src/modules/masterdata/controllers/tax-code.controller.ts)
     - [apps/server/src/modules/masterdata/controllers/warehouse-bin.controller.ts](apps/server/src/modules/masterdata/controllers/warehouse-bin.controller.ts)
   - ✅ 已推进（masterdata repository）：将 masterdata 的 Prisma*Repository 从注入 PrismaService 改为注入 PlatformDbService，并把所有 DB 访问包裹到 withTenantTx 内：
     - [apps/server/src/modules/masterdata/infrastructure/prisma-warehouse.repository.ts](apps/server/src/modules/masterdata/infrastructure/prisma-warehouse.repository.ts)
     - [apps/server/src/modules/masterdata/infrastructure/prisma-sku.repository.ts](apps/server/src/modules/masterdata/infrastructure/prisma-sku.repository.ts)
     - [apps/server/src/modules/masterdata/infrastructure/prisma-customer.repository.ts](apps/server/src/modules/masterdata/infrastructure/prisma-customer.repository.ts)
     - [apps/server/src/modules/masterdata/infrastructure/prisma-supplier.repository.ts](apps/server/src/modules/masterdata/infrastructure/prisma-supplier.repository.ts)
   - ✅ 最小单测已补齐（repo 层验证 withTenantTx 被调用）：
     - [apps/server/src/modules/masterdata/infrastructure/prisma-warehouse.repository.spec.ts](apps/server/src/modules/masterdata/infrastructure/prisma-warehouse.repository.spec.ts)
     - [apps/server/src/modules/masterdata/infrastructure/prisma-sku.repository.spec.ts](apps/server/src/modules/masterdata/infrastructure/prisma-sku.repository.spec.ts)
     - [apps/server/src/modules/masterdata/infrastructure/prisma-customer.repository.spec.ts](apps/server/src/modules/masterdata/infrastructure/prisma-customer.repository.spec.ts)
     - [apps/server/src/modules/masterdata/infrastructure/prisma-supplier.repository.spec.ts](apps/server/src/modules/masterdata/infrastructure/prisma-supplier.repository.spec.ts)
   - 说明：masterdata 其余 controller（warehouse/sku/item/customer/supplier）原本已走 service/repository；本次补齐 repository 层 withTenantTx 后，masterdata 主链路基本不再绕过 tenant tx。
2) Auth 目标态：当前 server 仍存在 x-auth-context(HMAC) + dev bypass；JWT HS256 校验已引入但 claims/issuer/aud 等仍是最小实现。
3) obligations 端到端：Policy 支持 obligations 结构，但 data/field/button/workflow 未在真实资源上落地。
4) migrations runner 抽包：目前在 apps/server/scripts，未来可抽 packages/platform-migrations（非必须，可后置）。

## 最近实现/改动（本会话）
- server IAM：新增 AUTH_MODE (hmac/jwt/both) + JWT HS256 校验 + both 模式优先级修正。
- purchase inbound create：Serializable tx；并发冲突返回 409 提示重试。
- obligations 端到端（Inventory）：
  - packages/platform-iam 的 authorizer 对 `erp:inventory:read` 支持 warehouse scoped permissions（`erp:inventory:read:warehouse=<id>`），并下推 `obligations.data.kind=prisma_where`。
  - server 侧 [inventory.controller.ts](apps/server/src/modules/inventory/controllers/inventory.controller.ts) **fail-closed** 消费 `authzContextStorage` 中的 obligations，把 prisma where 作为查询过滤条件下推到 store。

## 决策记录：scope 输入格式
- scope（warehouseId/docType 等）未来可能配置化：**先不做字符集强约束**。
- 当前实现层面仅假设 permission code 以 `:` 分隔，因此 scope 段只要求：trim 后非空且不含 `:`。
- 如果未来 scope 可能包含 `:`，需要引入编码（base64url/percent-encode）或更换分隔符（需再议）。

## 注意：错误响应结构一致性
- ApiExceptionFilter 期望 HttpException 的 response 里包含 {category, code, message} 才能稳定生成 shared ApiErrorPayload。
- 当前 auth-context.middleware / tenant-context.middleware 直接 res.json 的 error 体缺 category（需后续统一）。
