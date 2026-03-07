# ERP 页面缺口分析 — 实体×模板 覆盖矩阵

## 实体列表与 T2 列表字段定义

根据 [erp-page-priority-and-interface-map.md](file:///Users/haoqi/OnePersonCompany/miniERP/docs/ui/erp-page-priority-and-interface-map.md) 完整页面树，以下为**每个实体的 T2 列表页**及其列表字段。

### ✅ = 已画  |  ❌ = 缺失需补

---

## 主数据域

| 实体 | T2 列表 | 列表字段 | 状态 |
|------|---------|----------|------|
| **Item (物料)** | `/mdm/items` | 编号·名称·规格·分类·基本单位·安全库存·状态 | ✅ 已有 (SKU列表) |
| **Customer (客户)** | `/mdm/customers` | 编号·名称·联系人·电话·信用额度·状态 | ✅ 已画 |
| **Supplier (供应商)** | `/mdm/suppliers` | 编号·名称·联系人·资质到期·合作订单·状态 | ✅ 已画 |
| **Warehouse (仓库)** | `/mdm/warehouses` | 编号·名称·类型·地址·联系人·库位管理·状态 | ❌ 缺失 |
| **BOM (物料清单)** | `/mdm/boms` | BOM编号·产品名称·版本·生效日期·组件数·状态 | ❌ 缺失 |
| **Organization (组织)** | `/mdm/organizations` | 编号·名称·类型·上级·状态 | ❌ 缺失 |
| **User (用户)** | `/mdm/users` | 用户名·姓名·角色·部门·最近登录·状态 | ❌ 缺失 |
| **Role (角色)** | `/mdm/roles` | 角色名·描述·权限数·用户数·状态 | ❌ 缺失 |

## 采购域

| 实体 | T2 列表 | 列表字段 | 状态 |
|------|---------|----------|------|
| **PurchaseOrder (采购单)** | `/procure/purchase-orders` | PO编号·供应商·日期·金额·行数·状态·操作 | ✅ 已画 |
| **GoodsReceipt (收货单)** | `/procure/receipts` | GRN编号·PO编号·供应商·仓库·数量·过账时间·状态 | ❌ 缺失 |

## 销售域

| 实体 | T2 列表 | 列表字段 | 状态 |
|------|---------|----------|------|
| **Quotation (报价单)** | `/sales/quotations` | 报价编号·客户·报价日期·有效期至·金额·版本·状态 | ✅ 已画 |
| **SalesOrder (销售订单)** | `/sales/orders` | SO编号·客户·日期·金额·交期·状态·操作 | ✅ 已画 |
| **Shipment (发运单)** | `/sales/shipments` | 发运编号·客户·关联SO·数量·物流单号·状态·操作 | ✅ 已画 |

## 库存域

| 实体 | T2 列表 | 列表字段 | 状态 |
|------|---------|----------|------|
| **InventoryBalance (库存余额)** | `/inventory/balances` | 物料编号·名称·仓库·在库·可用·预留·安全库存·状态 | ✅ 已画 |
| **InventoryLedger (库存流水)** | `/inventory/ledger` | 日期·物料·仓库·事务类型·方向·数量·来源单据·操作人 | ❌ 缺失 |
| **InventoryAdjustment (调整)** | `/inventory/adjustments` | 调整单号·仓库·日期·行数·调整数量·原因·状态 | ❌ 缺失 |
| **Replenishment (补货建议)** | `/inventory/replenishment` | 物料编号·名称·当前库存·安全库存·缺口·建议采购量·交期 | ❌ 缺失 |
| **Stocktake (盘点)** | `/inventory/counts` | 盘点编号·仓库·日期·盘点行·差异数·负责人·状态 | ✅ 已画 |

## 制造与质量域

| 实体 | T2 列表 | 列表字段 | 状态 |
|------|---------|----------|------|
| **ProductionOrder (生产订单)** | `/manufacturing/orders` | MO编号·产品·BOM·计划数·完成数·计划日期·状态 | ❌ 缺失 |
| **QCRecord (质检记录)** | `/quality/records` | QC编号·类型·物料·批次号·结果·检验人·时间·状态 | ❌ 缺失 |

## 财务域

| 实体 | T2 列表 | 列表字段 | 状态 |
|------|---------|----------|------|
| **Invoice (发票)** | `/finance/invoices` | 发票编号·类型(AR/AP)·客户/供应商·金额·开票日·到期日·状态 | ✅ 已画 |
| **Receipt (收款)** | `/finance/receipts` | 收款编号·客户·日期·金额·方式·已核销·状态 | ❌ 缺失 |
| **Payment (付款)** | `/finance/payments` | 付款编号·供应商·日期·金额·方式·已核销·状态 | ❌ 缺失 |
| **JournalEntry (凭证)** | `/finance/journals` | 凭证号·日期·类型·摘要·借方·贷方·状态 | ✅ 已画 |
| **GLAccount (科目)** | `/finance/gl-accounts` | 科目编码·科目名称·类型·币种控制·上级科目·状态 | ❌ 缺失 |
| **CostCenter (成本中心)** | `/finance/cost-centers` | 编码·名称·负责人·状态 | ❌ 缺失 |
| **Budget (预算)** | `/finance/budgets` | 编号·名称·期间·预算金额·已使用·剩余·状态 | ❌ 缺失 |

## 流程/报表/集成域

| 实体 | T2 列表 | 列表字段 | 状态 |
|------|---------|----------|------|
| **WorkflowTask (审批任务)** | `/workflow/tasks` | 单据编号·类型·申请人·摘要·金额·操作 | ✅ 已画 |
| **IntegrationEndpoint (集成端点)** | `/integration/endpoints` | 名称·类型·URL·状态·最近同步 | ❌ 缺失 |
| **IntegrationJob (集成任务)** | `/integration/jobs` | 任务名·端点·频率·最近执行·下次执行·状态 | ❌ 缺失 |
| **IntegrationLog (集成日志)** | `/integration/logs` | 时间·端点·任务·方向·数据量·耗时·状态 | ❌ 缺失 |
| **EvidenceAsset (证据资产)** | `/evidence/assets` | 编号·类型·关联单据·上传时间·大小·上传人 | ❌ 缺失 |

---

## 缺失统计

**已画**: 12 个 T2 列表页
**缺失**: 17 个 T2 列表页需补

### 待创建的 17 个列表页

1. 仓库列表 `/mdm/warehouses`
2. BOM列表 `/mdm/boms`
3. 组织列表 `/mdm/organizations`
4. 用户列表 `/mdm/users`
5. 角色列表 `/mdm/roles`
6. 收货单列表 `/procure/receipts`
7. 库存流水 `/inventory/ledger`
8. 库存调整 `/inventory/adjustments`
9. 补货建议 `/inventory/replenishment`
10. 生产订单列表 `/manufacturing/orders`
11. 质检记录列表 `/quality/records`
12. 收款列表 `/finance/receipts`
13. 付款列表 `/finance/payments`
14. 科目表 `/finance/gl-accounts`
15. 成本中心 `/finance/cost-centers`
16. 预算列表 `/finance/budgets`
17. 集成端点 `/integration/endpoints` (低优先级)
