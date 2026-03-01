# ADR-004: 库存一致性与过账幂等策略（锁、事务、补偿）

## Title
库存一致性与过账幂等策略（锁、事务、补偿）

## Status
Proposed（建议采纳并在 MVP 主链路强制执行）

## Date
2026-03-01

## Context
MiniERP 已明确以下硬约束：
1. 库存以 `inventory_ledger` 为事实来源。
2. 不允许负库存。
3. 单据不可物理删除，仅可作废/冲销。
4. 系统为多租户单库模式，所有库存操作需 `tenant_id` 隔离。

当前风险点：
- 重复点击“过账”或网络重试导致重复扣减/重复入库。
- 高并发下同一 SKU 并发出库导致超卖（负库存）。
- 过账后异步副作用（通知、外部同步）失败导致业务“看起来失败”但库存已变更。
- 取消/冲销场景缺少工程化补偿规范。

本 ADR 目标：形成可执行、可验证、可审计的一致性与幂等方案。

## Decision

### 核心决策
采用“**幂等键 + 双层锁 + 单事务原子过账 + 账务式补偿（反向流水）**”策略。

### 决策清单表格

| 决策项 | 方案 | 结论 | 级别 |
|---|---|---|---|
| 幂等入口 | 所有过账命令必须携带 `Idempotency-Key`（Header） | 采纳 | 强制 |
| 幂等落库 | `idempotency_records`（tenant + key 唯一）保存请求哈希与响应快照 | 采纳 | 强制 |
| 文档级并发控制 | Redis 分布式锁（短 TTL）防止同单据并发处理 | 采纳 | 推荐 |
| SKU级一致性控制 | PostgreSQL `FOR UPDATE` + `pg_advisory_xact_lock`（按 tenant+warehouse+sku 排序加锁） | 采纳 | 强制 |
| 事务边界 | 单次过账内：校验库存 -> 写 ledger -> 更新单据状态 -> 写 outbox，一次提交 | 采纳 | 强制 |
| 负库存防线 | 应用层预校验 + 数据库约束（`inventory_balance.on_hand >= 0`）双防线 | 采纳 | 强制 |
| 补偿策略 | 禁止物理回滚历史流水，采用“冲销单/反向流水”补偿 | 采纳 | 强制 |
| 外部副作用 | Outbox 异步投递，失败重试，不影响主事务提交 | 采纳 | 强制 |

### 过账执行规范（工程化）
1. **请求归一化与幂等检查**
   - 读取 `Idempotency-Key`。
   - 计算 `request_hash`（tenant + endpoint + payload canonical json）。
   - 命中已完成记录直接返回首次响应（HTTP 200/201 同首包语义）。
   - 命中同 key 不同 hash，返回 409。

2. **锁获取顺序（避免死锁）**
   - 先获取文档级 Redis 锁：`post:{tenant}:{docType}:{docId}`。
   - 事务内按 `(warehouse_id, sku_id)` 升序获取 advisory lock。
   - 再对对应 `inventory_balance` 行 `SELECT ... FOR UPDATE`。

3. **事务内原子步骤**
   - 校验单据状态必须是可过账态（如 `APPROVED` / `READY_TO_POST`）。
   - 校验每行库存可用量（出库类命令必须 `on_hand - qty >= 0`）。
   - 写 `inventory_ledger`（每行一条或多条，含来源单据行引用）。
   - 更新 `inventory_balance` 快照表（用于查询加速，不作为事实源）。
   - 更新单据状态为 `POSTED`，写 `posted_at`, `posted_by`。
   - 写 `outbox_events`（如 `inventory.posted`, `document.posted`）。
   - 提交事务。

4. **补偿机制**
   - 若过账已提交，后续发现业务错误，必须创建“冲销单”（REVERSAL）生成反向流水。
   - 冲销同样走幂等与锁流程，并链路关联 `reversal_of_ledger_id`。
   - 禁止直接删除或修改既有流水金额/数量。

### 推荐与不推荐
- **推荐**：幂等记录表 + 数据库行锁/建议锁 + 原子事务 + 反向流水补偿。
- **不推荐**：
  1) 仅靠前端防重复点击；
  2) 仅用 Redis 锁不做数据库锁；
  3) 失败后直接“改回余额字段”；
  4) 通过删除流水实现“撤销”。

### 目标文件（绝对路径）
- `/Users/haoqi/OnePersonCompany/miniERP/apps/server/src/modules/inventory/application/posting.service.ts`
- `/Users/haoqi/OnePersonCompany/miniERP/apps/server/src/modules/inventory/domain/inventory-ledger.repository.ts`
- `/Users/haoqi/OnePersonCompany/miniERP/apps/server/src/modules/inventory/domain/inventory-balance.repository.ts`
- `/Users/haoqi/OnePersonCompany/miniERP/apps/server/src/common/idempotency/idempotency.service.ts`
- `/Users/haoqi/OnePersonCompany/miniERP/apps/server/src/common/locking/distributed-lock.service.ts`
- `/Users/haoqi/OnePersonCompany/miniERP/apps/server/prisma/schema.prisma`
- `/Users/haoqi/OnePersonCompany/miniERP/apps/server/prisma/migrations/*/migration.sql`

```sql
-- 关键唯一约束（示意）
CREATE UNIQUE INDEX uq_idempotency_tenant_key
ON idempotency_records (tenant_id, idempotency_key);

-- 防重复流水（示意：来源单据行 + 动作 + 幂等键）
CREATE UNIQUE INDEX uq_ledger_posting_guard
ON inventory_ledger (tenant_id, source_type, source_id, source_line_id, action, idempotency_key);
```

## Alternatives

### 替代方案对比表格

| 方案 | 描述 | 优点 | 缺点 | 结论 |
|---|---|---|---|---|
| A. 仅应用层幂等（内存/缓存） | 不落库，服务实例内去重 | 实现快 | 重启失效、跨实例失效、审计弱 | 不推荐 |
| B. 仅 Redis 锁 | 过账前抢锁，无 DB 行锁 | 对同单据有效 | 无法防 SKU 级并发超卖；锁漂移风险 | 不推荐 |
| C. 串行队列单线程过账 | 所有过账进单队列 | 一致性简单 | 吞吐低、延迟高、单点瓶颈 | 不推荐（仅应急） |
| D. 幂等落库 + DB 锁 + 事务 + 反向补偿 | 本 ADR 方案 | 一致性强、可审计、可扩展 | 实现复杂度较高 | 推荐 |

## Consequences

### Positive
- 消除重复过账导致的库存污染。
- 在并发出库场景下保证不出现负库存。
- 形成“可追溯、可审计、可补偿”的库存账务体系。
- 支撑后续多仓扩展，只需扩展锁维度与索引。

### Negative
- 事务与锁增加实现复杂度和调试成本。
- 高冲突 SKU 在峰值期可能出现锁等待。
- 需要维护幂等表、outbox 表的清理与归档策略。

## Implementation Plan

### Phase 1（MVP）
1. 新增 `idempotency_records`、`outbox_events`、必要唯一索引。
2. 在 GRN/OUT/盘点过账 API 强制校验 `Idempotency-Key`。
3. 落地事务内库存校验 + ledger 写入 + balance 更新 + 状态变更。
4. 增加非负库存数据库约束与异常映射（409/422）。

### Phase 2（Beta）
1. 引入 advisory lock + 固定加锁顺序，处理多行并发死锁。
2. 接入 Redis 文档级锁，缩短重复请求竞争窗口。
3. 完成 outbox worker 重试、死信队列与告警。

### Phase 3（GA）
1. 落地冲销单标准流程与 UI。
2. 增加冲突热点监控（锁等待、重试次数、死锁率）。
3. 建立归档策略：`idempotency_records`/`outbox_events` 分区或 TTL 清理。

## Validation

### 功能与一致性验证
- 并发 100 次重复提交同一过账请求，ledger 仅生成 1 次。
- 不同 `Idempotency-Key` 并发出库同 SKU，不出现 `on_hand < 0`。
- 冲销后库存恢复符合账务预期，且保留完整审计链。

### 性能验证（建议门槛）
- 常规过账接口 P95 < 300ms（不含大文件处理）。
- 锁等待超时率 < 0.5%。
- 幂等命中返回 P95 < 80ms。

### 测试基线
- 单元测试：幂等哈希一致性、锁顺序排序、补偿计算。
- 集成测试：事务回滚、死锁重试、负库存拦截。
- E2E：PO->GRN 过账、SO->OUT 过账、盘点调整与冲销闭环。

## Risks

| 风险 | 说明 | 缓解措施 |
|---|---|---|
| 死锁风险 | 多 SKU 交叉加锁 | 统一排序加锁 + 短事务 + 死锁重试 |
| 锁泄漏风险 | 异常中断未释放 | 使用事务级 advisory lock + finally 释放 Redis 锁 |
| 幂等键滥用 | 客户端复用旧 key | key TTL + 请求哈希校验 + 409 返回 |
| outbox 积压 | 下游故障导致事件堆积 | 重试退避 + 死信队列 + 告警阈值 |
| 热点 SKU 冲突 | 高并发同 SKU 出库 | 限流 + 批处理窗口 + 读写路径拆分 |

## Open Questions
1. `idempotency_records` 保留周期是 7 天、30 天还是按业务可配置？
2. 锁等待超时时是立即失败还是自动重试（重试次数上限）？
3. 多仓上线后，锁粒度是否调整为 `(tenant, warehouse, sku, lot)`？
4. 冲销是否允许部分行冲销，还是必须整单冲销？
5. 对外开放 API 是否要求客户端签名，防止幂等键被重放攻击？
