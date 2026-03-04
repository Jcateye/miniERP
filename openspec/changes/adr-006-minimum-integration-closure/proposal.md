## Why

当前前端页面与 BFF 路由已具备 documents/evidence 主路径，但后端业务接口仍不完整，导致联调阶段大量依赖 fixture fallback，无法证明真实业务链路可用。需要基于 ADR-006 先打通 P0 最小闭环（Documents + Evidence + Inventory），再推进 P1 契约收敛与 P2 实体 CRUD 扩展，以降低返工与联调风险。

## What Changes

- 新增 P0 联调闭环能力：
  - Documents：`list/detail/action` 真实后端接口与状态迁移约束。
  - Evidence：`links` 读写与 `upload-intents` 联调协议。
  - Inventory：GRN/OUT 关键动作联动过账与幂等重放。
- 新增联调门禁：staging 禁止 fallback（命中率=0）、关键接口和主页面链路必须通过验收。
- 新增 P1 shared contract 收敛能力：Web/BFF/Server 统一 DTO/枚举/错误码语义。
- 新增 P2 扩展能力：按优先级补齐 SKU/Warehouse/Stocktake/Quotation/Supplier/Customer 等实体 CRUD。

## Capabilities

### New Capabilities
- `adr006-p0-integration-closure`: 定义 Documents + Evidence + Inventory 的最小真实联调闭环与验收门禁。
- `adr006-p1-contract-alignment`: 定义 shared contract 在 Web/BFF/Server 的统一收敛规则与一致性要求。
- `adr006-p2-entity-crud-expansion`: 定义闭环后实体 CRUD 扩展范围、顺序与质量底线。

### Modified Capabilities
- 无（本次为新增能力，不修改已有 capability 语义）。

## Impact

- Affected code:
  - `apps/server/src/modules/core-document/**`
  - `apps/server/src/evidence/**`
  - `apps/server/src/modules/inventory/**`
  - `apps/server/src/audit/**`
  - `apps/web/src/app/api/bff/documents/**`
  - `apps/web/src/app/api/bff/evidence/**`
  - `apps/web/src/lib/bff/server-fixtures.ts`
  - `packages/shared/src/types/**`
- Affected APIs:
  - `/api/documents*`
  - `/api/evidence*`
  - 相关 BFF `/api/bff/*` 透传与门禁行为
- Affected systems:
  - 联调流程、测试门禁（集成测试/E2E）、staging 发布验收策略
