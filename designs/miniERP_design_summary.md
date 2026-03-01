# miniERP 前端页面设计框架 — 设计总结

> **风格指南**: `webapp-01-nordicbrutalist_light` (Nordic Brutalist Light)
> **设计文件**: `designs/miniERP-pencil-opus4.6.pen`
> **已完成页面**: 7 / 30

---

## 设计系统核心

| 元素 | 规格 |
|------|------|
| **主字体** | Space Grotesk (标题/数据/标签) + Inter (正文/描述) |
| **主色** | Charcoal #1a1a1a + Cream #F5F3EF |
| **强调色** | Terracotta #C05A3C |
| **语义色** | 成功 #4A7C59 · 警告 #C05A3C · 错误 #B54A4A · 信息 #5C7C8A |
| **圆角** | 0px（全局零圆角，Brutalist 风格） |
| **标签规范** | 大写 + 1px letter-spacing |

---

## 四种母版全部覆盖 ✅

| 母版 | 已实现页面 | 核心特征 |
|------|-----------|----------|
| **T1 概览页** | `/ 工作台首页` · `/skus/overview SKU概览` | KPI卡片 + 待办 + 快捷入口 + 最近动作 |
| **T2 列表工作台** | `/skus SKU工作台` · `/settings/master-data 主数据配置` | 搜索+过滤+高密度表格+右侧抽屉+批量操作 |
| **T3 详情页** | `/skus/:id SKU详情` | 三栏信息(基本/规格/库存) + Tab(映射/流水/关联/日志) |
| **T4 工作流** | `/purchasing/grn/new GRN入库` · `/sales/out/new OUT出库` | 步骤导航+表单/表格+右侧汇总+过账确认 |

---

## 已完成的 7 个页面

### 1️⃣ 工作台首页 `/` (T1)
- 全局搜索框（SKU / 单号 / 供应商）
- 4个KPI（低库存SKU·待入库GRN·待出库OUT·延迟PO）—— 带左色条语义区分
- 全局待办列表（跳转到对应工作台+自动带筛选条件）
- 黑色快捷入口面板（新建SKU/GRN/OUT + 库存查询）
- 最近动作时间线

### 2️⃣ SKU 概览 Dashboard `/skus/overview` (T1)
- 4个KPI（总SKU·低库存预警·缺映射·停用）
- 模块级待办列表
- 快捷操作 + 最近动作

### 3️⃣ SKU 列表工作台 `/skus` (T2) — 主战场
- 搜索/过滤/高密度表格/多行状态展示
- 右侧快速详情抽屉（规格标签/仓库库存/流水/快捷操作）
- 底部分页器

### 4️⃣ SKU 详情 `/skus/:id` (T3) — 新增
- 顶部：SKU编码+状态标签+编辑/复制变体/停用按钮
- 三栏布局：基本信息 | 规格字段(可复制为文本) | 库存概览(黑色卡片+快捷入库出库)
- Tab 区域：外部映射表(含供应商/客户来源类型+主映射标识) | 库存流水 | 关联单据 | 附件 | 操作日志

### 5️⃣ GRN 入库过账工作流 `/purchasing/grn/new` (T4)
- 4步步骤导航（基础信息→录入明细→差异校验→过账确认）
- Step 1 展示：仓库/PO/日期/备注表单
- 右侧黑色 PO 信息卡 + 明细预览

### 6️⃣ OUT 出库过账工作流 `/sales/out/new` (T4)
- Step 1 完成态(绿色✓) + Step 2 当前态
- 出库表格带可用库存+缺货处理
- 缺货行粉色高亮 + 拆分发货标签
- 右侧出库摘要 + 缺货提示警告条

### 7️⃣ 主数据配置 `/settings/master-data` (T2 变体) — 新增
- 左侧二级导航（类目管理/规格模板/字段字典）
- 当前展示类目管理：类目表（编码/名称/前缀/SKU数/状态/操作）
- 新增类目按钮

---

## 30 页覆盖情况

| # | 路由 | 模板 | 状态 |
|---|------|------|------|
| 1 | `/` 工作台首页 | T1 | ✅ 已完成 |
| 2 | `/skus/overview` | T1 | ✅ 已完成 |
| 3 | `/skus` SKU工作台 | T2 | ✅ 已完成 |
| 4 | `/skus/new` 新建SKU | T4 | ⬜ 待设计 |
| 5 | `/skus/:id` SKU详情 | T3 | ✅ 已完成 |
| 6 | `/skus/:id/edit` 编辑SKU | T3编辑态 | ⬜ 基于T3微调 |
| 7 | `/mappings` 映射工作台 | T2 | ⬜ 复用T2 |
| 8 | `/purchasing/overview` | T1 | ⬜ 复用T1 |
| 9 | `/purchasing/po` PO工作台 | T2 | ⬜ 复用T2 |
| 10 | `/purchasing/po/new` | T4 | ⬜ 复用T4 |
| 11 | `/purchasing/po/:id` PO详情 | T3 | ⬜ 复用T3 |
| 12 | `/purchasing/grn` GRN工作台 | T2 | ⬜ 复用T2 |
| 13 | `/purchasing/grn/new` | T4 | ✅ 已完成 |
| 14 | `/purchasing/grn/:id` GRN详情 | T3 | ⬜ 复用T3 |
| 15 | `/sales/overview` | T1 | ⬜ 复用T1 |
| 16 | `/sales/so` SO工作台 | T2 | ⬜ 复用T2 |
| 17 | `/sales/so/new` | T4 | ⬜ 复用T4 |
| 18 | `/sales/so/:id` SO详情 | T3 | ⬜ 复用T3 |
| 19 | `/sales/out` OUT工作台 | T2 | ⬜ 复用T2 |
| 20 | `/sales/out/new` | T4 | ✅ 已完成 |
| 21 | `/sales/out/:id` OUT详情 | T3 | ⬜ 复用T3 |
| 22 | `/inventory` 库存查询 | T2 | ⬜ 复用T2 |
| 23 | `/inventory/ledger` 流水审计 | T2 | ⬜ 复用T2 |
| 24 | `/inventory/reorder` 补货建议 | T2 | ⬜ 复用T2 |
| 25 | `/stocktake` 盘点工作台 | T2 | ⬜ 复用T2 |
| 26 | `/stocktake/new` 新建盘点 | T4 | ⬜ 复用T4 |
| 27 | `/stocktake/:id` 盘点详情 | T3 | ⬜ 复用T3 |
| 28 | `/settings` 设置入口 | T1简化 | ⬜ 待设计 |
| 29 | `/settings/master-data` | T2变体 | ✅ 已完成 |
| 30 | `/settings/system` | T2变体 | ⬜ 复用设置布局 |

> [!TIP]
> 4 种母版均已有代表性实现。剩余 23 页都是"换数据+换字段"的复用变体，开发时直接套用对应母版组件即可。
