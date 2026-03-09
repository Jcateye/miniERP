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
- 备注：按设计节点 `ZvGFp` 切到独立 page-level view + page-local seed VM；页面收口为标题区、演示数据提示、白底表格卡片；没有搜索框、filter chips 和额外 toolbar；根据代码审查显式披露 seed/mock 状态，并禁用仍指向placeholder 的新建/详情入口；未知状态文案改为显式 fallback，Suspense fallback 不再返回空白。
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

## 2026-03-08 /manufacturing/overview

- 处理 story：`route-manufacturing-overview`
- 改动文件：
  - `apps/web/src/app/(dashboard)/manufacturing/overview/page.tsx`
  - `apps/web/src/app/(dashboard)/manufacturing/overview/manufacturing-overview-page.ts`
  - `apps/web/src/app/(dashboard)/manufacturing/overview/manufacturing-overview-page-view.tsx`
  - `apps/web/src/app/(dashboard)/manufacturing/overview/manufacturing-overview-page.spec.tsx`
  - `docs/ui/erp-page-design-route-map.md`
  - `docs/plans/2026-03-07-erp-page-reconstruction-design.md`
  - `scripts/ralph/log.md`
- 是否完成：部分完成，已达到 `visual-done`
- 最小验证：
  - `bun test apps/web/src/app/(dashboard)/manufacturing/overview/manufacturing-overview-page.spec.tsx`
  - `bun run --filter web build`
- 备注：按制造概览 T1 语义切到独立 page-level view；页面收口为标题区、指标卡区与制造域入口卡区；通过 TDD 先写失败测试并确认仍在渲染 placeholder 壳，再做最小实现切断 `RoutePlaceholderPage` 路径；同时补一条路径约束测试，避免把“工单”入口挂到当前不存在的 `/manufacturing/work-orders/wip`，改为先回落到已落地的 `/manufacturing/orders` 入口；仍需后续按设计稿细化真实 overview 信息架构与 BFF 接线后再评估 rebuilt。
- 下一轮建议：继续实现 `/quality/records/:id`，它仍是最靠前的详情 placeholder 之一。

## 2026-03-08 /quality/records/:id

- 处理 story：`route-quality-record-detail`
- 改动文件：
  - `apps/web/src/app/(dashboard)/quality/records/[id]/page.tsx`
  - `apps/web/src/app/(dashboard)/quality/records/[id]/quality-record-detail-page.ts`
  - `apps/web/src/app/(dashboard)/quality/records/[id]/quality-record-detail-page-view.tsx`
  - `apps/web/src/app/(dashboard)/quality/records/[id]/quality-record-detail-page.spec.tsx`
  - `docs/ui/erp-page-design-route-map.md`
  - `docs/plans/2026-03-07-erp-page-reconstruction-design.md`
  - `scripts/ralph/log.md`
- 是否完成：部分完成，已达到 `visual-done`
- 最小验证：
  - `bun test apps/web/src/app/(dashboard)/quality/records/[id]/quality-record-detail-page.spec.tsx`
  - `bun run --filter web build`
- 备注：按质检记录详情 T3 语义切到独立 page-level view；页面收口为标题区、摘要卡区与 detail sections 区；通过 TDD 先写失败测试并确认仍在渲染 placeholder 壳，再做最小实现切断 `RoutePlaceholderPage` 路径；随后根据代码审查补了动态 ID 约束测试，避免详情页忽略 `[id]` 并输出固定伪真实记录；当前摘要区使用 `params.id` 和“待接入”中性占位文案，四个详情区块统一声明待接入真实数据，回退入口返回 `/quality/records`；仍需后续按设计稿细化详情结构与真实 BFF 接线后再评估 rebuilt。
- 下一轮建议：继续实现 `/manufacturing/orders/:id`，它是当前剩余 placeholder 中最靠前的生产详情页。

## 2026-03-08 /manufacturing/orders/:id

- 处理 story：`route-manufacturing-order-detail`
- 改动文件：
  - `apps/web/src/app/(dashboard)/manufacturing/orders/[id]/page.tsx`
  - `apps/web/src/app/(dashboard)/manufacturing/orders/[id]/manufacturing-order-detail-page.ts`
  - `apps/web/src/app/(dashboard)/manufacturing/orders/[id]/manufacturing-order-detail-page-view.tsx`
  - `apps/web/src/app/(dashboard)/manufacturing/orders/[id]/manufacturing-order-detail-page.spec.tsx`
  - `docs/ui/erp-page-design-route-map.md`
  - `docs/plans/2026-03-07-erp-page-reconstruction-design.md`
  - `scripts/ralph/log.md`
- 是否完成：部分完成，已达到 `visual-done`
- 最小验证：
  - `bun test apps/web/src/app/(dashboard)/manufacturing/orders/[id]/manufacturing-order-detail-page.spec.tsx`
  - `bun run --filter web build`
- 备注：参照 `.pen` 中 `采购单详情` 与 `SKU详情页` 的 T3 结构切到独立 page-level view；页面收口为标题区、摘要卡区与 detail sections 区；通过 TDD 先写失败测试并确认仍在渲染 placeholder 壳，再做最小实现切断 `RoutePlaceholderPage` 路径；随后根据代码审查补了标题层与动作语义约束，当前主标题直接消费 `params.id`，副标题使用“生产订单详情 · 详情数据接入中”，摘要区和四个详情区块统一使用中性占位文案承接“工单 / 领退料 / 报工 / 完工入库”四类制造详情信息，主动作收口为“操作待接入”，回退入口返回 `/manufacturing/orders`；仍需后续按设计稿细化详情结构与真实 BFF 接线后再评估 rebuilt。
- 下一轮建议：继续实现 `/manufacturing/work-orders/:id`，它是当前剩余 placeholder 中最靠前的详情页。

## 2026-03-08 /manufacturing/work-orders/:id

- 处理 story：`route-manufacturing-work-order-detail`
- 改动文件：
  - `apps/web/src/app/(dashboard)/manufacturing/work-orders/[id]/page.tsx`
  - `apps/web/src/app/(dashboard)/manufacturing/work-orders/[id]/work-order-detail-page.ts`
  - `apps/web/src/app/(dashboard)/manufacturing/work-orders/[id]/work-order-detail-page-view.tsx`
  - `apps/web/src/app/(dashboard)/manufacturing/work-orders/[id]/work-order-detail-page.spec.tsx`
  - `docs/ui/erp-page-design-route-map.md`
  - `docs/plans/2026-03-07-erp-page-reconstruction-design.md`
  - `scripts/ralph/log.md`
- 是否完成：部分完成，已达到 `visual-done`
- 最小验证：
  - `bun test apps/web/src/app/(dashboard)/manufacturing/work-orders/[id]/work-order-detail-page.spec.tsx`
  - `bun run --filter web build`
- 备注：沿用已验证的 T3 详情视觉范式并参照 `.pen` 中 `采购单详情` / `SKU详情页` 的结构切到独立 page-level view；页面收口为标题区、摘要卡区与 detail sections 区；通过 TDD 先写失败测试并确认仍在渲染 placeholder 壳，再做最小实现切断 `RoutePlaceholderPage` 路径；当前主标题直接消费 `params.id`，副标题使用“工单详情 · 详情数据接入中”，摘要区与四个详情区块统一使用中性占位文案承接“工序 / 工作中心 / 报工结果 / 质量记录”四类工单详情信息，主动作收口为“操作待接入”，回退入口返回 `/manufacturing/orders`；仍需后续按设计稿细化详情结构与真实 BFF 接线后再评估 rebuilt。
- 下一轮建议：继续实现 `/integration/logs`，它是当前 remaining 列表里最靠前的 missing 页面。

## 2026-03-08 /integration/logs

- 处理 story：`route-integration-logs-list`
- 改动文件：
  - `apps/web/src/app/(dashboard)/integration/logs/page.tsx`
  - `apps/web/src/app/(dashboard)/integration/logs/logs-page.ts`
  - `apps/web/src/app/(dashboard)/integration/logs/logs-page-view.tsx`
  - `apps/web/src/app/(dashboard)/integration/logs/logs-page.spec.tsx`
  - `docs/ui/erp-page-design-route-map.md`
  - `docs/plans/2026-03-07-erp-page-reconstruction-design.md`
  - `scripts/ralph/log.md`
- 是否完成：部分完成，已达到 `visual-done`
- 最小验证：
  - `bun test apps/web/src/app/(dashboard)/integration/logs/logs-page.spec.tsx`
  - `bun run --filter web build`
- 备注：对齐 `.pen` 节点 `f5AJm / API调用日志`，把原本 missing 的 route 落地为独立 page-level view；页面收口为标题区、过滤区与白底表格区；通过 TDD 先写失败测试并确认缺少 `page.tsx`，再做最小实现补齐 route、contract、scaffold 与 seed 列表；当前列表以 page-local seed 行数据承接“时间 / Client ID / Query 类型 / 状态”四列，过滤区与表头语义已按设计稿收口，仍需后续按设计稿细化真实筛选交互与 BFF 接线后再评估 rebuilt。

## 2026-03-08 /inventory/ledger

- 处理 story：`route-inventory-ledger-list`
- 改动文件：
  - `apps/web/src/app/(dashboard)/inventory/ledger/page.tsx`
  - `apps/web/src/app/(dashboard)/inventory/ledger/ledger-page.ts`
  - `apps/web/src/app/(dashboard)/inventory/ledger/ledger-page-view.tsx`
  - `apps/web/src/app/(dashboard)/inventory/ledger/ledger-page.spec.tsx`
  - `docs/ui/erp-page-design-route-map.md`
  - `docs/plans/2026-03-07-erp-page-reconstruction-design.md`
  - `scripts/ralph/log.md`
- 是否完成：部分完成，已达到 `visual-done`
- 最小验证：
  - `bun test apps/web/src/app/(dashboard)/inventory/ledger/ledger-page.spec.tsx`
  - `bun run --filter web build`
- 备注：对齐 `.pen` 节点 `uXmfG / 库存流水`，把原本走 legacy `WorkbenchAssembly` 的 route 切到独立 page-level view；页面收口为标题区、单搜索框与白底表格区；通过 TDD 先写失败测试并确认缺少 page-local contract / view，再做最小实现补齐 route、contract、scaffold 与 seed 列表；随后根据代码审查补齐标题区“导出”按钮、副标题 `Inventory Ledger · 全量流水审计`，并把列头语义收口为“日期 / 物料编号 / 仓库 / 事务类型 / 方向 / 数量 / 来源单据 / 操作人”；仍需后续按设计稿细化真实搜索交互与 BFF 接线后再评估 rebuilt。

## 2026-03-08 /sales/quotations

- 处理 story：`route-sales-quotations-list`
- 改动文件：
  - `apps/web/src/app/(dashboard)/sales/quotations/page.tsx`
  - `apps/web/src/app/(dashboard)/sales/quotations/quotations-page.ts`
  - `apps/web/src/app/(dashboard)/sales/quotations/quotations-page-view.tsx`
  - `apps/web/src/app/(dashboard)/sales/quotations/use-quotations-page-vm.ts`
  - `apps/web/src/app/(dashboard)/sales/quotations/quotations-page.spec.tsx`
  - `docs/ui/erp-page-design-route-map.md`
  - `docs/plans/2026-03-07-erp-page-reconstruction-design.md`
  - `scripts/ralph/log.md`
- 是否完成：部分完成，已达到 `visual-done`
- 最小验证：
  - `bun test apps/web/src/app/(dashboard)/sales/quotations/quotations-page.spec.tsx`
  - `bun run --filter web build`
- 备注：对齐 `.pen` 节点 `CcBKg / 报价列表`，把原本走 legacy `WorkbenchAssembly` 的 route 切到独立 page-level view；页面收口为标题区、主按钮、单搜索框、filter chips 与白底表格区；通过 TDD 先写失败测试并确认缺少 page-local contract / view，再做最小实现补齐 route、contract、scaffold、URL state VM 与 seed 列表；当前已支持 `keyword` / `filter` URL 编码与回放，列表以 page-local seed 行数据承接“报价编号 / 客户 / 报价日期 / 有效期至 / 金额 / 版本 / 状态”七列，并按设计稿收口为 `全部 / 草稿 / 已发送 / 已接受` 四个 chips 与“共 56 个报价”计数文案；仍需后续按设计稿细化真实搜索与筛选交互、以及 BFF 接线后再评估 rebuilt。

## 2026-03-08 /inventory/counts

- 处理 story：`route-inventory-counts-list`
- 改动文件：
  - `apps/web/src/app/(dashboard)/inventory/counts/page.tsx`
  - `apps/web/src/app/(dashboard)/inventory/counts/counts-page.ts`
  - `apps/web/src/app/(dashboard)/inventory/counts/counts-page-view.tsx`
  - `apps/web/src/app/(dashboard)/inventory/counts/use-counts-page-vm.ts`
  - `apps/web/src/app/(dashboard)/inventory/counts/counts-page.spec.tsx`
  - `docs/ui/erp-page-design-route-map.md`
  - `docs/plans/2026-03-07-erp-page-reconstruction-design.md`
  - `scripts/ralph/log.md`
- 是否完成：部分完成，已达到 `visual-done`
- 最小验证：
  - `bun test apps/web/src/app/(dashboard)/inventory/counts/counts-page.spec.tsx`
  - `bun run --filter web build`
- 备注：对齐 `.pen` 节点 `ZpTcS / 盘点列表`，把原本 re-export 到旧 `stocktake` 的 route 切到独立 page-level view；页面收口为标题区、主按钮、单搜索框、filter chips 与白底表格区；通过 TDD 先写失败测试并确认缺少 page-local contract / view，再做最小实现补齐 route、contract、scaffold、URL state VM 与 seed 列表；当前列表以 page-local seed 行数据承接“盘点编号 / 仓库 / 日期 / 盘点行 / 差异数 / 负责人 / 状态”七列，并按设计稿收口为 `全部 / 进行中 / 已过账` 三个 chips 与“共 23 条盘点单”计数文案；仍需后续按设计稿细化真实筛选交互、以及 BFF 接线后再评估 rebuilt。

## 2026-03-08 /sales/orders

- 处理 story：`route-sales-orders-list`
- 改动文件：
  - `apps/web/src/app/(dashboard)/sales/orders/page.tsx`
  - `apps/web/src/app/(dashboard)/sales/orders/orders-page.ts`
  - `apps/web/src/app/(dashboard)/sales/orders/orders-page-view.tsx`
  - `apps/web/src/app/(dashboard)/sales/orders/use-orders-page-vm.ts`
  - `apps/web/src/app/(dashboard)/sales/orders/orders-page.spec.tsx`
  - `docs/ui/erp-page-design-route-map.md`
  - `docs/plans/2026-03-07-erp-page-reconstruction-design.md`
  - `scripts/ralph/log.md`
- 是否完成：部分完成，已达到 `visual-done`
- 最小验证：
  - `bun test apps/web/src/app/(dashboard)/sales/orders/orders-page.spec.tsx`
  - `bun run --filter web build`
- 备注：对齐 `.pen` 节点 `TjfjQ / 销售订单列表`，把原本 re-export 到旧 `sales/so` 的 route 切到独立 page-level view；页面收口为标题区、主按钮、单搜索框、filter chips 与白底表格区；通过 TDD 先写失败测试并确认缺少 page-local contract / view，再做最小实现补齐 route、contract、scaffold、URL state VM 与 seed 列表；当前已支持 `keyword` / `filter` URL 编码与回放，列表以 page-local seed 行数据承接“SO 编号 / 客户 / 下单日期 / 金额 / 交期 / 状态 / 操作”七列，并按设计稿收口为 `全部 / 待确认 / 已确认 / 已发运` 四个 chips 与“共 89 个 SO · 显示 1-20”计数文案；仍需后续按设计稿细化真实搜索与筛选交互、以及 BFF 接线后再评估 rebuilt。

## 2026-03-08 /reports

- 处理 story：`route-reports-hub`
- 改动文件：
  - `apps/web/src/app/(dashboard)/reports/page.tsx`
  - `apps/web/src/app/(dashboard)/reports/reports-page.ts`
  - `apps/web/src/app/(dashboard)/reports/reports-page-view.tsx`
  - `apps/web/src/app/(dashboard)/reports/reports-page.spec.tsx`
  - `docs/ui/erp-page-design-route-map.md`
  - `docs/plans/2026-03-07-erp-page-reconstruction-design.md`
  - `scripts/ralph/log.md`
- 是否完成：部分完成，已达到 `visual-done`
- 最小验证：
  - `bun test apps/web/src/app/(dashboard)/reports/reports-page.spec.tsx`
  - `bun run --filter web build`

## 2026-03-08 /procure/purchase-orders

- 处理 story：`route-procure-purchase-orders-list`
- 改动文件：
  - `apps/web/src/app/(dashboard)/procure/purchase-orders/page.tsx`
  - `apps/web/src/app/(dashboard)/procure/purchase-orders/purchase-orders-page.ts`
  - `apps/web/src/app/(dashboard)/procure/purchase-orders/purchase-orders-page-view.tsx`
  - `apps/web/src/app/(dashboard)/procure/purchase-orders/use-purchase-orders-page-vm.ts`
  - `apps/web/src/app/(dashboard)/procure/purchase-orders/purchase-orders-page.spec.tsx`
  - `docs/ui/erp-page-design-route-map.md`
  - `docs/plans/2026-03-07-erp-page-reconstruction-design.md`
  - `scripts/ralph/log.md`
- 是否完成：部分完成，已达到 `visual-done`
- 最小验证：
  - `bun test apps/web/src/app/(dashboard)/procure/purchase-orders/purchase-orders-page.spec.tsx`
  - `bun run --filter web build`
- 备注：对齐 `.pen` 节点 `jJvEC / 采购单列表`，把原本 re-export 到旧 `purchasing/po` 的 route 切到独立 page-level view；页面收口为标题区、主按钮、单搜索框、filter chips 与白底表格区；通过 TDD 先写失败测试并确认缺少 page-local contract / view，再做最小实现补齐 route、contract、scaffold、URL state VM 与 seed 列表；当前已支持 `keyword` / `filter` URL 编码与回放，列表以 page-local seed 行数据承接“PO 编号 / 供应商 / 下单日期 / 金额 / 行数 / 状态 / 操作”七列，并按设计稿收口为 `全部 / 草稿 / 待审批 / 已批准 / 已完成` 五个 chips 与“共 134 个 PO · 显示 1-20”计数文案；仍需后续按设计稿细化真实搜索与筛选交互、以及 BFF 接线后再评估 rebuilt。

## 2026-03-08 /sales/shipments

- 处理 story：`route-sales-shipments-list`
- 改动文件：
  - `apps/web/src/app/(dashboard)/sales/shipments/page.tsx`
  - `apps/web/src/app/(dashboard)/sales/shipments/shipments-page.ts`
  - `apps/web/src/app/(dashboard)/sales/shipments/shipments-page-view.tsx`
  - `apps/web/src/app/(dashboard)/sales/shipments/use-shipments-page-vm.ts`
  - `apps/web/src/app/(dashboard)/sales/shipments/shipments-page.spec.tsx`
  - `docs/ui/erp-page-design-route-map.md`
  - `docs/plans/2026-03-07-erp-page-reconstruction-design.md`
  - `scripts/ralph/log.md`
- 是否完成：部分完成，已达到 `visual-done`
- 最小验证：
  - `bun test apps/web/src/app/(dashboard)/sales/shipments/shipments-page.spec.tsx`
  - `bun run --filter web build`
- 备注：对齐 `.pen` 节点 `opaZ4 / 发运列表`，把原本 re-export 到旧 `sales/out` 的 route 切到独立 page-level view；页面收口为标题区、主按钮、单搜索框、filter chips 与白底表格区；通过 TDD 先写失败测试并确认缺少 page-local contract / view，再做最小实现补齐 route、contract、scaffold、URL state VM 与 seed 列表；当前已支持 `keyword` / `filter` URL 编码与回放，列表以 page-local seed 行数据承接“发运编号 / 客户 / 关联SO / 数量 / 物流单号 / 状态 / 操作”七列，并按设计稿收口为 `全部 / 待拣货 / 已拣货 / 已发出` 四个 chips 与“共 67 条发运单”计数文案；仍需后续按设计稿细化真实搜索与筛选交互、以及 BFF 接线后再评估 rebuilt。

## 2026-03-08 /workspace

- 处理 story：`route-workspace-home`
- 改动文件：
  - `apps/web/src/app/(dashboard)/workspace/page.tsx`
  - `apps/web/src/app/(dashboard)/workspace/workspace-home-page.ts`
  - `apps/web/src/app/(dashboard)/workspace/workspace-home-page-view.tsx`
  - `apps/web/src/app/(dashboard)/workspace/workspace-home-page.spec.tsx`
  - `docs/ui/erp-page-design-route-map.md`
  - `docs/plans/2026-03-07-erp-page-reconstruction-design.md`
  - `scripts/ralph/log.md`
- 是否完成：部分完成，已达到 `visual-done`
- 最小验证：
  - `bun test apps/web/src/app/(dashboard)/workspace/workspace-home-page.spec.tsx`
  - `bun run --filter web build`
- 备注：对齐 `.pen` 节点 `YAVSY / 工作台首页`，把原本 re-export 到旧 dashboard 首页的 route 切到独立 page-level view；页面收口为标题区、搜索区、4 张 KPI 卡、全局待办区与右侧快捷入口/最近动作区；通过 TDD 先写失败测试并确认缺少 page-local contract / view，再做最小实现补齐 route、contract 与 scaffold；当前页面内容已按设计稿收口到 `工作台 / 2026年2月28日 · 周五 · 下午 / 全局搜索 SKU / 单号 / 供应商…` 与 `低库存 SKU / 待入库 GRN / 待出库 OUT / 延迟 PO` 等关键语义，仍需后续按设计稿细化真实搜索交互与数据接线后再评估 rebuilt。

## 2026-03-08 /evidence/assets

- 处理 story：`route-evidence-assets-list`
- 改动文件：
  - `apps/web/src/app/(dashboard)/evidence/assets/page.tsx`
  - `apps/web/src/app/(dashboard)/evidence/assets/evidence-assets-page.ts`
  - `apps/web/src/app/(dashboard)/evidence/assets/evidence-assets-page-view.tsx`
  - `apps/web/src/app/(dashboard)/evidence/assets/use-evidence-assets-page-vm.ts`
  - `apps/web/src/app/(dashboard)/evidence/assets/evidence-assets-page.spec.tsx`
  - `docs/ui/erp-page-design-route-map.md`
  - `docs/plans/2026-03-07-erp-page-reconstruction-design.md`
  - `scripts/ralph/log.md`
- 是否完成：部分完成，已达到 `visual-done`
- 最小验证：
  - `bun test apps/web/src/app/(dashboard)/evidence/assets/evidence-assets-page.spec.tsx`
  - `bun run --filter web build`
- 备注：对齐 `.pen` 节点 `QsvNw / 附件管理工作台`，把原本 re-export 到旧 `attachments` 的 route 切到独立 page-level view；页面收口为标题区、单搜索框、filter chips 与白底表格区；通过 TDD 先写失败测试并确认缺少 page-local contract / view，再做最小实现补齐 route、contract、scaffold、URL state VM 与 seed 列表；当前列表以 page-local seed 行数据承接“文件名 / 所属单据 / 上传时间 / 大小 / 操作”五列，并按设计稿收口为 `文档记录 / 制造资产 / 事件日志` 三个 chips，仍需后续按设计稿细化真实筛选交互与 BFF 接线后再评估 rebuilt。
