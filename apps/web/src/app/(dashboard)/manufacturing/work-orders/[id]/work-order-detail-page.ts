export type WorkOrderDetailSummaryItem = {
  id: string;
  label: string;
  value: string;
};

export type WorkOrderDetailSection = {
  id: string;
  title: string;
  body: string;
};

export const WORK_ORDER_DETAIL_PAGE_PRESENTATION = {
  family: 'T3',
  summary: '工单详情 · 详情数据接入中',
  backLabel: '返回生产视图',
  backHref: '/manufacturing/orders',
} as const;

export function buildWorkOrderDetailSummary(workOrderId: string): readonly WorkOrderDetailSummaryItem[] {
  return [
    {
      id: 'work-order-id',
      label: '工单 ID',
      value: workOrderId,
    },
    {
      id: 'operation',
      label: '工序',
      value: '待接入',
    },
    {
      id: 'work-center',
      label: '工作中心',
      value: '待接入',
    },
  ];
}

export function buildWorkOrderDetailSections(): readonly WorkOrderDetailSection[] {
  return [
    {
      id: 'operation',
      title: '工序',
      body: '该区块待接入真实详情数据。',
    },
    {
      id: 'work-center',
      title: '工作中心',
      body: '该区块待接入真实详情数据。',
    },
    {
      id: 'reporting',
      title: '报工结果',
      body: '该区块待接入真实详情数据。',
    },
    {
      id: 'quality',
      title: '质量记录',
      body: '该区块待接入真实详情数据。',
    },
  ];
}
