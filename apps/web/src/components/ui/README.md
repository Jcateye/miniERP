# miniERP UI 组件库

> 路径：`@/components/ui`  
> 统一入口：`import { ComponentName } from '@/components/ui'`

本组件库从设计稿 (`miniERP-pencil-opus4.6.pen`) 中提取，覆盖 miniERP 全部 26 个页面的 UI 模式。所有组件使用 **inline style** 保证零冲突，配色和间距严格对齐设计稿 token。

---

## 设计 Token 速查

| Token | 值 | 用途 |
|-------|-----|------|
| `#1a1a1a` | 深黑 | 标题文字、Sidebar 背景 |
| `#C05A3C` | 品牌赤 | 主按钮、激活态、链接 |
| `#F5F3EF` | 暖白 | 页面底色 |
| `#E0DDD8` | 浅灰线 | 边框、分割线 |
| `#888888` | 中灰 | 副标题、提示文字 |
| `#2E7D32` | 成功绿 | success badge/KPI |
| `#D94F4F` | 危险红 | danger badge/KPI |
| `#5C7C8A` | 信息蓝灰 | info badge/KPI |
| `Space Grotesk` | — | 标题字体 (`var(--font-display-family)`) |
| `Inter` | — | 正文字体 (`var(--font-body-family)`) |

---

## 组件一览

| 组件 | 文件 | 场景 |
|------|------|------|
| [PageHeader](#pageheader) | `page-header.tsx` | 每个页面顶部标题栏 |
| [ActionButton](#actionbutton) | `page-header.tsx` | 操作按钮（主/次/幽灵） |
| [SearchBar](#searchbar) | `search-bar.tsx` | 搜索框 + 高级筛选 |
| [FilterTabs](#filtertabs) | `filter-tabs.tsx` | 状态标签切换 |
| [DataTable](#datatable) | `data-table.tsx` | 通用数据表格 |
| [QuickPreview](#quickpreview) | `quick-preview.tsx` | 行点击后的侧边预览面板 |
| [StatusBadge](#statusbadge) | `status-badge.tsx` | 表格内状态标签 |
| [KPICard](#kpicard) | `kpi-card.tsx` | 仪表盘指标卡片 |
| [FilterBar](#filterbar) | `filter-bar.tsx` | 搜索 + 下拉筛选（简易版） |
| [FormInput / FormSelect](#forminput--formselect) | `form-input.tsx` | 表单输入 |
| [TabPanel](#tabpanel) | `tab-panel.tsx` | 内容标签页 |
| [Stepper](#stepper) | `stepper.tsx` | 多步工作流进度条 |
| [AuthLayout](#authlayout) | `auth-layout.tsx` | 登录/注册页面布局 |

---

## 标准工作台页面模板

**所有列表管理页面**（SKU、采购、出库、附件、用户管理等）都应遵循以下固定 5 层布局：

```tsx
import { useState } from 'react';
import { Download, Plus } from 'lucide-react';
import {
  PageHeader, ActionButton, SearchBar, FilterTabs,
  DataTable, StatusBadge, QuickPreview,
} from '@/components/ui';
import type { TableColumn, FilterTabItem } from '@/components/ui';

export default function XxxWorkbenchPage() {
  const [selected, setSelected] = useState<Record<string, string> | null>(null);

  return (
    <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 24, height: '100vh', overflow: 'hidden' }}>
      {/* ① 标题栏 */}
      <PageHeader
        title="XXX 管理"
        subtitle="描述文字"
        actions={
          <>
            <ActionButton label="导出" icon={<Download size={14} />} tone="secondary" />
            <ActionButton label="新建" icon={<Plus size={14} />} tone="primary" />
          </>
        }
      />

      {/* ② 搜索 + 高级筛选 */}
      <SearchBar placeholder="搜索..." showAdvancedFilter />

      {/* ③ 状态标签 + 统计 */}
      <FilterTabs
        tabs={[
          { key: 'all', label: '全部' },
          { key: 'active', label: '进行中' },
          { key: 'done', label: '已完成' },
        ]}
        summary="共 128 条"
      />

      {/* ④ 表格 + ⑤ 侧边预览 */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <DataTable
            columns={columns}
            rows={rows}
            totalPages={5}
            currentPage={1}
            totalItems={128}
            onRowClick={setSelected}
            selectedRowId={selected?.id}
          />
        </div>
        {selected && (
          <QuickPreview
            heading={selected.code}
            subheading={selected.name}
            fields={[
              { label: '字段A', value: selected.fieldA },
              { label: '字段B', value: selected.fieldB },
            ]}
            onClose={() => setSelected(null)}
            actions={
              <>
                <ActionButton label="编辑" tone="primary" />
                <ActionButton label="详情" tone="secondary" />
              </>
            }
          />
        )}
      </div>
    </div>
  );
}
```

---

## 组件详细文档

### PageHeader

页面顶部标题区域，左侧显示标题和副标题，右侧放置操作按钮。

```tsx
import { PageHeader, ActionButton } from '@/components/ui';
import { Plus } from 'lucide-react';

<PageHeader
  title="SKU 管理"                         // 必须 — 页面主标题
  subtitle="SKU 粒度 · 管理工作台"           // 可选 — 灰色副标题
  actions={                                 // 可选 — 右侧操作区
    <>
      <ActionButton label="导出" tone="secondary" />
      <ActionButton label="新建 SKU" icon={<Plus size={14} />} tone="primary" />
    </>
  }
/>
```

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `string` | — | 页面标题 |
| `subtitle` | `string?` | — | 副标题 |
| `actions` | `ReactNode?` | — | 右侧操作区 |

---

### ActionButton

三种风味的操作按钮，统一圆角 8px、600 字重、13px 字号。

```tsx
import { ActionButton } from '@/components/ui';
import { Download, Plus } from 'lucide-react';

<ActionButton label="新建 SKU" tone="primary" icon={<Plus size={14} />} />
<ActionButton label="导出" tone="secondary" icon={<Download size={14} />} />
<ActionButton label="取消" tone="ghost" />
```

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `label` | `string` | — | 按钮文字 |
| `tone` | `'primary' \| 'secondary' \| 'ghost'` | `'secondary'` | 视觉风格 |
| `icon` | `ReactNode?` | — | 左侧图标 |
| `onClick` | `() => void` | — | 点击回调 |

**视觉效果：**
- `primary`：`#C05A3C` 背景 + 白字
- `secondary`：白背景 + 灰边框
- `ghost`：透明背景

---

### SearchBar

搜索输入框 + 可选的"高级筛选"按钮。所有列表页面的标准搜索栏。

```tsx
import { SearchBar } from '@/components/ui';

// 基础用法
<SearchBar placeholder="搜索 SKU 编码、名称..." />

// 带高级筛选
<SearchBar
  placeholder="搜索..."
  showAdvancedFilter
  onAdvancedFilter={() => setDrawerOpen(true)}
/>

// 受控模式
<SearchBar
  value={keyword}
  onSearchChange={setKeyword}
  placeholder="搜索用户姓名、邮箱..."
  maxWidth={500}
/>
```

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `placeholder` | `string` | `'搜索...'` | 输入提示 |
| `value` | `string` | `''` | 受控值 |
| `onSearchChange` | `(v: string) => void` | — | 值变化回调 |
| `maxWidth` | `number` | `400` | 搜索框最大宽度（px） |
| `showAdvancedFilter` | `boolean` | `false` | 是否显示高级筛选按钮 |
| `advancedFilterLabel` | `string` | `'高级筛选'` | 按钮文本 |
| `onAdvancedFilter` | `() => void` | — | 点击高级筛选回调 |
| `trailing` | `ReactNode` | — | 右侧额外内容 |

---

### FilterTabs

状态标签栏 — 全部 / 在售 / 停售 / 草稿 这类切换。

```tsx
import { FilterTabs } from '@/components/ui';
import type { FilterTabItem } from '@/components/ui';

const tabs: FilterTabItem[] = [
  { key: 'all', label: '全部' },
  { key: 'active', label: '在售' },
  { key: 'inactive', label: '停售' },
  { key: 'draft', label: '草稿' },
];

<FilterTabs
  tabs={tabs}
  activeKey="all"                         // 可选 — 受控激活 key
  onChange={(key) => console.log(key)}     // 可选 — 切换回调
  summary="显示 1 到 5 / 总 128 条"          // 可选 — 右侧统计文字
/>
```

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `tabs` | `FilterTabItem[]` | — | 标签配置数组 |
| `activeKey` | `string?` | 首项 key | 受控激活 key |
| `onChange` | `(key: string) => void` | — | 切换回调 |
| `summary` | `string?` | — | 右侧统计文字 |

`FilterTabItem` 结构：`{ key: string; label: string; count?: number }`

---

### DataTable

通用数据表格 — 表头、可点行、分页器。

```tsx
import { DataTable, StatusBadge } from '@/components/ui';
import type { TableColumn } from '@/components/ui';

const columns: TableColumn[] = [
  { key: 'code', label: '编码', width: 160 },
  { key: 'name', label: '名称', width: 200 },
  { key: 'stock', label: '库存', width: 90 },
  {
    key: 'status',
    label: '状态',
    width: 80,
    render: (value) => <StatusBadge label={value} tone="success" />,
  },
];

<DataTable
  columns={columns}
  rows={[{ id: '1', code: 'SKU-001', name: '产品A', stock: '100', status: '在售' }]}
  totalPages={5}
  currentPage={1}
  totalItems={128}
  onPageChange={(page) => setPage(page)}
  onRowClick={(row) => setSelected(row)}
  selectedRowId={selected?.id}
/>
```

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `columns` | `TableColumn[]` | — | 列定义 |
| `rows` | `Record<string, string>[]` | — | 数据行 |
| `currentPage` | `number` | `1` | 当前页码 |
| `totalPages` | `number` | `1` | 总页数 |
| `totalItems` | `number?` | — | 总条数 |
| `onPageChange` | `(page) => void` | — | 翻页回调 |
| `onRowClick` | `(row) => void` | — | 行点击回调 |
| `selectedRowId` | `string?` | — | 高亮行 ID |

`TableColumn` 结构：`{ key, label, width?, render?(value, row) }`

---

### QuickPreview

点击表格行后弹出的右侧预览面板。

```tsx
import { QuickPreview, ActionButton } from '@/components/ui';

{selectedRow && (
  <QuickPreview
    heading={selectedRow.code}          // 主标识
    subheading={selectedRow.name}       // 副标识
    fields={[                           // 键值对字段列表
      { label: '分类', value: selectedRow.category },
      { label: '库存', value: selectedRow.stock },
    ]}
    onClose={() => setSelectedRow(null)} // 关闭回调
    actions={                            // 底部操作按钮
      <>
        <ActionButton label="编辑" tone="primary" />
        <ActionButton label="详情" tone="secondary" />
      </>
    }
  />
)}
```

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `string` | `'快速预览'` | 面板标题 |
| `heading` | `string` | — | 主标识文字 |
| `subheading` | `string?` | — | 副标识文字 |
| `fields` | `PreviewField[]` | — | 键值对列表 |
| `actions` | `ReactNode?` | — | 底部操作区 |
| `onClose` | `() => void` | — | 关闭回调 |
| `width` | `number` | `280` | 面板宽度（px） |

---

### StatusBadge

表格单元格里的状态标签。5 种 tone 对应 5 种配色。

```tsx
import { StatusBadge } from '@/components/ui';

<StatusBadge label="在售" tone="success" />
<StatusBadge label="停售" tone="danger" />
<StatusBadge label="审核中" tone="warning" />
<StatusBadge label="草稿" tone="neutral" />
<StatusBadge label="已发货" tone="info" />
```

| Tone | 背景 | 文字 |
|------|------|------|
| `neutral` | 灰底 | `#666` |
| `success` | 绿底 | `#2E7D32` |
| `warning` | 橙底 | `#C05A3C` |
| `danger` | 红底 | `#D94F4F` |
| `info` | 蓝灰底 | `#5C7C8A` |

---

### KPICard

仪表盘页面的指标卡片。

```tsx
import { KPICard } from '@/components/ui';

<div style={{ display: 'flex', gap: 20 }}>
  <KPICard label="总库存 SKU" value="234" hint="+12 本月" />
  <KPICard label="低库存预警" value="14" hint="需要补货" tone="danger" />
  <KPICard label="库存总值" value="¥2.8M" hint="环比 +8%" tone="success" />
</div>
```

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `label` | `string` | — | 指标名称 |
| `value` | `string \| number` | — | 指标数值 |
| `hint` | `string?` | — | 底部提示文字 |
| `tone` | `'neutral' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'neutral'` | 配色风格 |

> **布局提示：** KPICard 默认 `flex: 1`，放在 flex 容器内会自动等分宽度。

---

### FilterBar

简易搜索 + 下拉筛选栏（适用于不需要 FilterTabs 的简单场景）。

```tsx
import { FilterBar } from '@/components/ui';
import type { FilterConfig } from '@/components/ui';

const filters: FilterConfig[] = [
  {
    key: 'role',
    label: '所有角色',
    options: [
      { label: '管理员', value: 'admin' },
      { label: '仓管员', value: 'warehouse' },
    ],
  },
];

<FilterBar
  searchPlaceholder="搜索用户姓名、邮箱..."
  filters={filters}
/>
```

---

### FormInput / FormSelect

表单输入框和下拉选择框。

```tsx
import { FormInput, FormSelect } from '@/components/ui';

// 文本输入
<FormInput label="供应商" placeholder="请输入" required />

// 密码输入
<FormInput label="密码" type="password" placeholder="至少8位" />

// 下拉选择
<FormSelect
  label="入库仓库"
  placeholder="选择目标仓库"
  options={[
    { label: 'SZ-DC-01 (深圳主仓)', value: 'sz1' },
    { label: 'SZ-DC-02 (深圳副仓)', value: 'sz2' },
  ]}
/>
```

> **交互细节：** FormInput 聚焦时边框自动变为品牌赤色 `#C05A3C`。

---

### TabPanel

内容标签页切换。

```tsx
import { TabPanel } from '@/components/ui';
import type { Tab } from '@/components/ui';

const tabs: Tab[] = [
  {
    key: 'inventory',
    label: '库存明细',
    content: <div>库存内容...</div>,
  },
  {
    key: 'ledger',
    label: '流水记录',
    content: <div>流水内容...</div>,
  },
];

<TabPanel tabs={tabs} defaultTab="inventory" />
```

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `tabs` | `Tab[]` | — | 标签页配置 |
| `defaultTab` | `string?` | 首项 key | 默认激活 |

---

### Stepper

多步骤工作流进度条，用于 GRN 入库、OUT 出库等向导页面。

```tsx
import { Stepper } from '@/components/ui';

<Stepper
  steps={[
    { label: '基本信息', description: '来源和仓库' },
    { label: '行明细', description: 'SKU + 数量' },
    { label: '差异与证据', description: '核对数量' },
    { label: '确认过账', description: '最终确认' },
  ]}
  currentStep={1}  // 0-indexed，1 = 第二步激活
/>
```

**视觉规则：**
- `currentStep` 之前的步骤显示绿色 ✓
- `currentStep` 当前步骤显示深色背景 + 赤色圆
- `currentStep` 之后的步骤显示灰色

---

### AuthLayout

登录 / 注册 / 忘记密码页面的分屏布局（左暗右亮）。

```tsx
import { AuthLayout } from '@/components/ui';

<AuthLayout
  tagline="轻量级进销存管理系统"
  tagline2="让库存管理更简单、更高效"
>
  {/* 右侧表单内容 */}
  <h1>登录</h1>
  <form>...</form>
</AuthLayout>
```

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `logoText` | `string` | `'MINIERP'` | Logo 文字 |
| `tagline` | `string` | `'轻量级进销存管理系统'` | 主标语 |
| `tagline2` | `string?` | — | 副标语 |
| `children` | `ReactNode` | — | 右侧表单内容 |
| `footer` | `string` | `'© 2026 MiniERP. All rights reserved.'` | 底部版权 |

---

## 最佳实践

### ✅ Do

- 用 `PageHeader` 做所有页面标题，保证字号 / 字体一致
- 列表页面严格遵循**5 层模板**（Header → SearchBar → FilterTabs → DataTable → QuickPreview）
- 表格状态列统一用 `StatusBadge` + `render` 函数
- KPI 区域用 `<div style={{ display: 'flex', gap: 20 }}>` 包裹 `KPICard`
- 按钮配对用 `<>` fragment 包裹多个 `ActionButton`

### ❌ Don't

- 不要在页面里手写搜索框样式 — 用 `SearchBar`
- 不要在页面里手写标签切换 — 用 `FilterTabs`
- 不要在页面里手写侧边预览面板 — 用 `QuickPreview`
- 不要用 `<button>` 裸写按钮 — 用 `ActionButton`
- 不要改组件内的配色，如需新 tone 请更新组件本身
