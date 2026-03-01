# MiniERP 架构 ADR 总览索引（ADR-001 ~ ADR-005）

## 1. 文档目的
本索引用于汇总 MiniERP 当前已形成的核心架构决策记录（ADR），作为后续研发实施、评审和验收的统一入口。

适用范围：
- 后端（NestJS、多租户、库存一致性、证据系统）
- 前端（T1/T2/T3/T4 模板化体系、状态治理）
- 平台能力（鉴权、可观测、测试、运维）

---

## 2. ADR 清单

| ADR | 标题 | 关注域 | 状态 | 优先级 |
|---|---|---|---|---|
| [ADR-001](./ADR-001-miniERP-v1-architecture.md) | MiniERP V1 架构选型与阶段化落地 | 总体架构基线 | Proposed | P0 |
| [ADR-002](./ADR-002-tenant-isolation-dual-defense.md) | 多租户隔离策略（应用层 + RLS 双防线） | 安全与数据隔离 | Proposed | P0 |
| [ADR-003](./ADR-003-evidence-storage-pipeline.md) | 证据系统存储与处理流水线 | 附件证据与审计 | Proposed | P1 |
| [ADR-004](./ADR-004-inventory-consistency-and-idempotency.md) | 库存一致性与过账幂等策略 | 核心交易一致性 | Proposed | P0 |
| [ADR-005](./ADR-005-frontend-template-governance.md) | 前端模板化实现规范 | 前端工程治理 | Proposed | P1 |

---

## 3. 决策全景（一页看懂）

| 维度 | 统一决策 | 主要来源 ADR |
|---|---|---|
| 总体形态 | 模块化单体优先，分阶段演进 | ADR-001 |
| API 策略 | REST（命令）+ GraphQL（查询）双轨 | ADR-001 |
| 多租户隔离 | 应用层强约束 + 数据库 RLS 双防线 | ADR-002 |
| 库存一致性 | ledger 事实源 + 幂等 + 锁 + 原子事务 + 反向补偿 | ADR-004 |
| 证据系统 | 预签名直传 + 异步处理 + 全链路审计 + 生命周期保留 | ADR-003 |
| 前端架构 | 模板壳 + VM Hook + Query/RHF/URL 分层状态 | ADR-005 |
| 安全治理 | OAuth2 + Scope + tenant 绑定 + 审计留痕 | ADR-001/002/003 |
| 测试与验证 | Unit + Integration + E2E（80%+ 覆盖） | ADR-001/004/005 |

---

## 4. ADR 依赖关系与实施顺序

```text
ADR-001（总体基线）
  ├─ ADR-002（多租户隔离）
  ├─ ADR-004（库存一致性与幂等）
  ├─ ADR-003（证据系统流水线）
  └─ ADR-005（前端模板治理）
```

建议实施顺序：
1. **P0 先行**：ADR-001 -> ADR-002 + ADR-004
2. **P1 跟进**：ADR-003 + ADR-005
3. **并行推进**：ADR-003 与 ADR-005 可并行，但都应依赖 ADR-001 统一边界

---

## 5. 阶段映射（MVP / Beta / GA）

| 阶段 | 必须落地 ADR | 核心交付物 |
|---|---|---|
| MVP | ADR-001, ADR-002, ADR-004 | 模块边界、租户隔离、库存过账幂等与一致性闭环 |
| Beta | ADR-003, ADR-005 | 证据系统全链路、前端模板化批量落地 |
| GA | ADR-001~005 全量治理 | 可观测、压测、审计与运维闭环 |

---

## 6. 统一实施清单（Checklist）

## 6.1 架构与安全
- [ ] 后端领域模块目录与边界冻结（auth/tenant/sku/purchase/sales/inventory/quotation/evidence/audit）
- [ ] 所有核心表补齐 `tenant_id NOT NULL`
- [ ] RLS 策略覆盖 tenant-owned 表
- [ ] 生产应用账号确认无 `BYPASSRLS`

## 6.2 交易一致性
- [ ] 过账接口强制 `Idempotency-Key`
- [ ] 幂等记录表唯一约束生效
- [ ] SKU 并发场景锁顺序与死锁重试策略落地
- [ ] 冲销（反向流水）机制可用

## 6.3 证据系统
- [ ] 上传会话 + 预签名直传 + 上传确认闭环
- [ ] 异步校验流水线（格式/扫描/缩略图/审计）
- [ ] 单据级/行级绑定模型落地
- [ ] 过账后“不可删除，仅追加”规则生效

## 6.4 前端模板治理
- [ ] T1/T2/T3/T4 模板壳组件与 contracts 定义完成
- [ ] 模板组件禁用直接 API 调用（lint/CR 门禁）
- [ ] 列表页 URL 状态化（筛选/排序/分页）
- [ ] T4 草稿双写（本地临时 + 服务端草稿）

## 6.5 验证与观测
- [ ] 租户越权测试 0 通过
- [ ] 负库存测试 0 通过
- [ ] 核心流程 E2E（PO->GRN、SO->OUT）通过
- [ ] Trace + Metrics + Audit Logs 可关联到 request_id

---

## 7. 评审与变更规则
1. 任何与 ADR 冲突的实现，必须先发起 ADR 修订（或新增 ADR）。
2. ADR 状态流转建议：`Proposed -> Accepted -> Superseded/Deprecated`。
3. 每次里程碑评审（MVP/Beta/GA）更新本索引中的：
   - ADR 状态
   - 阶段完成度
   - 未决问题清单

---

## 8. 未决问题总览（跨 ADR 汇总）
- 是否引入 PostgreSQL RLS 之外的分层隔离（高价值租户独立库）
- GraphQL 对内对外边界如何最终划分
- 证据系统是否启用 Legal Hold 与动态水印
- 幂等记录保留周期与清理策略
- 前端模板合规扫描是否纳入 CI 强制门禁

---

## 9. 关联设计文档
- [miniERP-系统设计与架构升级计划.md](../architecture/miniERP-系统设计与架构升级计划.md)
- [miniERP-PRD-V1.md](../product/miniERP-PRD-V1.md)
- [miniERP-TDD-技术方案书-v1.md](../architecture/miniERP-TDD-技术方案书-v1.md)
- [miniERP_design_summary.md](../ui/miniERP_design_summary.md)
- [miniERP_evidence_system.md](../ui/miniERP_evidence_system.md)

---

> 维护建议：本文件作为 ADR 索引入口，保持短小、结构化；详细技术细节留在各 ADR 正文中。