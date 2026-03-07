# ERP 页面重构设计（2026-03-07）

## 1. 背景与问题定义

当前 dashboard 大量页面并没有复刻 pencil 设计稿，而是在运行一套通用模板壳：

- 路由页直接返回 `WorkbenchAssembly` / `OverviewAssembly`
- `WorkbenchAssembly` / `OverviewAssembly` 再套 `WorkbenchLayout` / `OverviewLayout`
- `erp-page-config.tsx` 提供静态 rows / columns / drawerFields / bulkHint / placeholder 文案

这条路径产出的页面更接近“开发脚手架/模板页”，而不是设计稿中的正式生产页面。用户实际看到的“筛选与视图”“列表结果”“选中摘要”“批量操作提示”等结构，来自模板装配器本身，而不是逐页设计实现。

### 根因总结

1. 当前 `WorkbenchAssembly` / `OverviewAssembly` 是通用模板壳，而非逐页页面实现。
2. 当前 `erp-page-config.tsx` 承载的是模板配置与静态示例内容，不是设计稿结构。
3. 最近大量 dashboard 页面只是把路由切换到了通用装配器。
4. 运行时代码没有直接按 `.pen` 设计稿逐页落地的页面实现层。

### 设计目标

本次重构的目标不是微调模板，而是纠正页面层抽象方向：

- 页面必须复刻设计稿
- 允许抽取共用 primitives / shells / 局部业务块
- 禁止再用一个万能 assembly 套所有页面
- 保留 T1/T2/T3/T4 的 family 治理，但重写其定义

---

## 2. 重构原则

### 2.1 页面复刻优先

设计稿不是参考图，而是目标形态。页面完成标准必须包含：

- 视觉结构与设计稿一致
- 页面层级与交互位置与设计稿一致
- 不再出现模板壳痕迹

### 2.2 适度复用

可以抽象共用组件的地方：

- Sidebar
- Top bar / title block
- Search / filter row primitives
- Table primitives
- Status badge
- Button / input / card / section container
- Empty state / info strip

但禁止抽象出新的“万能整页装配器”。

### 2.3 Family 只治理骨架

保留 T1/T2/T3/T4，但 family 只用于治理页面骨架：

- 不绑定固定 slot 列表
- 不绑定固定组件名
- 不作为页面具体 UI 的直接定义

### 2.4 数据路径与工程红线保持不变

以下约束继续保留：

- 列表页筛选/排序/分页必须 URL 化
- 页面只通过 BFF 访问数据
- 前端状态枚举来自 `packages/shared`
- posting / inventory / audit / tenant 等工程红线不变

---

## 3. 新的 T1 / T2 / T3 / T4 定义

## 3.1 T1 = Hub / Dashboard

### 适用页面

- 工作台首页
- 各业务域 overview
- 配置中心首页
- 聚合型 dashboard

### 稳定骨架

1. Sidebar
2. Top bar / page header
3. Summary/KPI row（可选）
4. Flexible content region

### 约束

- 主内容必须是聚合视图
- 允许多个卡片区块自由组合
- 不强制要求 search / todo / timeline / quick actions

### 允许变体

- `default`
- `home`
- `subnav`

### 说明

旧 `OverviewLayout` 的固定 search/todo/quickActions/timeline 心智不再作为正式定义。

## 3.2 T2 = List / Index

### 适用页面

- 客户 / 供应商 / 仓库 / 用户 / 角色 / 组织 列表
- 收款 / 付款 / 科目表 / 成本中心 / 预算 / 发票 / 分录 列表
- 工单 / 任务 / 记录 / 集成端点 / 发运等索引页

### 稳定骨架

1. Sidebar
2. Top bar / page header
3. Optional search/filter row
4. Main table/list card（全宽主区域）

### 约束

- 核心任务是检索 / 浏览 / 进入详情或执行操作
- 列表状态必须 URL 化
- table/list 区域必须是主角
- search/filter 是可选增强，不是固定模板区块

### 允许变体

- `simple-list`
- `search-list`
- `filter-list`
- `action-list`
- `tree-list`

### 说明

旧 `WorkbenchLayout` 的 `detailDrawer` / `bulkBar` 不再是 T2 必备结构。

## 3.3 T3 = Detail / Record

### 适用页面

- 单据详情
- 主数据详情
- 实体详情页

### 稳定骨架

1. Sidebar
2. Header / meta
3. Main detail sections
4. Optional tabs / side panels / related sections

### 约束

- 围绕单个实体展开
- header 区承接状态、动作、标识信息
- 内容区按信息层次组织，不强制固定两栏或三栏

### 允许变体

- `record-detail`
- `document-detail`
- `masterdata-detail`
- `tabbed-detail`

## 3.4 T4 = Flow / Wizard

### 适用页面

- 新建单据
- 多步骤录入
- 过账流程
- 差异处理
- 证据补录流程
- 审批/提交向导

### 稳定骨架

1. Sidebar
2. Header / progress / step context
3. Editor area
4. Summary / action area

### 约束

- 页面目标必须是完成一段流程
- 必须能表达步骤状态或阶段语义
- 必须承接保存、提交、回退、校验等流程动作

### 允许变体

- `linear-wizard`
- `posting-flow`
- `review-submit`
- `evidence-flow`

---

## 4. 新的前端页面分层架构

### 4.1 Design source layer

来源：

- `.pen` 设计稿
- `designs/ui/*`
- 页面映射表（`docs/ui/erp-page-design-route-map.md`）

职责：

- 定义目标页面长相
- 定义 family 归类
- 定义页面是否进入正式复刻范围

### 4.2 Family shell layer

只负责骨架，不负责具体页面内容。

建议形成：

- `T1HubShell`
- `T2ListShell`
- `T3DetailShell`
- `T4FlowShell`

职责包括：

- sidebar 容器
- main 区域
- header 区域
- 内容主容器的宽度、间距、网格关系

### 4.3 Primitive layer

复用应发生在稳定共性上。

建议抽取：

- `DashboardSidebar`
- `PageTopBar`
- `PageTitleBlock`
- `PrimaryActionButton`
- `SecondaryActionButton`
- `SearchField`
- `FilterChip`
- `FilterRow`
- `DataTable`
- `StatusBadge`
- `MetricCard`
- `SectionCard`
- `EmptyState`
- `InfoStrip`

### 4.4 Page view layer

这是正式页面主实现层。每个页面拥有明确 view：

- `CustomerListView`
- `WarehouseListView`
- `ReceiptListView`
- `FinanceOverviewView`
- 等

正式页面必须按设计稿逐页复刻。

### 4.5 Page route layer

`page.tsx` 只负责：

- 调用 VM hook / BFF hook
- 把数据组织成 view props
- 渲染对应 page view

### 4.6 Data semantics/config layer

保留配置，但只保留数据语义：

- route meta
- 列定义 schema
- filter schema
- action schema
- 字段映射

不再承载整页视觉结构与模板文案。

---

## 5. 文档先行治理（Phase 0）

在代码重构前，必须先同步规则文档，防止其他 agent 继续沿用旧路线。

### 需要同步更新的文档

- `CLAUDE.md`
- `.claude/rules/erp-rules.md`
- `README.md`
- `AGENTS.md`
- `CLAW.md`

### 文档必须新增/替换的事实

1. 保留 T1/T2/T3/T4，但旧定义失效，进入重写。
2. family 只约束骨架，不约束具体 UI。
3. 正式页面必须复刻 pencil 设计稿。
4. 允许抽 primitives / shells / 局部业务块。
5. 禁止再用一个万能 assembly 套所有页面。
6. `WorkbenchAssembly / OverviewAssembly` 降级为 legacy/fallback only。

### 预期效果

- 先冻结旧路线
- 给后续 agent 明确新约束
- 避免继续往 `erp-page-config.tsx` 和通用 assembly 堆页面

---

## 6. 分阶段实施蓝图

## Phase 0：文档先行治理

先改规则文档，统一新路线。

## Phase 1：建立页面映射表

建立 route 与设计稿节点的一一对应，至少包含：

- route
- family
- variant
- design node id
- 当前状态（legacy / wrong / in-progress / rebuilt）
- 数据来源（mock / BFF / live）

首份落盘映射表见：`docs/ui/erp-page-design-route-map.md`。

示例：

- `/mdm/customers` → `T2/search-list` → `iYRfh`
- `/mdm/warehouses` → `T2/search-list` → `S8YEo`
- `/finance/receipts` → `T2/simple-list` → `ZvGFp`
- `/finance/gl-accounts` → `T2/tree-list` → `Ch7yZ`

## Phase 2：抽最小可复用骨架

先抽稳定 primitives / shells：

- Sidebar
- Top bar
- Search/filter row primitives
- Table primitives
- Status badge
- Button / card / empty state

禁止在这一阶段抽出新的万能整页装配器。

## Phase 3：优先重构 T2 列表页

### 第一批顺序

#### A 组：主数据列表页
1. `/mdm/customers`
2. `/mdm/suppliers`
3. `/mdm/warehouses`
4. `/mdm/users`
5. `/mdm/roles`
6. `/mdm/organizations`

#### B 组：财务列表页
7. `/finance/receipts`
8. `/finance/payments`
9. `/finance/gl-accounts`
10. `/finance/cost-centers`
11. `/finance/budgets`
12. `/finance/invoices`
13. `/finance/journals`

#### C 组：运营类列表页
14. `/workflow/tasks`
15. `/integration/endpoints`
16. `/inventory/replenishment`
17. `/inventory/adjustments`
18. `/manufacturing/orders`
19. `/quality/records`
20. `/sales/shipments`

### 每页统一动作

1. 确认设计稿节点
2. 编写该页自己的 `PageView`
3. 复用局部 primitives / shell
4. route `page.tsx` 改为渲染该页 view
5. 保持 URL state / BFF / shared status 约束

## Phase 4：重构 T1 overview / home

建议顺序：

- `/inventory/overview`
- `/finance/overview`
- `/manufacturing/overview`
- `/procure/overview`
- 工作台首页
- 主数据配置页（按 T1-subnav）

目标：不再使用旧 search/todo/timeline/quickActions 模板心智，而是按设计稿做 KPI row + flexible content region。

## Phase 5：处理 legacy 层

### legacy 名单

- `apps/web/src/components/business/erp-page-assemblies.tsx`
- 当前 `OverviewAssembly`
- 当前 `WorkbenchAssembly`
- 旧 `OverviewLayout / WorkbenchLayout` 的固定槽位语义
- `erp-page-config.tsx` 中承载页面长相的部分

### 处理原则

- 短期保留作为 fallback
- 中期瘦身，仅保留语义配置
- 长期不再作为正式页面主实现

---

## 7. 文件级处理建议

### 7.1 立即进入 legacy 名单

- `apps/web/src/components/business/erp-page-assemblies.tsx`
- 当前 `OverviewAssembly`
- 当前 `WorkbenchAssembly`

### 7.2 立即进入重定义名单

- `apps/web/src/contracts/template-contracts.ts`
- `apps/web/src/components/layouts/overview-layout.tsx`
- `apps/web/src/components/layouts/workbench-layout.tsx`

### 7.3 新增主战场

建议新增目录：

- `apps/web/src/components/shells/erp/`
- `apps/web/src/components/primitives/erp/`
- `apps/web/src/components/views/erp/`

### 7.4 路由页逐步改造

- `apps/web/src/app/(dashboard)/**/page.tsx`

---

## 8. 风险与边界

### 本次重构要做的事

1. 重写页面层治理规则
2. 重写 T1/T2/T3/T4 定义
3. 重建页面实现路径
4. 按设计稿逐页复刻第一批页面

### 本次重构不做的事

1. 不顺手重做 BFF / 后端接口 / shared contracts（除非被页面复刻阻塞）
2. 不构建新的大一统前端页面引擎
3. 不一次性推翻所有历史页面，只按批次推进

### 主要风险

#### 风险 1：文档更新了，但代码实现还在走旧路
对策：文档 Phase 0 先行，legacy 明确标注，code review 增加硬检查。

#### 风险 2：抽象过度，再造新的万能组件
对策：抽象层级只到 primitives / shells / 局部业务块，不允许万能整页渲染器。

#### 风险 3：逐页实现导致重复过多
对策：允许小范围重复，待 2-3 页模式稳定后再抽局部共用。

#### 风险 4：设计稿复刻和工程约束冲突
对策：视觉按设计稿，数据与行为按工程红线。

#### 风险 5：legacy 长期不清，造成双轨混乱
对策：明确 legacy 名单，第一批页面切完后更新映射表，逐步收缩 legacy 范围。

---

## 9. 执行中的判断规则

每做一页，都必须回答以下问题：

1. 这页是否已经对上设计稿 node？
2. 这页是否有自己的 page view？
3. 这页是否只是复用了 primitives/shell，而不是复用整页万能装配器？
4. 这页是否仍满足 BFF / URL / shared status 等工程红线？
5. 这页完成后，用户看到的是否就是设计稿页面，而不是“像模板的页面”？

只要有一个答案是否定，就不能算完成。

---

## 10. 验收标准

### 10.1 治理验收

以下文档同步完成并一致：

- `CLAUDE.md`
- `README.md`
- `AGENTS.md`
- `CLAW.md`
- `.claude/rules/erp-rules.md`

并明确包含：

- 新 family 定义
- legacy 说明
- 设计复刻优先
- 禁止万能装配器

### 10.2 架构验收

页面分层明确成立：

- design source
- family shells
- primitives
- page views
- route layer
- semantic config/data layer

### 10.3 页面验收

第一批页面必须满足：

1. 视觉结构与设计稿一致
2. 不再出现旧模板壳文案与结构
3. 不再依赖 `WorkbenchAssembly/OverviewAssembly` 作为主实现
4. 仍满足 URL 化、BFF、shared status 等工程要求

### 10.4 团队协作验收

其他 agent 再进入项目时，不会被旧规则误导继续走老路。

---

## 11. 结论

本次 ERP 页面重构采用以下正式方向：

- 保留 T1/T2/T3/T4 名字，但完全重写其定义与实现边界
- 页面必须复刻设计稿
- 允许适度共用 primitives / shells / 局部业务块
- 禁止再使用一个万能 assembly 套所有页面
- 正式页面的主路径改为：设计稿 → page view → family shell → primitives → BFF/hook 数据接入

后续 implementation planning 与代码实施必须严格遵循本设计文档。