export type ManufacturingOrderDetailSummaryItem = {
  id: string;
  label: string;
  value: string;
};

export type ManufacturingOrderDetailSection = {
  id: string;
  title: string;
  body: string;
};

export const MANUFACTURING_ORDER_DETAIL_PAGE_PRESENTATION = {
  family: 'T3',
  summary: '生产订单详情 · 详情数据接入中',
  backLabel: '返回生产订单',
  backHref: '/manufacturing/orders',
} as const;

export function buildManufacturingOrderDetailSummary(orderId: string): readonly ManufacturingOrderDetailSummaryItem[] {
  return [
    {
      id: 'order-id',
      label: '订单 ID',
      value: orderId,
    },
    {
      id: 'work-orders',
      label: '工单',
      value: '待接入',
    },
    {
      id: 'receipt-status',
      label: '完工入库',
      value: '待接入',
    },
  ];
}

export function buildManufacturingOrderDetailSections(): readonly ManufacturingOrderDetailSection[] {
  return [
    {
      id: 'work-orders',
      title: '工单',
      body: '该区块待接入真实详情数据。',
    },
    {
      id: 'issue-return',
      title: '领退料',
      body: '该区块待接入真实详情数据。',
    },
    {
      id: 'reporting',
      title: '报工',
      body: '该区块待接入真实详情数据。',
    },
    {
      id: 'receipt',
      title: '完工入库',
      body: '该区块待接入真实详情数据。',
    },
  ];
}
