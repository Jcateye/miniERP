# ADR-001: MiniERP V1 架构选型与阶段化落地

## Title
MiniERP V1 架构选型与阶段化落地（前端模板化 + 后端模块化单体 + 混合 API）

## Status
Proposed（建议采纳，进入实施评审）

## Date
2026-03-01

## Context

### 1) 当前状态
- 设计资产完整，包含 PRD、技术方案、页面模板与流程定义，且模板化程度高（T1/T2/T3/T4 + Auth + 系统页 + 移动端）。
- 代码实现仍在早期：
  - 后端为 NestJS 骨架，业务模块未完整落地。
  - 前端工程落地少于设计覆盖（设计完成度高于实现度）。
- 已有明确业务约束：
  - 多租户隔离（`tenant_id`）
  - 库存流水驱动
  - 不允许负库存
  - 单据不可物理删除
  - 证据/附件留痕能力

### 2) 关键依据（文档）
- `designs/architecture/miniERP-系统设计与架构升级计划.md`
- `designs/architecture/miniERP-TDD-技术方案书-v1.md`
- `designs/ui/miniERP_design_summary.md`
- `designs/product/miniERP-PRD-V1.md`
- `designs/source/miniERP-pencil-opus4.6.pen`（仅通过设计总结间接对齐）

## Decision

### 总体决策
采用“**模块化单体优先**”的 V1 架构，保持与既有设计资产兼容，分阶段落地：
1. **前端**：React（Next.js）+ Tailwind + 模板化页面体系（T1/T2/T3/T4）+ 配置驱动装配。
2. **后端**：NestJS 按领域模块拆分，单体部署，内部清晰边界（为未来微服务拆分预留）。
3. **API 形态**：REST 处理命令（写操作），GraphQL 处理查询（读操作/开放查询）。
4. **数据与一致性**：PostgreSQL + Prisma；库存以 `inventory_ledger` 为唯一事实来源；幂等与限流由 Redis 支撑。
5. **多租户与安全**：全链路 `tenant_id` 上下文注入 + OAuth2 Scope + 审计日志。
6. **可观测与测试**：OpenTelemetry + Prometheus/Grafana + 结构化日志；Jest（单元/集成）+ Playwright（E2E）。

### 决策清单

| 领域 | 决策 | 结论 | 采纳级别 |
|---|---|---|---|
| 前端 | React + Tailwind + T1/T2/T3/T4 模板母版 + 配置装配 | 推荐 | 立即 |
| 后端 | NestJS 模块化单体（auth/tenant/sku/purchase/sales/inventory/quotation/evidence/audit） | 推荐 | 立即 |
| 数据 | PostgreSQL + Prisma + `inventory_ledger` 唯一库存事实 | 推荐 | 立即 |
| 鉴权 | OAuth2 + Scope + Token 绑定租户 + RBAC | 推荐 | MVP 即落地 |
| 可观测 | OTel Tracing + Metrics + 结构化日志 + 审计日志 | 推荐 | Beta 前落地 |
| 测试 | Jest 单元/集成 + Playwright E2E + 合同测试（REST/GraphQL） | 推荐 | MVP 起执行 |

## Alternatives

### 替代方案对比表

| 决策点 | 推荐方案 | 备选方案 | 推荐理由 | 不推荐理由 |
|---|---|---|---|---|
| API 架构 | REST（命令）+ GraphQL（查询） | 纯 REST / 纯 GraphQL | 与 PRD/TDD 一致；读写职责分离清晰 | 纯 REST 查询聚合成本高；纯 GraphQL 命令语义与事务边界不清晰 |
| 部署架构 | 模块化单体 | 立即微服务化 | 当前实现阶段低复杂度、交付快、团队负担小 | 微服务会增加治理成本（服务发现、分布式事务、观测） |
| 前端页面实现 | 模板母版 + 配置化 | 每页独立开发 | 已有模板覆盖，复用可提速 | 容易风格漂移、重复代码、维护成本高 |
| 多租户隔离 | 单库单 schema + 行级 tenant_id（应用层强约束） | 每租户独立库 | 初期运维简单、成本低、开发效率高 | 独立库早期运维负担重，自动化不足时易失控 |
| 数据一致性 | 库存流水为唯一事实 + 幂等键 + 锁 | 直接更新库存余额字段 | 可审计、可追溯、可回放 | 直接改余额难审计，易并发错误 |

## Consequences

### Positive
- 与现有设计资产高度对齐，最大化复用，避免推翻重来。
- 结构清晰，可在单体内先建立稳定边界，再按热点模块拆分服务。
- REST/GraphQL 双轨兼顾内部事务写入与外部查询开放。
- 模板化前端显著提高页面落地速度，减少 UI 与交互不一致。
- 多租户与审计约束前置，降低后期合规改造成本。

### Negative
- 双 API 形态引入一定学习与治理成本（网关、鉴权、限流策略要统一）。
- 模块化单体在高并发增长期会出现扩展边界压力。
- 需要强工程纪律（租户上下文、幂等、库存一致性）才能避免技术债。

## Implementation Plan

### Phase 0（架构基线）
- 冻结领域边界与统一命名（文档实体 -> 代码实体映射）。
- 输出 API Contract（REST 命令、GraphQL 查询 schema）。
- 定义租户上下文中间件、错误码规范、审计字段标准。

### Phase 1（MVP 主链路）
- 后端：SKU/PO/GRN/SO/OUT + `inventory_ledger` + 幂等过账。
- 前端：T1/T2/T3/T4 母版组件 + 关键页面（工作台、SKU、GRN、OUT）。
- 数据：Prisma schema + 迁移 + 基础索引（tenant_id, document_no, status, created_at）。

### Phase 2（Beta 能力增强）
- 证据系统全链路（单据级 + 行级）。
- OAuth2 + Scope + API Client 管理。
- GraphQL 查询能力增强（分页/复杂度限制/深度限制）。

### Phase 3（GA 稳定与运维）
- 可观测全覆盖（trace/metric/log correlation）。
- 压测与性能调优（热点查询缓存、读写分离预评估）。
- 备份恢复演练与故障回滚预案。

## Validation

### 架构与功能验证
1. 与 PRD/TDD 逐项核对约束一致性。
2. 页面路由与模板映射覆盖率 >= 95%，避免“非模板化孤岛页面”。

### 质量指标（建议门槛）
- 核心命令接口 P95 < 300ms（不含大文件上传）
- 查询接口 P95 < 200ms（常用列表）
- 租户越权用例 0 通过
- 库存负数用例 0 通过
- 自动化测试覆盖率 >= 80%
- 核心流程 E2E（PO->GRN、SO->OUT、报价版本）全部通过

## Risks

1. **租户隔离遗漏风险**：某些查询漏加 `tenant_id`。
   - 缓解：Repository 层强制注入租户条件 + 安全测试基线。
2. **库存并发一致性风险**：重复过账/并发扣减。
   - 缓解：幂等键 + 事务 + 分布式锁 + 乐观/悲观锁策略。
3. **双 API 治理复杂度风险**：REST 与 GraphQL 认证策略不一致。
   - 缓解：统一 API Gateway 与授权中间件。
4. **模板化落地偏差风险**：页面“特例化”导致复用失败。
   - 缓解：先定义母版插槽边界，禁止页面直接绕过母版。

## Open Questions

1. 多租户数据隔离是否需要在 PostgreSQL 层增加 RLS 作为第二道防线？
2. GraphQL 是否仅对外开放查询，内部前端是否也统一走 GraphQL 读取？
3. 证据系统（大文件）是否需要异步病毒扫描与内容审计流程？
4. 报价 PDF 生成是同步返回还是异步任务 + 回调通知？
5. 移动扫码页面后续是否需要离线模式（PWA/本地缓存）？

---

## 结论摘要

### 推荐
- 模块化单体 + 混合 API + 模板化前端 + 库存流水事实源 + 多租户强约束。

### 不推荐
1. 立即微服务化（当前阶段成本与复杂度过高）。
2. 前端逐页定制开发（违背模板复用策略，维护成本高）。
3. 库存余额直接改写模型（难审计、并发风险高，与 PRD 约束冲突）。
