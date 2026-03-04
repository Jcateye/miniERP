# ADR-006: 后端最小联调闭环优先策略（Documents + Evidence + Inventory）

## Title
后端最小联调闭环优先策略（Documents + Evidence + Inventory）

## Status
Proposed

## Date
2026-03-04

## Context
当前前端页面与 BFF 路由已基本成型（尤其是 documents/evidence 链路），但后端公开 HTTP 业务接口不足，导致：

- 页面可访问，但真实业务联调依赖 fixture fallback。
- Swagger 在开发环境可访问，但可联调的业务端点不足。
- 核心领域能力（状态迁移、证据绑定、库存过账）已在服务层存在，却未形成完整 API 闭环。

已确认的现状：

1. 前端/BFF 已依赖以下路径：
   - `GET /api/bff/documents`
   - `GET /api/bff/documents/:docType/:id`
   - `POST /api/bff/documents/:docType/:id/:action`
   - `GET/POST /api/bff/evidence/links`
   - `POST /api/bff/evidence/upload-intents`
2. 后端可复用能力已存在：
   - 文档状态机：`apps/server/src/modules/core-document/domain/status-transition.ts`
   - 证据绑定：`apps/server/src/evidence/application/evidence-binding.service.ts`
   - 库存过账与幂等：`apps/server/src/modules/inventory/application/inventory-posting.service.ts`
   - 审计能力：`apps/server/src/audit/application/audit.service.ts`
3. 租户与鉴权约束已生效（中间件 + Guard + 全局错误/响应封装）。

目标：先建立“可真实联调”的最小后端能力闭环，再扩展其余实体 CRUD，避免继续以 fixture 掩盖缺口。

## Decision

### 核心决策
采用“**最小闭环优先**”实施策略，按 P0/P1/P2 分阶段推进：

- **P0（必须先做）**：Documents（List/Detail/Action）+ Evidence（Links/UploadIntent）+ Inventory（与动作联动）
- **P1（紧随其后）**：Shared Contract 对齐（Web/BFF/Server 类型统一）
- **P2（后续扩展）**：SKU/Stocktake/Quotation/Settings 等实体 CRUD 全量补齐

### 决策清单

| 决策项 | 方案 | 结论 | 级别 |
|---|---|---|---|
| 实施顺序 | 先全量 CRUD 再联调 vs 先最小联调闭环 | 先最小联调闭环 | 强制 |
| Documents 路由 | 先打通 `list/detail/action` | 采纳 | 强制 |
| 状态规则来源 | 新写状态规则 vs 复用 `status-transition.ts` | 复用现有规则 | 强制 |
| Evidence 路由 | 先读写主路径，上传先协议可联调 | 采纳 | 强制 |
| Inventory 联动 | 文档动作后再补库存 vs 同步接入库存过账 | 同步接入关键动作 | 强制 |
| 幂等策略 | 可选幂等 vs 强制 `Idempotency-Key` | 强制幂等 | 强制 |
| Fixture 策略 | 持续默认 fallback vs 联调阶段显式识别并收敛 | 联调阶段收敛 fallback | 强制 |
| Contract 管理 | 三端各自维护类型 vs shared 统一 | shared 统一 | 推荐 |

## Alternatives

| 方案 | 描述 | 优点 | 缺点 | 结论 |
|---|---|---|---|---|
| A. 一次性补全所有实体 CRUD | 全量并行开发 | 完整度高 | 工期长、风险高、难以快速联调验证 | 不推荐 |
| B. 仅维持 BFF fallback | 前端体验稳定 | 短期改动少 | 后端缺口被掩盖，真实联调不可验证 | 不推荐 |
| C. 最小闭环优先（本 ADR） | 先打通 documents/evidence/inventory 主链路 | 见效快、可验证、可增量扩展 | 需要严格范围控制 | 推荐 |

## Consequences

### Positive
- 最短路径恢复真实联调能力。
- 最大化复用既有服务，减少重复开发。
- 将“页面可见”转化为“链路可验”，降低后续返工成本。
- 为后续实体 CRUD 扩展提供稳定骨架。

### Negative
- 首阶段能力并不覆盖全部实体 CRUD。
- 需要在联调期间同时管理“真实接口 + fallback”边界。
- shared contract 在短期内会有一次集中收敛成本。

## Entity-Page-Value Mapping

### P0（最小联调闭环）

| 优先级 | 业务实体 | 对应页面（Web） | 后端能力 | 业务价值 |
|---|---|---|---|---|
| P0 | Document Header（PO/SO/GRN/OUT） | `/purchasing/po`, `/sales/so`, `/purchasing/grn`, `/sales/out` 列表与详情 | `GET /api/documents`, `GET /api/documents/:docType/:id`, `POST /api/documents/:docType/:id/:action` | 让核心单据流从“可看”变“可操作”，停止依赖 fixture 假联调 |
| P0 | Document Line | 同上详情页行项目区域 | 明细读取、动作前行级校验 | 保证数量/金额/行状态可核对，为库存与证据联动提供基础 |
| P0 | Evidence Link（document/line） | 详情页证据面板、行级证据抽屉 | `GET /api/evidence/links`, `POST /api/evidence/links` | 支撑“有据可查”的审核闭环，降低争议处理成本 |
| P0 | Evidence Upload Intent | 证据上传入口 | `POST /api/evidence/upload-intents`（P0 先实现联调协议） | 为后续对象存储接入保留稳定协议，先打通上传链路 |
| P0 | Inventory Ledger（过账流水） | 由 GRN/OUT 动作驱动（页面可先不直接暴露） | `post/reverse` + 幂等重放 | 防止重复记账与库存错账，保障履约正确性 |

### P1（稳定联调与契约收敛）

| 优先级 | 业务实体 | 对应页面（Web） | 后端能力 | 业务价值 |
|---|---|---|---|---|
| P1 | Shared Contract DTO（Documents/Evidence/Inventory） | Web hooks + BFF route + Server DTO 全链路 | shared 统一 DTO/枚举/错误码 | 降低三端类型漂移和联调沟通成本 |
| P1 | Audit Record（动作审计） | 运维排障视图（可后置） | action 审计落库与查询 | 具备“谁在何时做了什么”的可追溯能力 |

### P2（扩展 CRUD）

| 优先级 | 业务实体 | 对应页面（Web） | 后端能力 | 业务价值 |
|---|---|---|---|---|
| P2 | SKU / Product Master | 商品主数据页 | 完整 CRUD | 降低单据录入错误，提高主数据复用 |
| P2 | Warehouse / Location | 仓库设置页 | 完整 CRUD | 支撑多仓协同与库存归属准确性 |
| P2 | Stocktake | `/inventory/stocktake` | 新建/明细/过账 | 缩短账实差异发现与修复周期 |
| P2 | Quotation | 销售报价页 | 完整 CRUD + 转单 | 缩短商机到订单的转化链路 |
| P2 | Supplier / Customer Master | 采购/销售基础资料页 | 完整 CRUD | 降低运营摩擦并提升数据质量 |

## Delivery Gates & KPIs

### 联调门禁（必须通过）
1. Staging 环境 `fallback` 命中率必须为 0（禁止依赖 fixture）。
2. P0 六个核心接口（documents/evidence）全部通过集成测试与联调脚本。
3. 四条主页面链路（PO/SO/GRN/OUT 的 list/detail/action）端到端可操作并可复现。
4. `Idempotency-Key` 缺失时 action 请求返回 400；同 key 重放不重复过账。

### 业务价值指标（用于阶段验收）
- 联调真实性：`x-bff-fallback-hit=1` 请求在 staging 为 0。
- 闭环效率：四条主链路联调成功率达到阶段目标（建议 >= 99%）。
- 库存正确性：幂等重放场景重复记账次数为 0。
- 证据完备性：关键单据具备 document 或 line 级证据覆盖（按业务定义目标值）。

## Implementation Plan

### Phase 1（P0）Documents 最小闭环
1. 新增 documents 模块并注册到 `app.module.ts`。
2. 暴露：
   - `GET /api/documents?docType=...`
   - `GET /api/documents/:docType/:id`
   - `POST /api/documents/:docType/:id/:action`
3. 动作规则复用 `status-transition.ts`，不在 controller 重写状态机。
4. action 全量写审计。

### Phase 2（P0）Evidence 读写链路
1. 暴露：
   - `GET /api/evidence/links`
   - `POST /api/evidence/links`
   - `POST /api/evidence/upload-intents`（先实现联调协议版本）
2. 复用 `EvidenceBindingService` 执行业务校验与租户隔离。

### Phase 3（P0）Documents 动作接 Inventory
1. 在关键动作接入库存过账：
   - `GRN post -> 入库`
   - `OUT post -> 出库`
2. 强制 `Idempotency-Key` 贯穿传递。
3. 对重复请求返回幂等结果，避免重复记账。

### Phase 4（P1）Shared Contract 对齐
1. 在 `packages/shared` 收敛 documents/evidence/inventory DTO 与枚举。
2. Web hooks、BFF route、Server DTO 统一引用 shared。

### Phase 5（P2）实体 CRUD 扩展
按页面缺口优先级补齐：SKU、Stocktake、Quotation、Settings Master Data。

## Validation

### API 验证
- Documents：
  - list/detail 返回结构满足 BFF 预期。
  - 非法状态迁移返回 `VALIDATION_STATUS_TRANSITION_INVALID`（409）。
- Evidence：
  - links 查询支持 document/line 维度。
  - 跨租户绑定被拒绝。
- Inventory：
  - GRN/OUT 动作后可观察库存变化。
  - 同一幂等键重放不重复记账。

### 前端联调验证
- 页面路径：`/purchasing/po`, `/purchasing/grn`, `/sales/so`, `/sales/out` 的 list/detail/action 可真实联调。
- 证据面板与行级证据抽屉可读取真实数据。
- 在联调阶段明确区分是否发生 fallback。

### 测试验证
- server 单测：状态迁移、租户隔离、幂等与库存不足分支。
- BFF 路由测试：上游透传成功/失败与 fallback 约束分支。

## Risks

| 风险 | 说明 | 缓解措施 |
|---|---|---|
| 租户隔离风险 | 查询或写入遗漏 tenant 约束 | 所有 service/repo 显式 tenantId 入参 + 跨租户测试 |
| 幂等缺失风险 | 重复请求导致重复过账 | 强制 `Idempotency-Key` + 复用库存幂等校验 |
| fallback 掩盖缺口 | 看似可用但未命中真实后端 | 联调阶段显式标识 fallback 并限制使用 |
| 状态语义漂移 | 前端动作与后端状态机不一致 | 复用统一状态机 + shared 枚举收敛 |

## Open Questions
1. `upload-intents` 在 P0 阶段采用何种最小返回协议（字段标准）以兼容后续对象存储实现？
2. Documents create/update/delete 在 P1 还是 P2 优先补齐（当前先保 action 闭环）？
3. 是否将“联调环境禁 fallback”纳入 CI 必过检查？
4. inventory store 从 in-memory 迁移持久化的目标阶段定义（P1 或 P2）？

## Related Files
- `apps/server/src/app.module.ts`
- `apps/server/src/modules/core-document/domain/status-transition.ts`
- `apps/server/src/evidence/application/evidence-binding.service.ts`
- `apps/server/src/modules/inventory/application/inventory-posting.service.ts`
- `apps/server/src/audit/application/audit.service.ts`
- `apps/web/src/app/api/bff/documents/route.ts`
- `apps/web/src/app/api/bff/documents/[docType]/[id]/[action]/route.ts`
- `apps/web/src/app/api/bff/evidence/links/route.ts`
- `apps/web/src/app/api/bff/evidence/upload-intents/route.ts`
- `apps/web/src/lib/bff/server-fixtures.ts`
- `packages/shared/src/types/*`
