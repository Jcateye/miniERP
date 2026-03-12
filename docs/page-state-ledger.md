# 页面状态台账（Page State Ledger）

> **用途**：记录所有页面的状态，防止"假完成"
>
> **更新规则**：页面状态变更时必须同步更新此文件

---

## 状态定义

| 状态              | 含义                                                     | 允许的操作                 |
| ----------------- | -------------------------------------------------------- | -------------------------- |
| `placeholder`     | 占位页，仅显示待实现内容                                 | 添加到导航、等待设计或联调 |
| `legacy-assembly` | 使用旧装配器（WorkbenchAssembly/OverviewAssembly）       | 历史兼容、标记为待重构     |
| `page-view`       | 独立页面实现（在 `views/erp/` 下），但未满足全部完成标准 | 开发、联调、补测试         |
| `verified`        | 设计一致性 + 数据联调 + 测试通过                         | 候选完成、准备代码审查     |
| `production`      | 已完成代码审查与文档同步，进入正式运行口径               | 持续优化                   |

---

## 当前页面状态

### 已上线（production）

| 路由       | 状态       | 设计稿       | 上线日期   | 负责人 | 备注       |
| ---------- | ---------- | ------------ | ---------- | ------ | ---------- |
| /workspace | production | workspace-v1 | 2026-03-12 | @codex | 工作台首页顶部搜索栏对齐修复 |

### 已验证（verified）

| 路由            | 状态     | 设计稿            | 验证日期   | 负责人 | 备注     |
| --------------- | -------- | ----------------- | ---------- | ------ | -------- |
| /mdm/items      | verified | items-list-v2     | 2026-03-11 | @codex | 等待上线 |
| /reports        | verified | reports-v1        | 2026-03-11 | @codex | 报表列表 |
| /reports/[slug] | verified | reports-detail-v1 | 2026-03-11 | @codex | 报表详情 |

### 开发中（page-view）

> **说明**：以下页面均已切到独立 page-level view，当前结论是“设计一致性 ✅、数据联调 ✅、测试 ⏳、代码审查 ⏳、文档同步 ✅”，因此仍停留在 `page-view`。

#### /mdm/skus

- 状态：`page-view`
- 完成标准：设计一致性 ✅（UI 符合设计稿）；数据联调 ✅（VM Hook + BFF mock）；测试 ⏳（待添加）；代码审查 ⏳（待完成）；文档同步 ✅（本次完成）
- 最后更新：2026-03-11
- PR：#32

#### /mdm/customers

- 状态：`page-view`
- 完成标准：设计一致性 ✅（UI 符合设计稿）；数据联调 ✅（VM Hook + BFF mock）；测试 ⏳（待添加）；代码审查 ⏳（待完成）；文档同步 ✅（本次完成）
- 最后更新：2026-03-11
- PR：#32

#### /mdm/suppliers

- 状态：`page-view`
- 完成标准：设计一致性 ✅（UI 符合设计稿）；数据联调 ✅（VM Hook + BFF mock）；测试 ⏳（待添加）；代码审查 ⏳（待完成）；文档同步 ✅（本次完成）
- 最后更新：2026-03-11
- PR：#32

#### /inventory/balance

- 状态：`page-view`
- 完成标准：设计一致性 ✅（UI 严格对齐 1VpfS/bitbz，按钮颜色修正）；数据联调 ✅（VM Hook + BFF mock）；测试 ⏳（待添加）；代码审查 ⏳（待完成）；文档同步 ✅（本次完成）
- 最后更新：2026-03-12
- PR：#33 (UI Refinement)

#### /inventory/ledger

- 状态：`page-view`
- 完成标准：设计一致性 ✅（UI 符合设计稿）；数据联调 ✅（VM Hook + BFF mock）；测试 ⏳（待添加）；代码审查 ⏳（待完成）；文档同步 ✅（本次完成）
- 最后更新：2026-03-11
- PR：#32

#### /sales/orders

- 状态：`page-view`
- 完成标准：设计一致性 ✅（UI 符合设计稿）；数据联调 ✅（VM Hook + BFF mock）；测试 ⏳（待添加）；代码审查 ⏳（待完成）；文档同步 ✅（本次完成）
- 最后更新：2026-03-11
- PR：#32

#### /procure/purchase-orders

- 状态：`page-view`
- 完成标准：设计一致性 ✅（UI 符合设计稿）；数据联调 ✅（VM Hook + BFF mock）；测试 ⏳（待添加）；代码审查 ⏳（待完成）；文档同步 ✅（本次完成）
- 最后更新：2026-03-11
- PR：#32

### 待重构（legacy-assembly）

> **注意**：这些页面使用旧装配器，需要重构为 page-level view

| 路由 | 状态 | 原因 | 优先级 | 计划日期 |
| ---- | ---- | ---- | ------ | -------- |
| -    | -    | -    | -      | 暂无     |

### 占位页（placeholder）

> **注意**：这些页面仅显示"Coming Soon"，不算完成

| 路由 | 状态 | 计划功能 | 优先级 | 计划日期 |
| ---- | ---- | -------- | ------ | -------- |
| -    | -    | -        | -      | 暂无     |

---

## 统计

**总览**：

- 总页面数：**11**
- 已上线：**1** (9%)
- 已验证：**3** (27%)
- 开发中：**7** (64%)
- 待重构：**0** (0%)
- 占位页：**0** (0%)

**健康度**：

- ✅ 没有 placeholder
- ✅ 没有 legacy-assembly
- ✅ 没有 re-export
- ✅ 所有页面都是 page-level view

---

## 历史记录

### 2026-03-12

- ✅ **库存余额 UI 复刻**：完成按钮、搜索栏、配色严格对齐高保真设计（1VpfS/bitbz）。
- ✅ **工作台首页修复**：修复顶栏搜索框靠右对齐问题，优化 PageHeader 布局语义。
- ✅ **全站设计一致性**：同步铜棕色 (#C05A3C) 作为模块主操作按钮标准色。

### 2026-03-11

- ✅ 删除 322 个文件，重置前端
- ✅ 保留 4 个页面：/workspace、/mdm/items、/reports、/reports/[slug]
- ✅ 创建页面状态台账
- ✅ 同步 PR #30 / #31 / #32 的页面状态到台账
- ✅ 新增 7 个 `page-view` 页面：/mdm/skus、/mdm/customers、/mdm/suppliers、/inventory/balance、/inventory/ledger、/sales/orders、/procure/purchase-orders

---

## 检查命令

```bash
# 检查页面状态
bun run scripts/check-page-state.sh

# 输出示例：
# ✅ /workspace: production
# ✅ /mdm/items: verified
# ✅ /reports: verified
# ✅ /reports/[slug]: verified
# ✅ /mdm/skus: page-view
# ✅ /mdm/customers: page-view
# ✅ /mdm/suppliers: page-view
# ✅ /inventory/balance: page-view
# ✅ /inventory/ledger: page-view
# ✅ /sales/orders: page-view
# ✅ /procure/purchase-orders: page-view
#
# 统计：11 页面，1 production，3 verified，7 page-view
```

---

_此文件由 Zoe-miniERP 维护，最后更新：2026-03-12_
