# ERP 三页视觉优先复刻 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 先把 `/mdm/customers`、`/mdm/warehouses`、`/finance/receipts` 三张页面按 pencil 设计稿完成 page-level 视觉复刻，再在第二轮补逻辑与测试链路。

**Architecture:** 放弃这三页对旧 assembly / settings workbench 的主依赖，改为 `route page -> page-level view -> page-local view model`。本轮只追求 design parity，不先碰共享 contract；设计稿缺字段先保留列位并占位显示。

**Tech Stack:** Next.js App Router、React 19、TypeScript、现有 dashboard layout、page-local view model、Bun。

---

### Task 1: 复刻 `/mdm/customers` 的 page-level 视觉页面

**Files:**
- Create: `apps/web/src/components/views/erp/customer-list-view-model.ts`
- Create: `apps/web/src/components/views/erp/customer-list-view.tsx`
- Modify: `apps/web/src/app/(dashboard)/mdm/customers/page.tsx`
- Reference: `images/source/miniERP-pencil-opus4.6.pen` (`iYRfh`)
- Reference: `apps/web/src/app/(dashboard)/layout.tsx`

**Step 1: 建立 page-local view model**

定义 customers 页面首轮所需的最小行模型：

- `id`
- `code`
- `name`
- `contactName`
- `phone`
- `creditLimitDisplay`
- `statusLabel`
- `detailHref`

说明：`creditLimitDisplay` 首轮直接允许为 `'-'`。

**Step 2: 建立独立 `CustomerListView`**

页面结构必须严格对齐 `iYRfh`：

1. 标题区
2. 单搜索框
3. 白底表格卡片

文案固定为：

- 标题：`客户管理`
- 副标题：`客户 · 主数据管理`
- 按钮：`新建客户`
- 搜索占位：`搜索客户名称, 联系人, 编号...`

注意：

- 不再渲染 filter chips
- 不再出现 settings workbench rail
- 不再出现 toolbar / drawer / form card

**Step 3: 替换 route 主实现**

把 `apps/web/src/app/(dashboard)/mdm/customers/page.tsx` 改为直接渲染新的 `CustomerListView`，不要再转发到旧页面。

**Step 4: 做最小视觉自检**

检查完成后确认：

- 页面只复刻 dashboard 右侧主内容区
- 没有第二层 sidebar
- 表头顺序为：`编号 / 客户名称 / 联系人 / 电话 / 信用额度 / 状态`

**Step 5: 本轮不补全的内容**

以下内容第二轮再做：

- 完整 BFF 查询策略
- URL 搜索态回放
- payload 校验
- 测试文件补全

---

### Task 2: 复刻 `/mdm/warehouses` 的 page-level 视觉页面

**Files:**
- Create: `apps/web/src/components/views/erp/warehouse-list-view-model.ts`
- Create: `apps/web/src/components/views/erp/warehouse-list-view.tsx`
- Modify: `apps/web/src/app/(dashboard)/mdm/warehouses/page.tsx`
- Reference: `images/source/miniERP-pencil-opus4.6.pen` (`S8YEo`)
- Reference: `apps/web/src/app/(dashboard)/layout.tsx`

**Step 1: 建立 page-local view model**

定义 warehouses 页面首轮所需最小行模型：

- `id`
- `code`
- `name`
- `typeLabel`
- `address`
- `contactName`
- `binManagementLabel`
- `statusLabel`
- `detailHref`

说明：

- `typeLabel`
- `binManagementLabel`

当前允许先占位，不伪造业务含义。

**Step 2: 建立独立 `WarehouseListView`**

页面结构必须严格对齐 `S8YEo`：

1. 标题区
2. 单搜索框
3. 白底表格卡片

文案固定为：

- 标题：`仓库管理`
- 副标题：`仓库 · 主数据管理`
- 按钮：`新建仓库`
- 搜索占位：`搜索仓库编号, 名称...`

表头固定为：

- `仓库编号`
- `仓库名称`
- `类型`
- `地址`
- `联系人`
- `库位管理`
- `状态`

**Step 3: 替换 route 主实现**

把 `apps/web/src/app/(dashboard)/mdm/warehouses/page.tsx` 从旧 re-export 改为直接渲染新的 `WarehouseListView`。

**Step 4: 做最小视觉自检**

检查完成后确认：

- 没有 settings master-data rail
- 没有通用 toolbar
- 没有分页 footer
- 没有内嵌 create/edit form card

**Step 5: 本轮不补全的内容**

以下内容第二轮再做：

- URL 搜索态
- BFF DTO 精细映射
- 设计稿缺字段的 contract 补齐
- 测试文件补全

---

### Task 3: 复刻 `/finance/receipts` 的 page-level 视觉页面

**Files:**
- Create: `apps/web/src/components/views/erp/receipt-list-view-model.ts`
- Create: `apps/web/src/components/views/erp/receipt-list-view.tsx`
- Modify: `apps/web/src/app/(dashboard)/finance/receipts/page.tsx`
- Reference: `images/source/miniERP-pencil-opus4.6.pen` (`ZvGFp`)
- Reference: `apps/web/src/app/(dashboard)/layout.tsx`

**Step 1: 建立 page-local view model**

定义 receipts 页面首轮所需最小行模型：

- `id`
- `docNo`
- `customerName`
- `dateLabel`
- `amountLabel`
- `methodLabel`
- `reconciledAmountLabel`
- `statusLabel`
- `detailHref`

首轮允许直接使用 page-local seed/mock 数据。

**Step 2: 建立独立 `ReceiptListView`**

页面结构必须严格对齐 `ZvGFp`：

1. 标题区
2. 白底表格卡片

文案固定为：

- 标题：`收款管理`
- 副标题：`Receipts · 客户收款`
- 按钮：`新建收款`

表头固定为：

- `收款编号`
- `客户`
- `日期`
- `金额`
- `方式`
- `已核销`
- `状态`

注意：

- 这页 **没有搜索框**
- 这页 **没有 filter chips**
- 这页 **没有额外 toolbar**

**Step 3: 替换 route 主实现**

把 `apps/web/src/app/(dashboard)/finance/receipts/page.tsx` 从 placeholder 改为直接渲染新的 `ReceiptListView`。

**Step 4: 做最小视觉自检**

检查完成后确认：

- 标题文案从“收款工作台”纠正为“收款管理”
- 页面是稀疏 simple-list，不是 workbench
- 表格下方留白存在，不强塞额外模块

**Step 5: 本轮不补全的内容**

以下内容第二轮再做：

- `/api/bff/receipts` 或 finance documents contract 调整
- 真实 BFF 数据接入
- 测试文件补全

---

### Task 4: 统一回归与第二轮入口收口

**Files:**
- Modify: `docs/plans/2026-03-07-erp-page-reconstruction-design.md`
- Optional Modify: `apps/web/src/components/views/erp/index.ts`

**Step 1: 复核三页是否满足首轮完成标准**

逐页确认：

1. 已对上设计稿 node
2. 已有自己的 page-level view
3. route 已切出旧 assembly / 旧 workbench 路径
4. 页面视觉结构与设计稿一致

**Step 2: 记录第二轮待补内容**

将每页的待补逻辑记录为：

- customers：搜索/BFF/测试
- warehouses：URL state/BFF/测试/contract gap
- receipts：真实数据入口/测试/contract gap

**Step 3: 再进入第二轮实现**

第二轮再按页面逐个补逻辑与测试，不在本计划中提前展开。

---

## 执行注意事项

1. 本轮优先级：**视觉正确 > 逻辑完整 > 测试完整**。
2. 允许页面间小范围重复，不要为了抽象而延迟落地。
3. 不再继续扩展 legacy-derived shells/primitives。
4. 设计稿缺字段一律先占位，不伪造业务字段。
5. receipts 首轮允许 mock；customers / warehouses 首轮允许最小映射。

---

## 首轮验收清单

- [ ] `/mdm/customers` 已按 `iYRfh` 复刻为独立 page-level view
- [ ] `/mdm/warehouses` 已按 `S8YEo` 复刻为独立 page-level view
- [ ] `/finance/receipts` 已按 `ZvGFp` 复刻为独立 page-level view
- [ ] 三页都已脱离旧主实现路径
- [ ] 三页都没有多余的 workbench/template 痕迹
- [ ] 第二轮逻辑与测试补全入口已明确
