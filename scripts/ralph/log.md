# Ralph Loop Log

## 2026-03-07 初始化

- 初始化 Ralph Loop 最小运行骨架。
- 目标：按照 `images/source/miniERP-pencil-opus4.6.pen` 与既有设计计划，持续复刻全部前端页面，直到所有 user stories 通过。
- 当前已存在的设计事实来源：
  - `docs/plans/2026-03-07-erp-page-reconstruction-design.md`
  - `docs/ui/erp-page-design-route-map.md`
  - `docs/ui/erp-page-priority-and-interface-map.md`
  - `AGENTS.md`
  - `CLAUDE.md`

## 2026-03-07 /mdm/customers

- 处理 story：`route-mdm-customers-list`
- 改动文件：
  - `apps/web/src/app/(dashboard)/mdm/customers/page.tsx`
  - `apps/web/src/app/(dashboard)/mdm/customers/customers-page.ts`
  - `apps/web/src/app/(dashboard)/mdm/customers/customers-page-view.tsx`
  - `apps/web/src/app/(dashboard)/mdm/customers/customers-page.spec.tsx`
  - `apps/web/src/app/(dashboard)/mdm/customers/use-customers-page-vm.ts`
  - `apps/web/src/app/(dashboard)/mdm/customers/use-customers-page-vm.spec.ts`
  - `apps/web/src/components/ui/page-header.tsx`
  - `apps/web/src/components/ui/page-header.spec.tsx`
- 是否完成：部分完成，已达到 `visual-done`
- 最小验证：
  - `bun test apps/web/src/app/(dashboard)/mdm/customers/use-customers-page-vm.spec.ts apps/web/src/app/(dashboard)/mdm/customers/customers-page.spec.tsx apps/web/src/components/ui/page-header.spec.tsx`
- 下一轮建议：继续实现 `/mdm/warehouses`，复用相同的 page-level view + page-local VM 结构，但不要回到 settings/master-data 导出。

## 2026-03-07 /mdm/warehouses

- 处理 story：`route-mdm-warehouses-list`
- 改动文件：
  - `apps/web/src/app/(dashboard)/mdm/warehouses/page.tsx`
  - `apps/web/src/app/(dashboard)/mdm/warehouses/warehouses-page.ts`
  - `apps/web/src/app/(dashboard)/mdm/warehouses/warehouses-page-view.tsx`
  - `apps/web/src/app/(dashboard)/mdm/warehouses/warehouses-page.spec.tsx`
  - `apps/web/src/app/(dashboard)/mdm/warehouses/use-warehouses-page-vm.ts`
  - `apps/web/src/app/(dashboard)/mdm/warehouses/use-warehouses-page-vm.spec.ts`
  - `docs/user-stories/erp-page-reconstruction/02-p1-core-pages.json`
- 是否完成：部分完成，已达到 `visual-done`
- 最小验证：
  - `bun test apps/web/src/app/(dashboard)/mdm/warehouses/use-warehouses-page-vm.spec.ts apps/web/src/app/(dashboard)/mdm/warehouses/warehouses-page.spec.tsx`
- 备注：按设计节点 `S8YEo` 切到独立 page-level view + page-local VM；根据代码审查收口掉当前不存在的详情跳转，把“新建仓库”按钮改为禁用态占位，保留设计要求的“类型 / 库位管理”两列，但改为 page-local optional label 映射；同时移除未落地的 status URL 协议，并把 keyword 收口为仅作用于页面 URL 与本地过滤，不再错误透传给上游；非 JSON 响应错误改为显式文案。
- 下一轮建议：继续实现 `/finance/receipts`，该页是 `simple-list`，没有搜索框、filter chips 和额外 toolbar。

## 2026-03-07 /finance/receipts

- 处理 story：`route-finance-receipts-list`
- 改动文件：
  - `apps/web/src/app/(dashboard)/finance/receipts/page.tsx`
  - `apps/web/src/app/(dashboard)/finance/receipts/receipts-page.ts`
  - `apps/web/src/app/(dashboard)/finance/receipts/receipts-page-view.tsx`
  - `apps/web/src/app/(dashboard)/finance/receipts/receipts-page.spec.tsx`
  - `apps/web/src/app/(dashboard)/finance/receipts/use-receipts-page-vm.ts`
  - `apps/web/src/app/(dashboard)/finance/receipts/use-receipts-page-vm.spec.ts`
  - `docs/user-stories/erp-page-reconstruction/02-p1-core-pages.json`
  - `docs/ui/erp-page-design-route-map.md`
- 是否完成：部分完成，已达到 `visual-done`
- 最小验证：
  - `bun test apps/web/src/app/(dashboard)/finance/receipts/receipts-page.spec.tsx apps/web/src/app/(dashboard)/finance/receipts/use-receipts-page-vm.spec.ts`
- 备注：按设计节点 `ZvGFp` 切到独立 page-level view + page-local seed VM；页面收口为标题区、演示数据提示、白底表格卡片；没有搜索框、filter chips 和额外 toolbar；根据代码审查显式披露 seed/mock 状态，并禁用仍指向 placeholder 的新建/详情入口；未知状态文案改为显式 fallback，Suspense fallback 不再返回空白。
- 下一轮建议：继续实现 `/finance/payments`，该页同属 `simple-list`，可复用收款页的 page-level scaffold 与 page-local seed VM 思路，但要重新对齐设计节点 `vQa3s` 的标题、副标题与列表列顺序。

## 2026-03-07 /finance/payments

- 处理 story：`route-finance-payments-list`
- 改动文件：
  - `apps/web/src/app/(dashboard)/finance/payments/page.tsx`
  - `apps/web/src/app/(dashboard)/finance/payments/payments-page.ts`
  - `apps/web/src/app/(dashboard)/finance/payments/payments-page-view.tsx`
  - `apps/web/src/app/(dashboard)/finance/payments/payments-page.spec.tsx`
  - `apps/web/src/app/(dashboard)/finance/payments/use-payments-page-vm.ts`
  - `apps/web/src/app/(dashboard)/finance/payments/use-payments-page-vm.spec.ts`
  - `docs/user-stories/erp-page-reconstruction/02-p1-core-pages.json`
  - `docs/ui/erp-page-design-route-map.md`
  - `scripts/ralph/log.md`
- 是否完成：部分完成，已达到 `visual-done`
- 最小验证：
  - `bun test apps/web/src/app/(dashboard)/finance/payments/payments-page.spec.tsx apps/web/src/app/(dashboard)/finance/payments/use-payments-page-vm.spec.ts`
- 备注：按设计节点 `vQa3s` 切到独立 page-level view + page-local seed VM；页面收口为标题区、演示数据提示、白底表格卡片；没有搜索框、filter chips 和额外 toolbar；根据代码审查保持 seed getter 返回新对象，避免污染共享 seed 数据，并禁用仍指向 placeholder 的新建/详情入口；未知状态文案改为显式 fallback，Suspense fallback 不再返回空白。
- 下一轮建议：继续实现 `/finance/gl-accounts`，该页是 `tree-list`，需要先确认设计节点 `Ch7yZ` 的层级列表结构、列语义与是否存在分组/展开行为，再决定 page-level scaffold。

## 2026-03-07 /finance/gl-accounts

- 处理 story：`route-finance-gl-accounts-list`
- 改动文件：
  - `apps/web/src/app/(dashboard)/finance/gl-accounts/page.tsx`
  - `apps/web/src/app/(dashboard)/finance/gl-accounts/gl-accounts-page.ts`
  - `apps/web/src/app/(dashboard)/finance/gl-accounts/gl-accounts-page-view.tsx`
  - `apps/web/src/app/(dashboard)/finance/gl-accounts/gl-accounts-page.spec.tsx`
  - `apps/web/src/app/(dashboard)/finance/gl-accounts/use-gl-accounts-page-vm.ts`
  - `apps/web/src/app/(dashboard)/finance/gl-accounts/use-gl-accounts-page-vm.spec.ts`
  - `docs/user-stories/erp-page-reconstruction/02-p1-core-pages.json`
  - `docs/ui/erp-page-design-route-map.md`
  - `scripts/ralph/log.md`
- 是否完成：部分完成，已达到 `visual-done`
- 最小验证：
  - `bun test apps/web/src/app/(dashboard)/finance/gl-accounts/gl-accounts-page.spec.tsx apps/web/src/app/(dashboard)/finance/gl-accounts/use-gl-accounts-page-vm.spec.ts`
  - `bun test apps/web/src/components/ui/data-table.spec.tsx`
- 备注：按设计节点 `Ch7yZ` 切到独立 page-level view + page-local seed VM；页面收口为标题区、演示数据提示、白底表格卡片；没有搜索框、filter chips 和额外 toolbar；按当前代码库的最小可落地策略先用扁平 seed 行数据表达树层级缩进，并禁用尚未实现的详情/新建入口；Suspense fallback 为可见加载态。
- 下一轮建议：继续实现 `/finance/cost-centers`，该页回到 `simple-list`，可复用 receipts/payments 的 page-level scaffold，但需要重新对齐设计节点 `LQFcg` 的标题、副标题与列表列顺序。

## 2026-03-07 /finance/cost-centers

- 处理 story：`route-finance-cost-centers-list`
- 改动文件：
  - `apps/web/src/app/(dashboard)/finance/cost-centers/page.tsx`
  - `apps/web/src/app/(dashboard)/finance/cost-centers/cost-centers-page.ts`
  - `apps/web/src/app/(dashboard)/finance/cost-centers/cost-centers-page-view.tsx`
  - `apps/web/src/app/(dashboard)/finance/cost-centers/cost-centers-page.spec.tsx`
  - `apps/web/src/app/(dashboard)/finance/cost-centers/use-cost-centers-page-vm.ts`
  - `apps/web/src/app/(dashboard)/finance/cost-centers/use-cost-centers-page-vm.spec.ts`
  - `apps/web/src/app/(dashboard)/finance/gl-accounts/use-gl-accounts-page-vm.spec.ts`
  - `apps/web/src/app/(dashboard)/finance/payments/use-payments-page-vm.spec.ts`
  - `docs/user-stories/erp-page-reconstruction/02-p1-core-pages.json`
  - `docs/ui/erp-page-design-route-map.md`
  - `scripts/ralph/log.md`
- 是否完成：部分完成，已达到 `visual-done`
- 最小验证：
  - `bun test apps/web/src/app/(dashboard)/finance/cost-centers/cost-centers-page.spec.tsx apps/web/src/app/(dashboard)/finance/cost-centers/use-cost-centers-page-vm.spec.ts`
  - `bun test apps/web/src/app/(dashboard)/finance/cost-centers/cost-centers-page.spec.tsx apps/web/src/app/(dashboard)/finance/cost-centers/use-cost-centers-page-vm.spec.ts apps/web/src/app/(dashboard)/finance/gl-accounts/use-gl-accounts-page-vm.spec.ts apps/web/src/app/(dashboard)/finance/payments/use-payments-page-vm.spec.ts`
- 备注：按设计节点 `LQFcg` 切到独立 page-level view + page-local seed VM；页面收口为标题区、演示数据提示、白底表格卡片；没有搜索框、filter chips 和额外 toolbar；主按钮保持禁用态占位，列表不暴露 detail href，并通过真实 page.tsx 渲染测试确认无分页 footer 与 seed 行数据已接线；同时收口了 finance 相关 seed VM spec 的 readonly 违规写法，改为验证 fresh array / item object 返回。
- 下一轮建议：继续实现 `/finance/budgets`，该页同属 `simple-list`，需要先对齐设计节点 `iHpnf` 的标题、副标题、按钮文案与列表列顺序。

## 2026-03-07 /finance/budgets

- 处理 story：`route-finance-budgets-list`
- 改动文件：
  - `apps/web/src/app/(dashboard)/finance/budgets/page.tsx`
  - `apps/web/src/app/(dashboard)/finance/budgets/budgets-page.ts`
  - `apps/web/src/app/(dashboard)/finance/budgets/budgets-page-view.tsx`
  - `apps/web/src/app/(dashboard)/finance/budgets/budgets-page.spec.tsx`
  - `apps/web/src/app/(dashboard)/finance/budgets/use-budgets-page-vm.ts`
  - `apps/web/src/app/(dashboard)/finance/budgets/use-budgets-page-vm.spec.ts`
  - `docs/user-stories/erp-page-reconstruction/03-p2-finance-and-platform.json`
  - `docs/ui/erp-page-design-route-map.md`
  - `scripts/ralph/log.md`
- 是否完成：部分完成，已达到 `visual-done`
- 最小验证：
  - `bun test apps/web/src/app/(dashboard)/finance/budgets/budgets-page.spec.tsx apps/web/src/app/(dashboard)/finance/budgets/use-budgets-page-vm.spec.ts`
- 备注：按设计节点 `iHpnf` 切到独立 page-level view + page-local seed VM；页面收口为标题区、白底表格卡片；没有搜索框、filter chips 和额外 toolbar；主按钮保持禁用态占位，列表不暴露 detail href，并通过真实 page.tsx 渲染测试确认无分页 footer 与 seed 行数据已接线；经核对设计节点当前结构不包含额外 seed notice，因此本轮不引入该区块；仍需真实 BFF 接线与最终设计核对后再评估 rebuilt。
- 下一轮建议：继续实现 `/integration/endpoints`，该页同属 `simple-list`，但当前错误地复用 settings/api-clients 页面，需要先对齐设计节点 `Cl9W4` 的标题、文案与列表列顺序。

## 2026-03-07 /integration/endpoints

- 处理 story：`route-integration-endpoints-list`
- 改动文件：
  - `apps/web/src/app/(dashboard)/integration/endpoints/page.tsx`
  - `apps/web/src/app/(dashboard)/integration/endpoints/endpoints-page.ts`
  - `apps/web/src/app/(dashboard)/integration/endpoints/endpoints-page-view.tsx`
  - `apps/web/src/app/(dashboard)/integration/endpoints/endpoints-page.spec.tsx`
  - `apps/web/src/app/(dashboard)/integration/endpoints/use-endpoints-page-vm.ts`
  - `apps/web/src/app/(dashboard)/integration/endpoints/use-endpoints-page-vm.spec.ts`
  - `apps/web/src/app/(dashboard)/finance/payments/payments-page.ts`
  - `apps/web/src/app/(dashboard)/finance/receipts/receipts-page.ts`
  - `docs/user-stories/erp-page-reconstruction/03-p2-finance-and-platform.json`
  - `docs/ui/erp-page-design-route-map.md`
  - `scripts/ralph/log.md`
- 是否完成：部分完成，已达到 `visual-done`
- 最小验证：
  - `bun test apps/web/src/app/(dashboard)/integration/endpoints/endpoints-page.spec.tsx apps/web/src/app/(dashboard)/integration/endpoints/use-endpoints-page-vm.spec.ts`
  - `bun run --filter web build`
- 备注：按设计节点 `Cl9W4` 切到独立 page-level view + page-local seed VM；页面收口为标题区、白底表格卡片；没有搜索框、filter chips 和额外 toolbar；主按钮保持禁用态占位，列表不暴露 detail href，并通过真实 page.tsx 渲染测试确认无分页 footer 与 seed 行数据已接线；同时按构建根因调查修复了 finance/payments 与 finance/receipts 对 shared types 的错误深路径导入。
- 下一轮建议：继续实现 `/mdm/organizations`，该页同属 `simple-list`，当前仍是 RoutePlaceholderPage，需要先对齐设计节点 `pDe3z` 的标题、副标题、按钮文案与列表列顺序。

## 2026-03-07 /mdm/users

- 处理 story：`route-mdm-users-list`
- 改动文件：
  - `apps/web/src/app/(dashboard)/mdm/users/page.tsx`
  - `apps/web/src/app/(dashboard)/mdm/users/users-page.ts`
  - `apps/web/src/app/(dashboard)/mdm/users/users-page-view.tsx`
  - `apps/web/src/app/(dashboard)/mdm/users/users-page.spec.tsx`
  - `apps/web/src/app/(dashboard)/mdm/users/use-users-page-vm.ts`
  - `apps/web/src/app/(dashboard)/mdm/users/use-users-page-vm.spec.ts`
  - `docs/user-stories/erp-page-reconstruction/04-domain-pages.json`
  - `docs/ui/erp-page-design-route-map.md`
  - `scripts/ralph/log.md`
- 是否完成：部分完成，已达到 `visual-done`
- 最小验证：
  - `bun test apps/web/src/app/(dashboard)/mdm/users/users-page.spec.tsx apps/web/src/app/(dashboard)/mdm/users/use-users-page-vm.spec.ts`
  - `bun run --filter web build`
- 备注：按设计节点 `UU4t0` 切到独立 page-level view + page-local seed VM；页面收口为标题区、白底表格卡片；没有搜索框、filter chips 和额外 toolbar；主按钮保持禁用态占位，列表不暴露 detail href，并通过真实 page.tsx 渲染测试确认无分页 footer 与 seed 行数据已接线；不再错误复用 settings/users 页面。
- 下一轮建议：继续实现 `/mdm/roles`，该页同属 `simple-list`，当前仍错误复用 settings/roles 页面，需要先对齐设计节点 `SNnic` 的标题、副标题、按钮文案与列表列顺序。

## 2026-03-07 /mdm/organizations

- 处理 story：`route-mdm-organizations-list`
- 改动文件：
  - `apps/web/src/app/(dashboard)/mdm/organizations/page.tsx`
  - `apps/web/src/app/(dashboard)/mdm/organizations/organizations-page.ts`
  - `apps/web/src/app/(dashboard)/mdm/organizations/organizations-page-view.tsx`
  - `apps/web/src/app/(dashboard)/mdm/organizations/organizations-page.spec.tsx`
  - `apps/web/src/app/(dashboard)/mdm/organizations/use-organizations-page-vm.ts`
  - `apps/web/src/app/(dashboard)/mdm/organizations/use-organizations-page-vm.spec.ts`
  - `docs/user-stories/erp-page-reconstruction/02-p1-core-pages.json`
  - `docs/ui/erp-page-design-route-map.md`
  - `scripts/ralph/log.md`
- 是否完成：部分完成，已达到 `visual-done`
- 最小验证：
  - `bun test apps/web/src/app/(dashboard)/mdm/organizations/organizations-page.spec.tsx apps/web/src/app/(dashboard)/mdm/organizations/use-organizations-page-vm.spec.ts`
  - `bun run --filter web build`
- 备注：按设计节点 `pDe3z` 切到独立 page-level view + page-local seed VM；页面收口为标题区、白底表格卡片；没有搜索框、filter chips 和额外 toolbar；主按钮保持禁用态占位，列表不暴露 detail href，并通过真实 page.tsx 渲染测试确认无分页 footer 与 seed 行数据已接线；根据代码审查修正了真实页断言，避免用副标题文本误命中列表内容。
- 下一轮建议：继续实现 `/mdm/users`，该页同属 `simple-list`，当前仍错误复用 settings/users 页面，需要先对齐设计节点 `UU4t0` 的标题、副标题、按钮文案与列表列顺序。

## 2026-03-07 /mdm/roles

- 处理 story：`route-mdm-roles-list`
- 改动文件：
  - `apps/web/src/app/(dashboard)/mdm/roles/page.tsx`
  - `apps/web/src/app/(dashboard)/mdm/roles/roles-page.ts`
  - `apps/web/src/app/(dashboard)/mdm/roles/roles-page-view.tsx`
  - `apps/web/src/app/(dashboard)/mdm/roles/roles-page.spec.tsx`
  - `apps/web/src/app/(dashboard)/mdm/roles/use-roles-page-vm.ts`
  - `apps/web/src/app/(dashboard)/mdm/roles/use-roles-page-vm.spec.ts`
  - `docs/user-stories/erp-page-reconstruction/04-domain-pages.json`
  - `docs/ui/erp-page-design-route-map.md`
  - `scripts/ralph/log.md`
- 是否完成：部分完成，已达到 `visual-done`
- 最小验证：
  - `bun test apps/web/src/app/(dashboard)/mdm/roles/roles-page.spec.tsx apps/web/src/app/(dashboard)/mdm/roles/use-roles-page-vm.spec.ts`
  - `bun run --filter web build`
- 备注：按设计节点 `SNnic` 切到独立 page-level view + page-local seed VM；页面收口为标题区、白底表格卡片；没有搜索框、filter chips 和额外 toolbar；主按钮保持禁用态占位，列表不暴露 detail href，并通过真实 page.tsx 渲染测试确认无分页 footer 与 seed 行数据已接线；同时修正了 real-page 测试中对“权限配置”文案的误伤断言，避免把设计副标题当成旧 settings 分栏残留。
- 下一轮建议：继续实现 `/mdm/suppliers`，该页回到 `search-list`，当前仍错误复用 settings/master-data 页面，需要先对齐设计节点 `Iz7xv` 的标题、搜索区与列表列顺序。

## 2026-03-07 /mdm/suppliers

- 处理 story：`route-mdm-suppliers-list`
- 改动文件：
  - `apps/web/src/app/(dashboard)/mdm/suppliers/page.tsx`
  - `apps/web/src/app/(dashboard)/mdm/suppliers/suppliers-page.ts`
  - `apps/web/src/app/(dashboard)/mdm/suppliers/suppliers-page-view.tsx`
  - `apps/web/src/app/(dashboard)/mdm/suppliers/suppliers-page.spec.tsx`
  - `apps/web/src/app/(dashboard)/mdm/suppliers/use-suppliers-page-vm.ts`
  - `apps/web/src/app/(dashboard)/mdm/suppliers/use-suppliers-page-vm.spec.ts`
  - `docs/user-stories/erp-page-reconstruction/04-domain-pages.json`
  - `docs/ui/erp-page-design-route-map.md`
  - `scripts/ralph/log.md`
- 是否完成：部分完成，已达到 `visual-done`
- 最小验证：
  - `bun test apps/web/src/app/(dashboard)/mdm/suppliers/suppliers-page.spec.tsx apps/web/src/app/(dashboard)/mdm/suppliers/use-suppliers-page-vm.spec.ts`
  - `bun run --filter web build`
- 备注：按设计节点 `Iz7xv` 切到独立 page-level view + page-local seed VM；页面收口为标题区、单搜索框、白底表格卡片；主按钮保持禁用态占位，列表保留 detail href，并通过真实 page.tsx 渲染测试确认不再回退到 settings/master-data 工作台；当前搜索通过 URL `keyword` 参数编码并驱动本地过滤，仍需真实 BFF 接线与最终设计核对后再评估 rebuilt。
- 下一轮建议：继续实现下一个仍处于 placeholder / wrong 的列表页，优先回到 inventory 或 procure 域中仍未复刻的 T2 页面。

## 2026-03-07 /workflow/tasks

- 处理 story：`route-workflow-tasks-list`
- 改动文件：
  - `apps/web/src/app/(dashboard)/workflow/tasks/page.tsx`
  - `apps/web/src/app/(dashboard)/workflow/tasks/tasks-page.ts`
  - `apps/web/src/app/(dashboard)/workflow/tasks/tasks-page-view.tsx`
  - `apps/web/src/app/(dashboard)/workflow/tasks/tasks-page.spec.tsx`
  - `apps/web/src/app/(dashboard)/workflow/tasks/use-tasks-page-vm.ts`
  - `apps/web/src/app/(dashboard)/workflow/tasks/use-tasks-page-vm.spec.ts`
  - `docs/user-stories/erp-page-reconstruction/02-p1-core-pages.json`
  - `docs/ui/erp-page-design-route-map.md`
  - `scripts/ralph/log.md`
- 是否完成：部分完成，已达到 `visual-done`
- 最小验证：
  - `bun test apps/web/src/app/(dashboard)/workflow/tasks/tasks-page.spec.tsx apps/web/src/app/(dashboard)/workflow/tasks/use-tasks-page-vm.spec.ts`
  - `bun run --filter web build`
- 备注：按审批任务列表设计切到独立 page-level view + page-local seed VM；页面收口为标题区、单搜索框、scope filter chips、白底表格卡片；通过 TDD 先补失败测试，再实现 URL `keyword` / `scope` 编解码、本地过滤与真实 page.tsx 接线；根据代码审查补了“当前输入态立即过滤”的纯函数测试与实现，避免列表必须等 URL debounce 后才更新，同时为 chip 补上 `aria-pressed` 可访问性状态；仍需真实 BFF 接线与最终设计核对后再评估 rebuilt。
- 下一轮建议：继续实现下一张仍处于 placeholder / wrong 的 T2 列表页，优先回到 inventory / procure 域未复刻页面。