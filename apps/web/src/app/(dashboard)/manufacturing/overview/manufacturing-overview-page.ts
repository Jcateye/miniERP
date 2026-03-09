export type ManufacturingOverviewMetric = {
  id: string;
  label: string;
  value: string;
};

export type ManufacturingOverviewQuickLink = {
  id: string;
  title: string;
  description: string;
  href: string;
};

export const MANUFACTURING_OVERVIEW_PAGE_PRESENTATION = {
  family: 'T1',
  title: '制造总览',
  summary: '生产订单 · 工单执行 · BOM 协同 · 质检追踪',
} as const;

export const MANUFACTURING_OVERVIEW_METRICS: readonly ManufacturingOverviewMetric[] = [
  {
    id: 'orders',
    label: '生产订单',
    value: '12 个进行中',
  },
  {
    id: 'work-orders',
    label: '工单',
    value: '28 个待报工',
  },
  {
    id: 'quality',
    label: '质检',
    value: '4 个待处理',
  },
];

export const MANUFACTURING_OVERVIEW_QUICK_LINKS: readonly ManufacturingOverviewQuickLink[] = [
  {
    id: 'orders',
    title: '生产订单',
    description: '查看下达、齐套与排产中的订单。',
    href: '/manufacturing/orders',
  },
  {
    id: 'work-orders',
    title: '工单',
    description: '进入工序执行、报工与完工追踪。',
    href: '/manufacturing/orders',
  },
  {
    id: 'bom',
    title: 'BOM',
    description: '核对成品结构、版本与替代料。',
    href: '/mdm/boms',
  },
  {
    id: 'quality',
    title: '质检',
    description: '查看来料、过程与出货检验记录。',
    href: '/quality/records',
  },
];
