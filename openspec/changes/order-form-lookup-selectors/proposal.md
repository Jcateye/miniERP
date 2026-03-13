# Proposal: order-form-lookup-selectors

## Why

采购单和销售单表单当前仍要求用户直接输入 `supplierId` / `customerId` 字符串，这会让页面继续承担外键猜测和脏数据风险，也不符合 canonical UI 规则中“counterparty 使用 lookup selector”的约束。

## What Changes

- 为采购单和销售单表单增加基于 BFF 的远程 lookup selector。
- 新建采购单改为从 `/api/bff/suppliers` 选择供应商。
- 新建销售单改为从 `/api/bff/customers` 选择客户。
- 编辑态保留当前值兼容，以免旧列表行缺少真实 counterparty id 时无法打开表单。
- 采购单和销售单编辑态优先通过 BFF detail route 预加载真实 `header + lines` 草稿数据；仅在旧 fixture / legacy 列表行没有 detail 时退回兼容摘要行。

## Impact

- 影响模块：`apps/web/src/components/views/erp/integrated/procure/purchase-orders`、`apps/web/src/components/views/erp/integrated/sales/orders`、`apps/web/src/components/shared`
- 不改页面 URL route
- 不改 server API
