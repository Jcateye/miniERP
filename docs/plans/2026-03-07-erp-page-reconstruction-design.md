# ERP 页面重构设计（2026-03-07）

## 1. 本轮已确认目标

用户已明确确认本轮采用 **视觉优先** 的推进方式：

- 先把页面按 `images/source/miniERP-pencil-opus4.6.pen` 复刻正确
- 先完成 page-level view 的正式页面形态
- 后续再补充逻辑、BFF 收敛、测试链路
- 不再继续扩展 legacy/template 化中间层

本轮最初首批页面范围固定为 3 张：

1. `/mdm/customers` → 设计节点 `iYRfh`
2. `/mdm/warehouses` → 设计节点 `S8YEo`
3. `/finance/receipts` → 设计节点 `ZvGFp`

---

## 2. 当前问题定义

当前运行时大量 dashboard 页面并不是按 pencil 设计稿逐页实现，而是：

- route 直接转发到 `settings/master-data` 或 placeholder
- 或通过旧 assembly / template config 生成“像模板”的页面
- 页面中出现了设计稿没有的 tab rail、toolbar、drawer、bulk bar、表单卡等结构

这条路径已经偏离“正式页面复刻”的目标。

因此本轮不再从旧万能模板继续演进，而是直接恢复到：

**设计稿 → page-level view → 页面私有 view model → route page**

---

## 3. 本轮约束

### 3.1 必须遵守

- 正式页面必须以 `.pen` 设计稿为目标形态
- 每页必须有自己的 page-level view
- 不再依赖 `WorkbenchAssembly`
- 不再依赖 `settings/master-data/page.tsx` 作为 customers / warehouses 的主实现
- 不为“减少重复”而再造新的万能页面装配器

### 3.2 本轮明确不做

- 不先统一重构共享底座
- 不先扩 shared/server contract
- 不先追求全量测试闭环
- 不先处理所有 legacy 页面

### 3.3 允许的降级策略

如设计稿字段当前 runtime contract 缺失，则：

- 保留设计稿列位
- 值先用占位展示
- 不伪造业务含义
- 在第二轮再补齐数据契约

---

## 4. 首批三页的设计决定

## 4.1 Customers (`iYRfh`)

### 页面结构

- 使用 dashboard layout 已提供的全局 Sidebar
- 页面只实现右侧主内容区
- 主内容区结构固定为：
  1. 标题区
  2. 单搜索框
  3. 白底表格卡片

### 设计文案

- 标题：`客户管理`
- 副标题：`客户 · 主数据管理`
- 主按钮：`新建客户`
- 搜索占位：`搜索客户名称, 联系人, 编号...`

### 表格列

- `编号`
- `客户名称`
- `联系人`
- `电话`
- `信用额度`
- `状态`

### 本轮特殊决策

- 取消此前偏离设计稿的 filter chips
- `信用额度` 当前 shared/server contract 不提供，首轮保留列位，值显示 `-`
- 编号列应可作为强调文本/详情入口

---

## 4.2 Warehouses (`S8YEo`)

### 页面结构

- 使用 dashboard layout 已提供的全局 Sidebar
- 页面只实现右侧主内容区
- 主内容区结构固定为：
  1. 标题区
  2. 单搜索框
  3. 白底表格卡片

### 设计文案

- 标题：`仓库管理`
- 副标题：`仓库 · 主数据管理`
- 主按钮：`新建仓库`
- 搜索占位：`搜索仓库编号, 名称...`

### 表格列

- `仓库编号`
- `仓库名称`
- `类型`
- `地址`
- `联系人`
- `库位管理`
- `状态`

### 本轮特殊决策

- 不再转发到 `settings/master-data/page.tsx`
- `类型`、`库位管理` 当前后端/BFF 未完整提供，首轮保留列位并做页面内降级占位
- 不引入设计稿中不存在的额外工具条、分页 footer、表单区

---

## 4.3 Receipts (`ZvGFp`)

### 页面结构

- 使用 dashboard layout 已提供的全局 Sidebar
- 页面只实现右侧主内容区
- 主内容区结构固定为：
  1. 标题区
  2. 白底表格卡片

### 设计文案

- 标题：`收款管理`
- 副标题：`Receipts · 客户收款`
- 主按钮：`新建收款`

### 表格列

- `收款编号`
- `客户`
- `日期`
- `金额`
- `方式`
- `已核销`
- `状态`

### 本轮特殊决策

- 这是 `T2 simple-list`，**没有搜索栏、没有 filter chips**
- 当前 `/api/bff/documents` 不支持 `REC`，首轮允许 page-local seed/mock view model 先完成视觉复刻
- 第二轮再决定单独新增 `/api/bff/receipts` 或统一 finance documents contract

---

## 5. 实现边界

本轮实现只允许改动页面私有层：

- `apps/web/src/components/views/erp/*-list-view-model.ts`
- `apps/web/src/components/views/erp/*-list-view.tsx`
- 对应 route `page.tsx`

尽量不碰：

- `erp-page-config.tsx`
- `settings/master-data/*`
- 旧 assembly / legacy template 体系
- shared/server contract

---

## 6. 视觉优先的完成标准

首轮完成的判断标准不是“逻辑闭环”，而是：

1. 页面结构与设计稿一致
2. 标题、副标题、按钮、搜索区、表格区位置正确
3. 表头与关键文案正确
4. 页面不再显示旧模板壳痕迹
5. route 已经指向独立 page-level view

只要满足以上 5 条，即可进入第二轮逻辑与测试补全。

---

## 7. 第二轮再补的内容

在三张页面首轮视觉复刻完成后，再进入第二轮：

- customers：搜索参数、BFF 收敛、payload 校验、view-model 测试
- warehouses：搜索 URL state、BFF DTO 映射测试、缺字段 contract 讨论
- receipts：真实数据入口、状态映射、view-model 测试、后续详情/新建路径

---

## 8. 2026-03-08 进度盘点（37 页口径）

按 `docs/ui/erp-page-priority-and-interface-map.md` 第 3 节当前纳入复刻范围的 37 个页面统计：

- 已复刻为独立真实页面：35
- 尚未完成正式复刻：2

### 8.1 已复刻的 35 页

- `/mdm/items/:id`
- `/mdm/items/new`
- `/inventory/counts/:id`
- `/sales/orders`
- `/sales/shipments`
- `/sales/quotations`
- `/mdm/items`
- `/evidence/assets`
- `/inventory/counts/new`
- `/inventory/balances`
- `/workspace`
- `/procure/purchase-orders`
- `/inventory/ledger`
- `/integration/logs`
- `/manufacturing/work-orders/:id`
- `/manufacturing/orders/:id`
- `/quality/records/:id`
- `/manufacturing/overview`
- `/procure/receipts`
- `/workspace/todos`
- `/mdm/customers`
- `/mdm/suppliers`
- `/mdm/warehouses`
- `/finance/invoices`
- `/workflow/tasks`
- `/finance/receipts`
- `/finance/payments`
- `/finance/journals`
- `/finance/gl-accounts`
- `/finance/cost-centers`
- `/finance/budgets`
- `/integration/endpoints`
- `/integration/jobs`
- `/manufacturing/orders`
- `/quality/records`

### 8.2 尚未完成正式复刻的 2 页

#### A. 仍是 re-export / 旧路由复用

- 无

#### B. 仍是 legacy assembly

- 无

#### C. 仍是 placeholder

- 无

#### D. 缺文件 / 未落地

- 无

#### E. 仍属旧实现形态，未进入 page-level 正式复刻

- `/mdm/items/:id`
- `/mdm/items/new`

### 8.3 下一批优先对象

优先顺序保持与页面优先级一致，但在当前剩余页面里优先清掉最明显的 placeholder / missing：

1. 无（当前 remaining 列表已无 placeholder / missing）

## 9. 结论

本轮已确认采用以下正式路径：

- **先视觉复刻，再补逻辑与测试**
- **先做 customers + warehouses + receipts 三页**
- **每页独立 page-level view**
- **不继续扩展 legacy/template 中间层**
- **缺字段先占位，后续再补契约**
- **当前 37 页口径下仍有 2 页待完成正式复刻**

后续 implementation plan 与代码实施必须以本设计文档为准。
