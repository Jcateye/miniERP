# Progress Log：origin-dccb69fa 设计落地

## 2026-03-15
- 盘点：origin-dccb69fa-middle-platform-design.md 与 platform-design.md 核心方向一致，但后者更贴近当前落地事实。
- 已确认：platform-kernel / tenant / db / iam / policy 均已落地；migrations runner 在 apps/server/scripts。
- 已确认差距：业务模块未全面迁移到 withTenantTx；obligations 未端到端落地；auth 仍处过渡态。
- 参考资源选择：B 先做 `erp:inventory`（obligations 端到端），完成后立即做 A1：`erp:document`（workflow/button obligations 最小落地 + 后端兜底）。

### 本会话相关工程改动（已通过测试）
- IAM：AUTH_MODE + JWT HS256 + both 模式策略修正 + 单测。
- trading purchase inbound：Serializable create + 并发冲突 409 显式报错（P2002/P2034）。

### 验证
- `bun run --filter server build`：passed
- `bun run --filter server test`：passed

## 2026-03-16
- Phase1（业务侧强制 withTenantTx）开始推进：将 masterdata 中仍直接注入 PrismaService 的 3 个 controller 迁移为 PlatformDbService.withTenantTx 执行 DB 访问：
  - uom.controller
  - tax-code.controller
  - warehouse-bin.controller
- 同步更新对应单测：改为 mock PlatformDbService.withTenantTx（内部传入 mockTx），不再直接 mock PrismaService。
- Phase1（repository 层继续推进）：将 masterdata 的 Prisma*Repository 从注入 PrismaService 改为注入 PlatformDbService，并把所有 DB 访问包裹到 withTenantTx 内：
  - prisma-warehouse.repository
  - prisma-sku.repository
  - prisma-customer.repository
  - prisma-supplier.repository
- 补齐 repo 层最小单测：验证每个 repo 的方法都通过 withTenantTx 执行（mock withTenantTx + mockTx）。

- Phase2（obligations 端到端，先落 Inventory）：
  - Inventory 读接口（GET /inventory/balances、GET /inventory/ledger）已接入 [RequireAuthorize](apps/server/src/common/iam/authorize/require-authorize.decorator.ts) 并 **fail-closed** 消费 `obligations.data.kind=prisma_where` 作为查询 where。
  - Inventory 写接口（POST /inventory/inbound、POST /inventory/outbound）已接入 `RequireAuthorize(resource=erp:inventory, action=create)`，先保证写侧走统一授权链路（后续可扩展写侧 obligations）。

- Phase1 guard（codemap:update 门禁）修复：
  - 因为新增了 `PRISMA_SERVICE_TOKEN`（Symbol）注入点，DatabaseModule 与 DocumentsService 需要 direct import PrismaService。
  - 已将 `apps/server/src/database/database.module.ts` 与 `apps/server/src/modules/documents/services/documents.service.ts` 加入 allowlist，并在 DocumentsService 通过 token 注入，避免直接以 class token 绑定。

### 验证
- `bun run --filter server test -- src/modules/masterdata/controllers/uom.controller.spec.ts src/modules/masterdata/controllers/tax-code.controller.spec.ts src/modules/masterdata/controllers/warehouse-bin.controller.spec.ts`：passed
- `bun run --filter server test -- src/modules/masterdata/infrastructure/prisma-warehouse.repository.spec.ts src/modules/masterdata/infrastructure/prisma-sku.repository.spec.ts src/modules/masterdata/infrastructure/prisma-customer.repository.spec.ts src/modules/masterdata/infrastructure/prisma-supplier.repository.spec.ts`：passed
- `bun run --filter server test`：passed
- `bun run --filter server build`：passed
- `bun run --filter server codemap:update -- --yes`：passed
