# miniERP 详细前后端模块与数据库设计（落地版）

## 1. 目的与范围

本文用于把已完成的 PRD、架构选型、页面设计进一步收敛为“可并行实施”的工程设计蓝图，重点覆盖：

1. 前后端模块拆分与职责边界
2. API 分组与读写分层
3. 数据库逻辑模型（实体、关系、索引、状态机）
4. 并行分工、里程碑、风险与验证

> 本文偏“落地执行”，默认遵守 ADR 与既有架构文档原则，不重复展开决策辩论。

---

## 2. 约束基线（实施必须遵守）

- 多租户隔离：所有核心实体 `tenant_id`，应用层 + 数据库层双防线
- 库存一致性：`inventory_ledger` 为事实源，不允许负库存
- 单据治理：单据不可物理删除，仅作废/冲销
- 证据系统：单据级 + 行级双层模型
- 单据编号：`DOC-{type}-{YYYYMMDD}-{seq}`
- 金额计算：应用层使用 `decimal.js` 语义，数据库使用 decimal
- 状态流转：必须显式、可审计、可追溯

---

## 3. 后端模块设计（NestJS）

目标目录：`apps/server/src/modules/`

### 3.1 模块清单与职责

| 模块 | 主要职责 | 关键输出 |
|---|---|---|
| `sku` | SKU 主数据、映射、替代关系、规格模板 | SKU 查询/维护接口、映射规则 |
| `purchase` | PO 生命周期（建单、确认、关闭、作废） | PO 命令与查询 |
| `inbound` | GRN 过账流程（草稿、差异、过账） | GRN 命令、差异校验 |
| `sales` | SO 生命周期（建单、确认、关闭、作废） | SO 命令与查询 |
| `outbound` | OUT 过账流程（拣货、校验、过账） | OUT 命令、库存校验 |
| `inventory` | 库存流水、余额快照、库存查询 | ledger 写入、余额计算、流水查询 |
| `stocktake` | 盘点流程（盘点、复核、调整过账） | 盘点命令、差异处理 |
| `quotation` | 报价与版本管理、导出、转 SO | 报价版本接口 |
| `evidence` | 上传会话、资产管理、单据/行级绑定、下载鉴权 | 证据全链路接口 |
| `iam` | 认证、授权、Scope、客户端凭证 | token/scope/RBAC |
| `tenant` | 租户上下文、租户配置与边界控制 | tenant context 注入 |
| `audit` | 操作审计、状态流转审计、安全审计 | 审计事件落库 |
| `platform` | 开放查询、访问日志、限流与复杂度治理 | GraphQL/OpenAPI 治理 |

### 3.2 模块分层规范（统一）

每个业务模块按如下结构组织：

- `controller/`：REST/GraphQL 入口（不含业务规则）
- `application/`：use case（command/query）
- `domain/`：领域规则、状态机、不可变约束
- `infrastructure/`：repository、外部适配（DB/队列/对象存储）

依赖方向固定：

`controller -> application -> domain + infrastructure`

约束：

- 跨模块调用只通过对方 `application` 暴露接口
- 禁止直接跨模块访问 repository
- 库存变更只能进入 `inventory` 模块

### 3.3 命令与查询分层

- 命令（REST）：`/api/v1/*`
  - 创建、编辑、确认、过账、作废、冲销、上传会话
- 查询（REST + GraphQL）：
  - 列表、详情、聚合、工作台统计、流水审计

建议命令命名：

- `CreatePurchaseOrder`
- `ConfirmPurchaseOrder`
- `PostGoodsReceipt`
- `CreateSalesOrder`
- `PostOutbound`
- `PostStocktakeAdjustment`

---

## 4. 前端模块设计（Next.js App Router）

目标目录：`apps/web/src/`

### 4.1 路由分区与模板映射

| 分区 | 对应模板 | 路由示例 |
|---|---|---|
| `(dashboard)` | T1 Overview | `/`, `/skus/overview`, `/purchasing/overview`, `/sales/overview` |
| `(workbench)` | T2 Workbench | `/skus`, `/purchasing/po`, `/purchasing/grn`, `/sales/so`, `/sales/out`, `/inventory`, `/stocktake` |
| `(detail)` | T3 Detail | `/skus/[id]`, `/purchasing/grn/[id]`, `/sales/out/[id]`, `/stocktake/[id]` |
| `(wizard)` | T4 Wizard | `/purchasing/grn/new`, `/sales/out/new`, `/stocktake/new`, `/skus/new` |

### 4.2 前端分层约束

- `components/templates/`：T1/T2/T3/T4 纯展示模板（不请求 API）
- `components/evidence/`：EvidencePanel、LineEvidenceDrawer
- `lib/sdk/`：按业务域分组 API Client（typed）
- `lib/bff/`：页面聚合读取（工作台统计、向导汇总）
- `hooks/`：筛选、分页、stepper、命令状态

状态归属：

- URL State：筛选/排序/分页
- Server State：TanStack Query（列表、详情、字典）
- Form State：RHF + Schema 校验
- UI State：弹窗、抽屉、hover 等临时状态

### 4.3 前后端契约对齐

- 前端 DTO 与枚举只从 `packages/shared` 引入
- 不允许页面私自扩展临时字段
- 证据接口遵循双层：
  - document scope
  - line scope + `line_ref`

---

## 5. API 能力清单（按业务域）

### 5.1 SKU
- 查询：列表、详情、映射列表、替代关系
- 命令：创建/更新 SKU、启用/停用、映射维护

### 5.2 采购 + 入库
- 查询：PO/GRN 列表与详情、差异对比
- 命令：PO 建单/确认/关闭，GRN 草稿/校验/过账/作废

### 5.3 销售 + 出库
- 查询：SO/OUT 列表与详情、可用库存
- 命令：SO 建单/确认，OUT 草稿/校验/过账/作废

### 5.4 库存 + 盘点
- 查询：库存余额、库存流水、补货建议、盘点差异
- 命令：盘点草稿、复核、调整过账、冲销

### 5.5 报价
- 查询：报价列表、版本列表、报价详情
- 命令：创建报价、生成版本、导出、转 SO

### 5.6 证据
- 命令：创建上传会话、上传完成确认、单据绑定、行绑定、解绑（受限）
- 查询：按单据查询、按行查询、证据统计
- 下载：带鉴权与审计

---

## 6. 数据库逻辑模型

### 6.1 实体分组

#### 租户与权限
- `tenant`
- `user`
- `role`
- `permission`
- `user_role`
- `api_client`
- `api_call_log`

#### 主数据
- `sku`
- `sku_mapping`
- `sku_substitution`
- `warehouse`（V1 单仓，保留多仓扩展）

#### 采购 / 入库
- `purchase_order`
- `purchase_order_line`
- `grn`
- `grn_line`

#### 销售 / 出库
- `sales_order`
- `sales_order_line`
- `outbound`
- `outbound_line`

#### 库存 / 盘点
- `inventory_ledger`（事实源）
- `inventory_balance`（快照读模型）
- `stocktake`
- `stocktake_line`

#### 报价
- `quotation`
- `quotation_version`
- `quotation_line`

#### 证据
- `evidence_asset`
- `evidence_link`

#### 审计与幂等
- `audit_log`
- `state_transition_log`
- `idempotency_record`
- `outbox_event`

### 6.2 关键字段规范（所有业务实体）

必备字段：

- 主键：`id`
- 租户：`tenant_id NOT NULL`
- 状态：`status`
- 审计：`created_at/by`, `updated_at/by`, `deleted_at/by`

金额与数量：

- 金额：`unit_price`, `tax_amount`, `total_amount`（decimal）
- 数量：`qty`, `received_qty`, `shipped_qty`, `diff_qty`（decimal）
- 预留：`currency_code`, `fx_rate`

### 6.3 关系与约束

- 订单头 `1-N` 订单行
- 单据 `1-N` 状态流转日志
- 证据资产与业务实体通过 `evidence_link` 解耦

复合唯一（必须 tenant 维度）：

- `(tenant_id, doc_no)`
- `(tenant_id, sku_code)`
- `(tenant_id, idempotency_key, action_type)`

热路径索引建议：

- `(tenant_id, status, doc_date)`
- `(tenant_id, sku_id, posted_at)` on `inventory_ledger`
- `(tenant_id, entity_type, entity_id, line_ref)` on `evidence_link`

### 6.4 状态机（V1 建议）

- PO：`draft -> confirmed -> closed | cancelled`
- GRN：`draft -> validating -> posted | cancelled`
- SO：`draft -> confirmed -> closed | cancelled`
- OUT：`draft -> picking -> posted | cancelled`
- Stocktake：`draft -> counting -> reviewed -> posted | cancelled`
- EvidenceAsset：`pending_upload -> uploaded -> validating -> active -> rejected | quarantined`

---

## 7. 并行分工方案（用于团队拆流）

### 7.1 Streams

- Stream A：`shared` 契约与状态机
- Stream B：数据库模型与迁移策略
- Stream C：后端核心模块（purchase/inbound/sales/outbound/inventory）
- Stream D：后端支撑模块（evidence/iam/tenant/audit/platform）
- Stream E：前端模板层与证据组件
- Stream F：页面装配联调与 E2E

### 7.2 依赖顺序

1. 先冻结 shared 契约与状态枚举
2. 冻结数据库逻辑模型与索引策略
3. 后端接口分组与模块边界冻结
4. 前端模板层与 SDK 并行推进
5. 页面联调与 E2E 收敛

---

## 8. 里程碑

### M1（基础对齐）
- shared 契约冻结
- ER + 索引冻结
- PO/GRN/SO/OUT + ledger 主链路接口定义

### M2（业务闭环）
- 证据双层闭环
- 租户权限 + 审计闭环
- GRN/OUT/Stocktake 页面联调

### M3（扩展能力）
- 报价版本化闭环
- outbox 事件化消费
- 多币种字段与报表扩展

---

## 9. 风险与缓解

| 风险 | 描述 | 缓解 |
|---|---|---|
| 一致性风险 | 过账与库存不一致 | 单事务 + ledger 事实源 + 回滚 |
| 幂等风险 | 重复提交重复过账 | 幂等表 + 状态前置校验 + 唯一约束 |
| 越权风险 | 跨租户读取/写入 | tenant context + repo tenant 过滤 + RLS |
| 证据风险 | 文件与业务记录脱节 | asset/link 双表 + 状态机 + 审计 |
| 性能风险 | 列表/流水查询慢 | tenant 复合索引 + 分页 + 聚合读模型 |

---

## 10. 验证与验收

### 10.1 设计评审清单
- 模块边界单向依赖是否成立
- 实体是否全量包含 tenant 与审计字段
- 状态机是否覆盖拒绝路径
- 证据双层是否可端到端贯通

### 10.2 契约验证
- 错误码、分页、权限语义统一
- 前后端类型完全对齐 shared
- 页面字段与 API 返回逐项核对

### 10.3 数据模型验证
- 主外键、软删策略、唯一约束
- Explain 验证热路径索引命中
- 幂等与状态流转约束验证

### 10.4 E2E 验证（实现阶段）
- `PO -> GRN -> inventory_ledger`
- `SO -> OUT -> inventory_ledger`
- `Stocktake -> diff -> adjustment`
- 证据：单据级 + 行级上传绑定与差异行强制校验
- 权限：跨租户与越权拦截

---

## 11. 实施目录建议（后续改造落点）

- `apps/server/src/app.module.ts`
- `apps/server/src/modules/**`
- `apps/server/src/common/**`
- `apps/server/src/database/**`
- `apps/web/src/app/**`
- `apps/web/src/components/**`
- `apps/web/src/lib/**`
- `packages/shared/src/types/**`
- `packages/shared/src/constants/**`
- `packages/shared/src/utils/**`

---

## 12. 参考文档

- `designs/architecture/miniERP-系统设计与架构升级计划.md`
- `designs/architecture/miniERP-TDD-技术方案书-v1.md`
- `designs/adr/ADR-001-miniERP-v1-architecture.md`
- `designs/adr/ADR-002-tenant-isolation-dual-defense.md`
- `designs/adr/ADR-003-evidence-storage-pipeline.md`
- `designs/adr/ADR-004-inventory-consistency-and-idempotency.md`
- `designs/adr/ADR-005-frontend-template-governance.md`
- `designs/ui/minierp_page_spec.md`
- `designs/ui/miniERP_evidence_system.md`
