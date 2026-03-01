# ADR-002: 多租户隔离策略（应用层 + 数据库层/RLS 双防线）

## Title
多租户隔离策略（应用层强约束 + PostgreSQL RLS 双防线）

## Status
Proposed（建议采纳并进入 MVP 实施）

## Date
2026-03-01

## Context
MiniERP 已明确采用单数据库 + `tenant_id` 隔离模式（见 `designs/product/miniERP-PRD-V1.md` 与 `designs/architecture/miniERP-TDD-技术方案书-v1.md`）。
ADR-001 也将“多租户强约束”作为核心架构前提，并在 Open Questions 中提出是否引入 RLS 作为第二道防线（见 `designs/adr/ADR-001-miniERP-v1-architecture.md`）。

现状风险：
1. 仅依赖应用层过滤时，若某查询漏加 `tenant_id`，会发生高危数据越权。
2. GraphQL/REST 并行时，隔离逻辑若分散在 resolver/controller，容易出现实现漂移。
3. 后续开放 API（OAuth2 + Scope）后，第三方访问放大了隔离缺陷风险。

因此需要形成可工程化、可验证、可审计的“双防线”隔离方案。

## Decision
采用“应用层强制租户上下文 + 数据库层 RLS 强制校验”的双防线隔离策略，并统一到基础设施层，不允许业务模块自行决定隔离方式。

### 决策清单表

| 决策项 | 方案 | 结论 | 推荐级别 |
|---|---|---|---|
| 请求租户识别 | 从 Access Token 解析 `tenant_id`，禁止来自 query/body 的 tenant 覆盖 | 采纳 | 强制 |
| 应用层隔离 | Repository/Query Builder 自动注入 `tenant_id` 条件，业务代码不手写拼接 | 采纳 | 强制 |
| 数据库隔离 | PostgreSQL RLS + `current_setting('app.current_tenant_id')` | 采纳 | 强制 |
| 数据模型约束 | 业务核心表 `tenant_id NOT NULL` + 索引/唯一约束包含 tenant 维度 | 采纳 | 强制 |
| 高权限绕过 | 生产应用账号禁止 `BYPASSRLS`；仅 break-glass 账号离线使用 | 采纳 | 强制 |
| 审计 | 跨租户访问拦截与策略命中记录入审计日志 | 采纳 | 强制 |

### 关键设计点

1. **应用层第一道防线**
   - 在 NestJS 中间件/Guard 中解析并注入 `TenantContext`（`request.tenantId`）。
   - Repository 层统一封装 `withTenant(tenantId)`，禁止裸查询。
   - GraphQL context 与 REST request 使用同一 TenantContext Provider。
   - 对写操作校验：`resource.tenant_id` 必须等于 `request.tenantId`。

2. **数据库层第二道防线（RLS）**
   - 对所有 tenant-owned 表启用 `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`。
   - 每次请求在事务内执行 `SET LOCAL app.current_tenant_id = '...'`。
   - RLS Policy 统一模板：`tenant_id = current_setting('app.current_tenant_id', true)::uuid`。
   - 未设置 `app.current_tenant_id` 时，策略默认拒绝访问（fail closed）。

3. **Schema 与索引规范**
   - 所有核心实体强制 `tenant_id UUID NOT NULL`。
   - 业务唯一键采用复合唯一：如 `(tenant_id, sku_code)`、`(tenant_id, document_no)`。
   - 常用查询索引以 `tenant_id` 为前缀（减少跨租户扫描）。

4. **鉴权与租户绑定**
   - OAuth2 Client 与 User Token 均绑定 tenant。
   - Scope 只控制“能做什么”，tenant 只控制“能看谁的数据”，两者不可互相替代。

### 参考实现片段（可直接落地）

目标文件建议：
- `apps/server/src/common/tenant/tenant-context.middleware.ts`
- `apps/server/src/common/database/prisma-tenant.extension.ts`
- `apps/server/prisma/migrations/*/migration.sql`

```sql
-- RLS 策略模板（示例）
ALTER TABLE sku ENABLE ROW LEVEL SECURITY;

CREATE POLICY sku_tenant_isolation ON sku
USING (
  tenant_id = current_setting('app.current_tenant_id', true)::uuid
)
WITH CHECK (
  tenant_id = current_setting('app.current_tenant_id', true)::uuid
);
```

```ts
// Prisma 请求作用域注入（示意）
await prisma.$transaction(async (tx) => {
  await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;
  return runBusinessQuery(tx);
});
```

## Alternatives

### 替代方案对比表

| 方案 | 描述 | 优点 | 缺点 | 结论 |
|---|---|---|---|---|
| A. 仅应用层隔离 | 代码中统一加 `tenant_id` where 条件 | 实现快、学习成本低 | 漏条件即越权；难以强制；审计困难 | 不推荐 |
| B. 仅数据库 RLS | 全部依赖 RLS，不做应用层封装 | 数据库强约束，安全性高 | 业务代码可读性差；错误定位困难；上下文注入遗漏会全失败 | 不推荐（单独使用） |
| C. 双防线（应用层 + RLS） | 应用层保证一致性，RLS 做兜底 | 安全冗余高；可维护性与防御能力平衡 | 实施复杂度更高；需要规范化治理 | 推荐 |

### 明确推荐与不推荐
- **推荐**：方案 C（应用层 + RLS 双防线）。
- **不推荐**：方案 A（仅应用层）与方案 B（仅 RLS）。

## Consequences

### Positive
1. 显著降低“漏加 tenant 条件”导致的数据泄露风险。
2. GraphQL/REST 共享同一隔离内核，减少重复实现和策略漂移。
3. 审计与合规能力增强，满足后续 SaaS 化和开放 API 需要。

### Negative
1. 实现复杂度增加（中间件、ORM 扩展、迁移脚本、测试基线）。
2. 开发调试需要理解 RLS 行为，初期学习成本上升。
3. 报表/运维场景需额外处理跨租户合法访问路径（break-glass 流程）。

## Implementation Plan

### Phase 1（MVP 前）
1. 梳理 tenant-owned 表清单并补齐 `tenant_id NOT NULL`。
2. 完成 TenantContext 中间件、Guard、GraphQL context 统一注入。
3. Repository 层加 `withTenant` 强制接口，禁止裸 Prisma 客户端外泄。

### Phase 2（MVP）
1. 为核心表启用 RLS（SKU、PO、GRN、SO、OUT、inventory_ledger、quotation、attachment、audit_log）。
2. 上线事务级 `set_config('app.current_tenant_id', ...)`。
3. 建立跨租户攻击用例与自动化测试基线。

### Phase 3（Beta）
1. 扩展到全部 tenant-owned 表。
2. 接入审计告警：越权尝试次数、RLS 拒绝计数。
3. 完成 break-glass 运维流程（审批、时效、全审计）。

## Validation

1. **功能验证**
   - 同一资源 ID 在不同 tenant 下访问必须 100% 拒绝。
   - Token tenant 与资源 tenant 不一致时返回 403。

2. **安全验证**
   - 构造“漏加 tenant where”的回归测试，确认 RLS 可拦截。
   - 检查生产数据库角色无 `BYPASSRLS`。

3. **性能验证**
   - 关键查询 P95 不因 RLS 引入超过 15% 回归。
   - 复合索引命中率满足预期（`tenant_id` 前缀）。

4. **审计验证**
   - 越权请求日志包含 `request_id`、`tenant_id`、`actor_id`、`resource_type`、`resource_id`。

## Risks
1. **RLS 漏配风险**：某表未启用策略。
   - 缓解：迁移脚本中加入“未启用 RLS 检查”并阻断发布。
2. **上下文注入缺失风险**：`set_config` 未执行。
   - 缓解：数据库访问统一走封装；健康检查包含 tenant 上下文断言。
3. **性能风险**：策略 + 索引不当导致慢查询。
   - 缓解：建立 tenant 前缀索引与 Explain 基线。

## Open Questions
1. 内部 BI 报表是否需要合法跨租户汇总视图？若需要，采用物化视图还是离线数仓。
2. Break-glass 账号是否引入双人审批和 JIT（Just-In-Time）授权。
3. 多租户是否需要分层隔离（未来高价值租户升级到独立库）并保持接口兼容。