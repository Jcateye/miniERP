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
| `/mdm/customers` | `T2` | `search-list` | `iYRfh` | 客户列表 | `page.tsx -> customers/customers-page-view + customers-page` | `in-progress` | `BFF /api/bff/customers` | 当前已切到独立 page-level view 与 page-local 数据转换，但视觉仍保留 filter chips、文案和按钮差异，尚未达到设计稿 rebuilt 标准。 |
| `/mdm/suppliers` | `T2` | `search-list` | `Iz7xv` | 供应商列表 | `page.tsx -> suppliers/suppliers-page-view + suppliers-page` | `in-progress` | `page-local seed / target BFF pending` | 当前已切到独立 page-level view 与 page-local seed VM；主内容区收口为标题区、单搜索框、白底表格卡片；主按钮保持禁用态占位，列表保留 detail href，keyword 已编码到页面 URL 并驱动本地过滤，并通过真实 page.tsx 渲染测试确认不再回退到 settings/master-data 工作台；尚未达到设计稿 rebuilt 标准。 |
| `/mdm/warehouses` | `T2` | `search-list` | `S8YEo` | 仓库列表 | `page.tsx -> warehouses/warehouses-page-view + warehouses-page` | `in-progress` | `BFF /api/bff/warehouses` | 当前已切到独立 page-level view 与 page-local VM；主内容区收口为标题区、单搜索框、白底表格卡片；不存在的 detail 跳转已移除，“新建仓库”为禁用态占位，keyword 仅保留在页面 URL 与本地过滤层，尚未达到设计稿 rebuilt 标准。 |
| `/mdm/users` | `T2` | `simple-list` | `UU4t0` | 用户列表 | `page.tsx -> users/users-page-view + users-page` | `in-progress` | `page-local seed / target BFF pending` | 当前已切到独立 page-level view 与 page-local seed VM；主内容区收口为标题区、白底表格卡片；没有搜索框、filter chips 和额外 toolbar；主按钮仍为禁用态占位，列表不暴露 detail href，并已补 page.tsx 真实接线测试与无分页 footer 断言；不再错误复用 settings 用户页。 |
| `/mdm/roles` | `T2` | `simple-list` | `SNnic` | 角色列表 | `page.tsx -> roles/roles-page-view + roles-page` | `in-progress` | `page-local seed / target BFF pending` | 当前已切到独立 page-level view 与 page-local seed VM；主内容区收口为标题区、白底表格卡片；没有搜索框、filter chips 和额外 toolbar；主按钮仍为禁用态占位，列表不暴露 detail href，并已补 page.tsx 真实接线测试与无分页 footer 断言；不再错误复用 settings 角色页。 |
| `/mdm/organizations` | `T2` | `simple-list` | `pDe3z` | 组织列表 | `page.tsx -> organizations/organizations-page-view + organizations-page` | `in-progress` | `page-local seed / target BFF pending` | 当前已切到独立 page-level view 与 page-local seed VM；主内容区收口为标题区、白底表格卡片；没有搜索框、filter chips 和额外 toolbar；主按钮仍为禁用态占位，列表不暴露 detail href，并已补 page.tsx 真实接线测试与无分页 footer 断言；尚未达到设计稿 rebuilt 标准。 |
| `/finance/receipts` | `T2` | `simple-list` | `ZvGFp` | 收款列表 | `page.tsx -> receipts/receipts-page-view + receipts-page` | `in-progress` | `page-local seed / target BFF pending` | 当前已切到独立 page-level view 与 page-local seed VM；主内容区收口为标题区、演示数据提示、白底表格卡片；没有搜索框、filter chips 和额外 toolbar；由于 new/detail 仍是 placeholder，源页入口已禁用，尚未达到设计稿 rebuilt 标准。 |
| `/finance/payments` | `T2` | `simple-list` | `vQa3s` | 付款列表 | `page.tsx -> payments/payments-page-view + payments-page` | `in-progress` | `page-local seed / target BFF pending` | 当前已切到独立 page-level view 与 page-local seed VM；主内容区收口为标题区、演示数据提示、白底表格卡片；没有搜索框、filter chips 和额外 toolbar；由于 new/detail 仍是 placeholder，源页入口已禁用，尚未达到设计稿 rebuilt 标准。 |
| `/finance/gl-accounts` | `T2` | `tree-list` | `Ch7yZ` | 科目表 | `page.tsx -> gl-accounts/gl-accounts-page-view + gl-accounts-page` | `in-progress` | `page-local seed / target BFF pending` | 当前已切到独立 page-level view 与 page-local seed VM；主内容区收口为标题区、演示数据提示、白底表格卡片；没有搜索框、filter chips 和额外 toolbar；按最小可落地策略先用扁平 seed 行数据表达层级缩进，并禁用尚未实现的详情/新建入口，尚未达到设计稿 rebuilt 标准。 |
| `/finance/cost-centers` | `T2` | `simple-list` | `LQFcg` | 成本中心 | `page.tsx -> cost-centers/cost-centers-page-view + cost-centers-page` | `in-progress` | `page-local seed / target BFF pending` | 当前已切到独立 page-level view 与 page-local seed VM；主内容区收口为标题区、演示数据提示、白底表格卡片；没有搜索框、filter chips 和额外 toolbar；主按钮仍为禁用态占位，列表不暴露 detail href，并已补 page.tsx 真实接线测试与无分页 footer 断言；尚未达到设计稿 rebuilt 标准。 |
| `/finance/budgets` | `T2` | `simple-list` | `iHpnf` | 预算列表 | `page.tsx -> budgets/budgets-page-view + budgets-page` | `in-progress` | `page-local seed / target BFF pending` | 当前已切到独立 page-level view 与 page-local seed VM；主内容区收口为标题区、白底表格卡片；没有搜索框、filter chips 和额外 toolbar；主按钮仍为禁用态占位，列表不暴露 detail href，并已补 page.tsx 真实接线测试与无分页 footer 断言；按设计节点当前结构不额外展示 seed notice；尚未达到设计稿 rebuilt 标准。 |
| `/integration/endpoints` | `T2` | `simple-list` | `Cl9W4` | 集成端点 | `page.tsx -> endpoints/endpoints-page-view + endpoints-page` | `in-progress` | `page-local seed / target BFF pending` | 当前已切到独立 page-level view 与 page-local seed VM；主内容区收口为标题区、白底表格卡片；没有搜索框、filter chips 和额外 toolbar；主按钮仍为禁用态占位，列表不暴露 detail href，并已补 page.tsx 真实接线测试与无分页 footer 断言；不再错误复用 settings API clients 页面。 |
