# ERP Page Priority And Interface Map

## 1. 目标

把总体 IA 拆成“页面实现优先级 + 模板类型 + BFF 路由 + 后端域接口”的执行文档。

总基线见：

- [miniERP-ERP总体架构与主业务流程蓝图.md](/Users/haoqi/OnePersonCompany/miniERP/designs/architecture/miniERP-ERP%E6%80%BB%E4%BD%93%E6%9E%B6%E6%9E%84%E4%B8%8E%E4%B8%BB%E4%B8%9A%E5%8A%A1%E6%B5%81%E7%A8%8B%E8%93%9D%E5%9B%BE.md)
- [route-manifest.ts](/Users/haoqi/OnePersonCompany/miniERP/apps/web/src/lib/navigation/route-manifest.ts)
- [minierp_page_spec.md](/Users/haoqi/OnePersonCompany/miniERP/designs/ui/minierp_page_spec.md)

---

## 2. 页面治理规则

- 只允许 T1/T2/T3/T4
- 列表页筛选、排序、分页必须 URL 化
- 详情页统一包含：头部动作 + 分区 + Tabs + Evidence + Audit
- 单据型 T4 必须带固定底栏、校验摘要、幂等提交
- 页面不能直连 backend，只能走 BFF
- 状态枚举必须来自 `packages/shared`

---

## 3. 页面优先级

## P0. 已经影响主链路、必须先做真数据

```text
/mdm/items
/mdm/items/:id
/mdm/items/new
/inventory/balances
/inventory/ledger
/inventory/counts
/inventory/counts/:id
/inventory/counts/new
/procure/purchase-orders
/procure/receipts
/sales/orders
/sales/shipments
```

## P1. 业务主流程下一层

```text
/workspace
/workspace/todos
/mdm/customers
/mdm/suppliers
/mdm/warehouses
/sales/quotations
/finance/invoices
/workflow/tasks
```

## P2. 财务闭环与平台能力

```text
/finance/receipts
/finance/payments
/finance/journals
/finance/gl-accounts
/finance/cost-centers
/finance/budgets
/reports
/integration/endpoints
/integration/jobs
/integration/logs
/evidence/assets
```

## P3. 制造质量域

```text
/manufacturing/overview
/manufacturing/orders
/manufacturing/orders/:id
/manufacturing/work-orders/:id
/quality/records
/quality/records/:id
```

---

## 4. 页面树与接口对照

说明：

- `模板` 只允许 `T1/T2/T3/T4`
- `BFF` 是页面唯一入口
- `Backend` 写的是目标域接口，不代表当前全部已完成

## 4.1 工作空间

| 页面 | 模板 | 说明 | BFF | Backend |
|---|---|---|---|---|
| `/workspace` | T1 | 角色工作台、概览、待办摘要 | `/api/bff/workspace/summary` | `/workspace/summary` |
| `/workspace/todos` | T2 | 待办列表 | `/api/bff/workspace/todos` | `/workflow/tasks` |
| `/workspace/notifications` | T2 | 通知列表 | `/api/bff/workspace/notifications` | `/notifications` |
| `/workspace/notifications/:id` | T3 | 通知详情 | `/api/bff/workspace/notifications/:id` | `/notifications/:id` |

## 4.2 主数据

| 页面 | 模板 | 说明 | BFF | Backend |
|---|---|---|---|---|
| `/mdm/organizations` | T2 | 公司/组织列表 | `/api/bff/mdm/organizations` | `/organizations` |
| `/mdm/users` | T2 | 用户列表 | `/api/bff/mdm/users` | `/users` |
| `/mdm/roles` | T2 | 角色与权限 | `/api/bff/mdm/roles` | `/roles` |
| `/mdm/customers` | T2 | 客户列表 | `/api/bff/customers` 或 `/api/bff/mdm/customers` | `/customers` |
| `/mdm/customers/:id` | T3 | 客户详情 | `/api/bff/customers/:id` | `/customers/:id` |
| `/mdm/suppliers` | T2 | 供应商列表 | `/api/bff/suppliers` 或 `/api/bff/mdm/suppliers` | `/suppliers` |
| `/mdm/suppliers/:id` | T3 | 供应商详情 | `/api/bff/suppliers/:id` | `/suppliers/:id` |
| `/mdm/items` | T2 | 物料列表 | `/api/bff/mdm/items` | `/items` |
| `/mdm/items/:id` | T3 | 物料详情 | `/api/bff/mdm/items/:id` | `/items/:id` |
| `/mdm/items/new` | T4 | 新建物料 | `/api/bff/mdm/items` | `/items` |
| `/mdm/boms` | T2 | BOM 列表 | `/api/bff/mdm/boms` | `/boms` |
| `/mdm/boms/:id` | T3 | BOM 详情 | `/api/bff/mdm/boms/:id` | `/boms/:id` |
| `/mdm/warehouses` | T2 | 仓库列表 | `/api/bff/warehouses` 或 `/api/bff/mdm/warehouses` | `/warehouses` |

## 4.3 采购

| 页面 | 模板 | 说明 | BFF | Backend |
|---|---|---|---|---|
| `/procure/overview` | T1 | 采购概览 | `/api/bff/procure/overview` | `/procure/overview` |
| `/procure/purchase-orders` | T2 | 采购单列表 | `/api/bff/documents?docType=PO` 或 `/api/bff/procure/purchase-orders` | `/purchase-orders` |
| `/procure/purchase-orders/:id` | T3 | 采购单详情 | `/api/bff/documents/PO/:id` | `/purchase-orders/:id` |
| `/procure/purchase-orders/new` | T4 | 新建采购单 | `/api/bff/documents` | `/purchase-orders` |
| `/procure/receipts` | T2 | 收货单列表 | `/api/bff/documents?docType=GRN` 或 `/api/bff/procure/receipts` | `/goods-receipts` |
| `/procure/receipts/:id` | T3 | 收货单详情 | `/api/bff/documents/GRN/:id` | `/goods-receipts/:id` |
| `/procure/receipts/new` | T4 | 新建收货单 | `/api/bff/documents` | `/goods-receipts` |

## 4.4 销售

| 页面 | 模板 | 说明 | BFF | Backend |
|---|---|---|---|---|
| `/sales/overview` | T1 | 销售概览 | `/api/bff/sales/overview` | `/sales/overview` |
| `/sales/quotations` | T2 | 报价列表 | `/api/bff/sales/quotations` | `/quotations` |
| `/sales/quotations/:id` | T3 | 报价详情 | `/api/bff/sales/quotations/:id` | `/quotations/:id` |
| `/sales/quotations/new` | T4 | 新建报价 | `/api/bff/sales/quotations` | `/quotations` |
| `/sales/orders` | T2 | 销售订单列表 | `/api/bff/documents?docType=SO` 或 `/api/bff/sales/orders` | `/sales-orders` |
| `/sales/orders/:id` | T3 | 销售订单详情 | `/api/bff/documents/SO/:id` | `/sales-orders/:id` |
| `/sales/orders/new` | T4 | 新建销售订单 | `/api/bff/documents` | `/sales-orders` |
| `/sales/shipments` | T2 | 发运列表 | `/api/bff/sales/shipments` | `/shipments` |
| `/sales/shipments/:id` | T3 | 发运详情 | `/api/bff/sales/shipments/:id` | `/shipments/:id` |
| `/sales/shipments/new` | T4 | 新建发运 | `/api/bff/sales/shipments` | `/shipments` |

## 4.5 库存

| 页面 | 模板 | 说明 | BFF | Backend |
|---|---|---|---|---|
| `/inventory/overview` | T1 | 库存概览 | `/api/bff/inventory/overview` | `/inventory/overview` |
| `/inventory/balances` | T2 | 库存余额 | `/api/bff/inventory/balances` | `/inventory/balances` |
| `/inventory/ledger` | T2 | 库存流水 | `/api/bff/inventory/ledger` | `/inventory/ledger` |
| `/inventory/adjustments` | T2 | 调整列表 | `/api/bff/inventory/adjustments` | `/inventory/transactions?type=adjust` |
| `/inventory/replenishment` | T2 | 补货建议 | `/api/bff/inventory/replenishment` | `/inventory/replenishment` |
| `/inventory/counts` | T2 | 盘点列表 | `/api/bff/inventory/counts` | `/stocktakes` |
| `/inventory/counts/:id` | T3 | 盘点详情 | `/api/bff/inventory/counts/:id` | `/stocktakes/:id` |
| `/inventory/counts/new` | T4 | 新建盘点 | `/api/bff/inventory/counts` | `/stocktakes` |
| `/inventory/transfers/new` | T4 | 新建调拨 | `/api/bff/inventory/transfers` | `/inventory/transactions` |

## 4.6 制造与质量

| 页面 | 模板 | 说明 | BFF | Backend |
|---|---|---|---|---|
| `/manufacturing/overview` | T1 | 制造概览 | `/api/bff/manufacturing/overview` | `/manufacturing/overview` |
| `/manufacturing/orders` | T2 | 生产订单列表 | `/api/bff/manufacturing/orders` | `/production-orders` |
| `/manufacturing/orders/:id` | T3 | 生产订单详情 | `/api/bff/manufacturing/orders/:id` | `/production-orders/:id` |
| `/manufacturing/orders/new` | T4 | 新建生产订单 | `/api/bff/manufacturing/orders` | `/production-orders` |
| `/manufacturing/work-orders/:id` | T3 | 工单详情 | `/api/bff/manufacturing/work-orders/:id` | `/work-orders/:id` |
| `/quality/records` | T2 | 质检记录列表 | `/api/bff/quality/records` | `/qc-records` |
| `/quality/records/:id` | T3 | 质检记录详情 | `/api/bff/quality/records/:id` | `/qc-records/:id` |

## 4.7 财务

| 页面 | 模板 | 说明 | BFF | Backend |
|---|---|---|---|---|
| `/finance/overview` | T1 | 财务概览 | `/api/bff/finance/overview` | `/finance/overview` |
| `/finance/invoices` | T2 | 发票列表 | `/api/bff/finance/invoices` | `/invoices` |
| `/finance/invoices/:id` | T3 | 发票详情 | `/api/bff/finance/invoices/:id` | `/invoices/:id` |
| `/finance/invoices/new` | T4 | 新建发票 | `/api/bff/finance/invoices` | `/invoices` |
| `/finance/receipts` | T2 | 收款列表 | `/api/bff/finance/receipts` | `/receipts` |
| `/finance/receipts/:id` | T3 | 收款详情 | `/api/bff/finance/receipts/:id` | `/receipts/:id` |
| `/finance/receipts/new` | T4 | 新建收款 | `/api/bff/finance/receipts` | `/receipts` |
| `/finance/payments` | T2 | 付款列表 | `/api/bff/finance/payments` | `/payments` |
| `/finance/payments/:id` | T3 | 付款详情 | `/api/bff/finance/payments/:id` | `/payments/:id` |
| `/finance/payments/new` | T4 | 新建付款 | `/api/bff/finance/payments` | `/payments` |
| `/finance/journals` | T2 | 凭证列表 | `/api/bff/finance/journals` | `/journal-entries` |
| `/finance/journals/:id` | T3 | 凭证详情 | `/api/bff/finance/journals/:id` | `/journal-entries/:id` |
| `/finance/journals/new` | T4 | 新建凭证 | `/api/bff/finance/journals` | `/journal-entries` |
| `/finance/gl-accounts` | T2 | 科目表 | `/api/bff/finance/gl-accounts` | `/gl-accounts` |
| `/finance/cost-centers` | T2 | 成本中心 | `/api/bff/finance/cost-centers` | `/cost-centers` |
| `/finance/budgets` | T2 | 预算列表 | `/api/bff/finance/budgets` | `/budgets` |
| `/finance/period-close` | T4 | 期间结账向导 | `/api/bff/finance/period-close` | `/fiscal-periods/close` |

## 4.8 流程、报表、集成、Evidence

| 页面 | 模板 | 说明 | BFF | Backend |
|---|---|---|---|---|
| `/workflow/tasks` | T2 | 审批任务列表 | `/api/bff/workflow/tasks` | `/workflow/tasks` |
| `/workflow/tasks/:id` | T3 | 审批任务详情 | `/api/bff/workflow/tasks/:id` | `/workflow/tasks/:id` |
| `/reports` | T1 | 报表中心 | `/api/bff/reports/summary` | `/reports/summary` |
| `/reports/sales` | T2 | 销售报表 | `/api/bff/reports/sales` | `/reports/sales` |
| `/reports/purchase` | T2 | 采购报表 | `/api/bff/reports/purchase` | `/reports/purchase` |
| `/reports/inventory` | T2 | 库存报表 | `/api/bff/reports/inventory` | `/reports/inventory` |
| `/reports/finance` | T2 | 财务报表 | `/api/bff/reports/finance` | `/reports/finance` |
| `/integration/endpoints` | T2 | 端点列表 | `/api/bff/integration/endpoints` | `/integration/endpoints` |
| `/integration/jobs` | T2 | 任务列表 | `/api/bff/integration/jobs` | `/integration/jobs` |
| `/integration/logs` | T2 | 日志列表 | `/api/bff/integration/logs` | `/integration/logs` |
| `/integration/logs/:id` | T3 | 日志详情 | `/api/bff/integration/logs/:id` | `/integration/logs/:id` |
| `/evidence/assets` | T2 | 证据资产列表 | `/api/bff/evidence/assets` | `/evidence/assets` |
| `/evidence/assets/:id` | T3 | 证据资产详情 | `/api/bff/evidence/assets/:id` | `/evidence/assets/:id` |

---

## 5. 当前实现状态分层

## A. 已有真实链路

```text
/mdm/items
/mdm/items/:id
/mdm/items/new
/inventory/balances
/inventory/ledger
/api/bff/skus*
/api/bff/mdm/items*
/api/bff/inventory/balances
/api/bff/inventory/ledger
```

## B. 已有页面壳，但还是 placeholder 或旧能力复用

```text
/workspace/*
/procure/*
/sales/*
/manufacturing/*
/quality/*
/finance/*
/workflow/*
/integration/*
/evidence/assets*
```

## C. 需要后端先补表再接页面

```text
company / org_unit
invoice / payment / receipt / journal_entry
production_order / work_order / qc_record
workflow_instance / approval_task / notification
integration_endpoint / integration_job / integration_log
```

---

## 6. 推荐实施顺序

## 第 1 波

- `/mdm/items*`
- `/inventory/balances`
- `/inventory/ledger`
- `/inventory/counts*`

目标：

- `item` 和库存域先形成真实主路径

## 第 2 波

- `/procure/purchase-orders*`
- `/procure/receipts*`
- `/sales/orders*`
- `/sales/shipments*`
- `/sales/quotations*`

目标：

- 采购和销售主单据链路接起来

## 第 3 波

- `/finance/invoices*`
- `/finance/receipts*`
- `/finance/payments*`
- `/finance/journals*`

目标：

- 业财税闭环

## 第 4 波

- `/workflow/tasks*`
- `/reports*`
- `/integration/*`
- `/evidence/assets*`

目标：

- 平台能力收口

## 第 5 波

- `/manufacturing/*`
- `/quality/*`

目标：

- 制造质量并入统一骨架

---

## 7. 页面验收检查单

每个页面上线前至少要检查：

1. 是否落在 T1/T2/T3/T4
2. 是否只通过 BFF 请求数据
3. 列表页是否 URL 化筛选排序分页
4. 详情页是否带 Evidence 和 Audit
5. T4 提交是否带 `Idempotency-Key`
6. 状态是否来自 `packages/shared`
7. 是否存在旧路由兼容策略
