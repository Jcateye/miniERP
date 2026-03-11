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
    title: 'SKU 主数据待核对',
    summary: '检查当前物料台账与关键字段完整性',
    meta: '今天 09:12 · 主数据',
    href: '/mdm/items',
  },
  {
    id: 'todo_002',
    title: '报表中心待查看',
    summary: '确认经营分析首页与报表详情入口状态',
    meta: '今天 09:47 · 报表',
    href: '/reports',
  },
  {
    id: 'todo_003',
    title: '工作台信息待整理',
    summary: '回到首页补充今日协作摘要与操作入口',
    meta: '今天 10:05 · 工作台',
    href: '/workspace',
  },
];

export const WORKSPACE_HOME_RIGHT_PANEL_SECTIONS: readonly WorkspaceHomePanelSection[] = [
  {
    id: 'quick-links',
    title: '快捷入口',
    items: [
      { id: 'quick-home', label: '工作台首页', href: '/workspace' },
      { id: 'quick-sku', label: 'SKU 管理', href: '/mdm/items' },
      { id: 'quick-reports', label: '报表中心', href: '/reports' },
    ],
  },
  {
    id: 'recent-actions',
    title: '最近动作',
    items: [
      { id: 'recent-1', label: '查看 SKU 列表更新', href: '/mdm/items' },
      { id: 'recent-2', label: '进入报表中心', href: '/reports' },
      { id: 'recent-3', label: '返回工作台首页', href: '/workspace' },
    ],
  },
];
