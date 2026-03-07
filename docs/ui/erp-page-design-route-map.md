# ERP Page Design Route Map

## 说明

本表用于维护 ERP 路由、family、设计节点与当前运行态之间的一一对应关系。

状态约定：
- `wrong`：当前运行态不是设计稿正式实现路径
- `in-progress`：正在按设计稿重构
- `rebuilt`：已按设计稿重建
- `legacy`：仅保留 fallback / 临时过渡能力

## 第一批 T2 页面映射

| route | family | variant | design_node_id | design_name | current_runtime | status | data_source | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/mdm/customers` | `T2` | `search-list` | `iYRfh` | 客户列表 | `page.tsx -> export default from /settings/master-data/page` | `wrong` | `BFF /api/bff/customers` | 当前复用 settings 主数据页，通过 pathname 推断 customers tab，不是 page-level design view；历史错误主实现路径曾指向 `page.tsx -> WorkbenchAssembly`，已清理。 |
| `/mdm/suppliers` | `T2` | `search-list` | `Iz7xv` | 供应商列表 | `page.tsx -> export default from /settings/master-data/page` | `wrong` | `BFF /api/bff/suppliers` | 当前复用 settings 主数据页，通过 pathname 推断 suppliers tab，不是 page-level design view；历史错误主实现路径曾指向 `page.tsx -> WorkbenchAssembly`，已清理。 |
| `/mdm/warehouses` | `T2` | `search-list` | `S8YEo` | 仓库列表 | `page.tsx -> export default from /settings/master-data/page` | `wrong` | `BFF /api/bff/warehouses` | 当前复用 settings 主数据页，通过 pathname 推断 warehouses tab，不是 page-level design view；历史错误主实现路径曾指向 `page.tsx -> WorkbenchAssembly`，已清理。 |
| `/mdm/users` | `T2` | `simple-list` | `UU4t0` | 用户列表 | `page.tsx -> export default from /settings/users/page` | `wrong` | `local static rows` | 当前是 settings 用户页，使用本地静态行数据；未按设计稿 node `UU4t0` 重建；历史错误主实现路径曾指向 `page.tsx -> WorkbenchAssembly`，已清理。 |
| `/mdm/roles` | `T2` | `simple-list` | `SNnic` | 角色列表 | `page.tsx -> export default from /settings/roles/page` | `wrong` | `local static arrays` | 当前是 settings 角色权限页，偏向左右分栏配置，不是设计稿列表页；历史错误主实现路径曾指向 `page.tsx -> WorkbenchAssembly`，已清理。 |
| `/mdm/organizations` | `T2` | `simple-list` | `pDe3z` | 组织列表 | `page.tsx -> RoutePlaceholderPage` | `wrong` | `placeholder / no BFF yet` | 当前仍是占位页；设计稿节点已存在，但尚无 page-level view；历史错误主实现路径曾指向 `page.tsx -> WorkbenchAssembly`，已清理。 |
| `/finance/receipts` | `T2` | `simple-list` | `ZvGFp` | 收款列表 | `page.tsx -> RoutePlaceholderPage` | `wrong` | `placeholder / target BFF pending` | 当前仍是占位页；目标应切到逐页收款列表 view；历史错误主实现路径曾指向 `page.tsx -> WorkbenchAssembly`，已清理。 |
| `/finance/payments` | `T2` | `simple-list` | `vQa3s` | 付款列表 | `page.tsx -> RoutePlaceholderPage` | `wrong` | `placeholder / target BFF pending` | 当前仍是占位页；目标应切到逐页付款列表 view；历史错误主实现路径曾指向 `page.tsx -> WorkbenchAssembly`，已清理。 |
| `/finance/gl-accounts` | `T2` | `tree-list` | `Ch7yZ` | 科目表 | `page.tsx -> RoutePlaceholderPage` | `wrong` | `placeholder / target BFF pending` | 设计稿语义更接近带层级关系的科目列表；当前仍是占位页；历史错误主实现路径曾指向 `page.tsx -> WorkbenchAssembly`，已清理。 |
| `/finance/cost-centers` | `T2` | `simple-list` | `LQFcg` | 成本中心 | `page.tsx -> RoutePlaceholderPage` | `wrong` | `placeholder / target BFF pending` | 当前仍是占位页；目标应切到逐页成本中心列表 view；历史错误主实现路径曾指向 `page.tsx -> WorkbenchAssembly`，已清理。 |
| `/finance/budgets` | `T2` | `simple-list` | `iHpnf` | 预算列表 | `page.tsx -> RoutePlaceholderPage` | `wrong` | `placeholder / target BFF pending` | 当前仍是占位页；目标应切到逐页预算列表 view；历史错误主实现路径曾指向 `page.tsx -> WorkbenchAssembly`，已清理。 |
| `/integration/endpoints` | `T2` | `simple-list` | `Cl9W4` | 集成端点 | `page.tsx -> export default from /settings/api-clients/page` | `wrong` | `local static rows` | 当前复用 settings API clients 页面，不是集成端点设计稿页面；历史错误主实现路径曾指向 `page.tsx -> WorkbenchAssembly`，已清理。 |
