## Why

当前 miniERP 已完成 PRD、架构与页面设计，但实现仍是 scaffold 阶段，团队若直接并行开发会被底层依赖（shared 契约、数据库模型、租户隔离、库存一致性）反复阻塞。现在需要用 OpenSpec 把实施路径按依赖层级自底向上拆分，形成“可并行、最小阻塞、可持续演进”的交付顺序。

## What Changes

- 建立一套按依赖层级推进的实施蓝图：先基础契约与数据层，再领域后端能力，最后前端页面装配与联调。
- 将后端能力拆分为核心链路与支撑能力两个并行流，减少上层对单点模块的等待。
- 明确前端按 T1/T2/T3/T4 模板体系推进，并把页面开发依赖前置到 SDK/BFF/契约冻结。
- 将证据系统固定为“单据级 + 行级”双层能力，避免后续页面与后端模型漂移。
- 固化里程碑与解锁条件（M1/M2/M3），以“前置依赖完成”而不是“模块名完成”作为推进标准。
- 输出一组可直接落到 OpenSpec 后续 artifacts 的能力边界、影响范围与验证入口。

## Capabilities

### New Capabilities
- `dependency-layered-delivery`: 定义依赖驱动的实施分层、解锁条件与并行推进规则。
- `shared-contract-governance`: 定义前后端共享契约（单据类型/状态、API 包络、金额语义）冻结与变更治理。
- `backend-module-boundaries`: 定义 NestJS 领域模块边界、分层规范、跨模块依赖方向与命令/查询职责。
- `database-logical-model`: 定义多租户逻辑数据模型、索引与唯一约束、状态机与审计字段基线。
- `inventory-posting-integrity`: 定义库存过账一致性、幂等、防负库存与补偿策略的执行要求。
- `evidence-dual-layer-workflow`: 定义证据系统双层模型（document/line）、上传处理链路与绑定约束。
- `frontend-template-composition`: 定义 T1-T4 模板化装配、页面数据分层（SDK/BFF/hooks）与联调依赖。

### Modified Capabilities
- 无（`openspec/specs/` 当前为空，本次为全新能力建立）。

## Impact

- 影响文档与流程：
  - `openspec/changes/dependency-layered-minierp-implementation/*`
  - 后续 `design.md`、`specs/*/spec.md`、`tasks.md` 将按依赖层级展开
- 影响代码域（后续实施阶段）：
  - `packages/shared/src/**`
  - `apps/server/src/modules/**`, `apps/server/src/common/**`, `apps/server/src/database/**`
  - `apps/web/src/app/**`, `apps/web/src/components/**`, `apps/web/src/lib/**`
- 影响 API 与数据：
  - REST 命令 + GraphQL 查询分层边界
  - 多租户隔离、库存一致性、证据双层模型、审计链路
- 影响协作方式：
  - 从“按模块并行”升级为“按依赖层并行”，降低上层等待与返工概率。