# miniERP 设计稿前端复刻 — 完成报告

## 概述

从 [miniERP-pencil-opus4.6.pen](file:///Users/haoqi/OnePersonCompany/miniERP/images/source/miniERP-pencil-opus4.6.pen) 设计稿中的 **26 个页面** 全部复刻为 Next.js 15 前端代码，放入 `apps/web/src/` 目录。

## 组件抽象 (9 个共享组件)

| 组件 | 文件 | 复用次数 |
|---|---|---|
| `PageHeader` + `ActionButton` | [page-header.tsx](file:///Users/haoqi/OnePersonCompany/miniERP/apps/web/src/components/ui/page-header.tsx) | 18+ |
| `KPICard` | [kpi-card.tsx](file:///Users/haoqi/OnePersonCompany/miniERP/apps/web/src/components/ui/kpi-card.tsx) | 4 |
| `DataTable` | [data-table.tsx](file:///Users/haoqi/OnePersonCompany/miniERP/apps/web/src/components/ui/data-table.tsx) | 6 |
| `FilterBar` | [filter-bar.tsx](file:///Users/haoqi/OnePersonCompany/miniERP/apps/web/src/components/ui/filter-bar.tsx) | 4 |
| `StatusBadge` | [status-badge.tsx](file:///Users/haoqi/OnePersonCompany/miniERP/apps/web/src/components/ui/status-badge.tsx) | 所有表格 |
| `FormInput` + `FormSelect` | [form-input.tsx](file:///Users/haoqi/OnePersonCompany/miniERP/apps/web/src/components/ui/form-input.tsx) | 5 |
| `Stepper` | [stepper.tsx](file:///Users/haoqi/OnePersonCompany/miniERP/apps/web/src/components/ui/stepper.tsx) | 3 |
| `TabPanel` | [tab-panel.tsx](file:///Users/haoqi/OnePersonCompany/miniERP/apps/web/src/components/ui/tab-panel.tsx) | 4 |
| `AuthLayout` | [auth-layout.tsx](file:///Users/haoqi/OnePersonCompany/miniERP/apps/web/src/components/ui/auth-layout.tsx) | 3 |

## 实现的页面

### 认证 (3)
- `/login` — 登录页 (AuthLayout + 表单)
- `/register` — 注册页
- `/forgot-password` — 忘记密码

### Dashboard (2)
- `/` — 工作台首页 (KPI + 待办 + 快捷入口 + 时间线)
- `/skus/overview` — SKU 概览仪表盘

### SKU 管理 (2)
- `/skus` — SKU 列表工作台 (搜索 + 筛选 + 表格 + 快速预览)
- `/skus/[id]` — SKU 详情页 (信息卡 + Tab)

### 工作流 (3)
- `/purchasing/grn/new` — GRN 入库过账 (Stepper + 表单 + PO 信息卡)
- `/purchasing/grn/evidence` — GRN Step3 差异与证据
- `/sales/out/new` — OUT 出库过账 (Stepper + 拣货表)

### 设置 (8)
- `/settings` → redirect `/settings/master-data`
- `/settings/master-data` — 主数据配置 (二级导航 + 分类表)
- `/settings/tenant` — 租户设置 (信息卡 + Logo + Tab)
- `/settings/users` — 用户管理 (筛选 + 表格)
- `/settings/roles` — 角色权限配置 (列表 + 权限面板)
- `/settings/profile` — 个人中心
- `/settings/api-clients` — API 客户端管理
- `/settings/api-logs` — API 调用日志
- `/settings/developer` — 开发者中心

### 报表 (2)
- `/reports` — 报表总览 (KPI + 入口卡片)
- `/reports/[slug]` — 报表详情 (图表 + 汇总)

### 其他 (4)
- `/attachments` — 附件管理
- `/scan` — 快速扫码 (移动端布局)
- `/403` — 403 无权限
- `not-found` — 404 页面不存在

## 核心改动

### Sidebar 更新
[sidebar.tsx](file:///Users/haoqi/OnePersonCompany/miniERP/apps/web/src/components/layout/sidebar.tsx) — 使用 lucide-react 图标，6 项导航，匹配设计稿的 `#1a1a1a` 背景 + `#C05A3C` 高亮。

### 依赖
- 新增 `lucide-react@0.577.0`

## 验证

```
✓ Compiled successfully in 2.7s
✓ Generating static pages (53/53) in 168.4ms
○ 0 errors
```

所有 53 个路由 (含 API routes) 构建成功，TypeScript 无错误。
