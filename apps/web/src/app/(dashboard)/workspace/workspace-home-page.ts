export type WorkspaceHomeKpiCard = {
  id: string;
  label: string;
  value: string;
  hint: string;
  accent: 'warning' | 'success' | 'info' | 'danger';
  background: string;
};

export type WorkspaceHomeTodoItem = {
  id: string;
  title: string;
  summary: string;
  meta: string;
  href?: string;
};

export type WorkspaceHomePanelSection = {
  id: string;
  title: string;
  items: ReadonlyArray<{ id: string; label: string; href?: string }>;
};

export const WORKSPACE_HOME_PAGE_PRESENTATION = {
  family: 'T1',
  title: '工作台',
  summary: '2026年2月28日 · 周五 · 下午',
  searchPlaceholder: '全局搜索 SKU / 单号 / 供应商…',
} as const;

export const WORKSPACE_HOME_KPIS: readonly WorkspaceHomeKpiCard[] = [
  {
    id: 'low-stock',
    label: '低库存 SKU',
    value: '14',
    hint: '需及时补货',
    accent: 'warning',
    background: '#FFF8F5',
  },
  {
    id: 'pending-grn',
    label: '待入库 GRN',
    value: '3',
    hint: '草稿待过账',
    accent: 'success',
    background: '#E8F5E9',
  },
  {
    id: 'pending-out',
    label: '待出库 OUT',
    value: '7',
    hint: '今日待发货',
    accent: 'info',
    background: '#F0F4F8',
  },
  {
    id: 'delayed-po',
    label: '延迟 PO',
    value: '2',
    hint: '超过预计到货日',
    accent: 'danger',
    background: '#E8E4DC',
  },
];

export const WORKSPACE_HOME_TODO_ITEMS: readonly WorkspaceHomeTodoItem[] = [
  {
    id: 'todo_001',
    title: '14 个 SKU 低库存预警',
    summary: 'SKU管理 → 库存工作台 · 低库存视图',
    meta: '今天 09:12 · 库存',
    href: '/inventory/balances',
  },
  {
    id: 'todo_002',
    title: '3 个待入库 GRN 草稿需过账',
    summary: '采购管理 → GRN工作台 · 草稿',
    meta: '今天 09:47 · 收货',
    href: '/procure/receipts',
  },
  {
    id: 'todo_003',
    title: '7 个待出库订单今日需发货',
    summary: '销售出库 → OUT工作台 · 今日待发',
    meta: '今天 10:05 · 履约',
    href: '/sales/shipments',
  },
];

export const WORKSPACE_HOME_RIGHT_PANEL_SECTIONS: readonly WorkspaceHomePanelSection[] = [
  {
    id: 'quick-links',
    title: '快捷入口',
    items: [
      { id: 'quick-sku', label: '新建 SKU', href: '/mdm/items/new' },
      { id: 'quick-grn', label: '新建入库单 GRN', href: '/procure/receipts/new' },
      { id: 'quick-out', label: '新建出库单 OUT', href: '/sales/shipments/new' },
      { id: 'quick-query', label: '库存查询', href: '/inventory/balances' },
    ],
  },
  {
    id: 'recent-actions',
    title: '最近动作',
    items: [
      { id: 'recent-1', label: '入库 GRN-2026-0142 过账', href: '/procure/receipts' },
      { id: 'recent-2', label: '出库 OUT-2026-0089 过账', href: '/sales/shipments' },
      { id: 'recent-3', label: '新建 SKU: PWR-100W-GN3', href: '/mdm/items' },
      { id: 'recent-4', label: '盘点 ST-2026-0012 完成', href: '/inventory/counts' },
    ],
  },
];
