export type InventoryCountDetailSummaryItem = {
  readonly id: string;
  readonly label: string;
  readonly value: string;
};

export type InventoryCountDetailSection = {
  readonly id: string;
  readonly title: string;
  readonly body: string;
};

export const INVENTORY_COUNT_DETAIL_PAGE_PRESENTATION = {
  family: 'T3',
  title: '盘点详情',
  summary: '盘点详情数据接入中',
  backLabel: '返回盘点列表',
  backHref: '/inventory/counts',
  primaryActionLabel: '详情待接入',
} as const;

export function buildInventoryCountDetailSummary(
  countId: string,
): readonly InventoryCountDetailSummaryItem[] {
  return [
    {
      id: 'count-id',
      label: '盘点单 ID',
      value: countId,
    },
    {
      id: 'warehouse',
      label: '盘点仓库',
      value: '待接入',
    },
    {
      id: 'status',
      label: '单据状态',
      value: '待接入',
    },
  ];
}

export function buildInventoryCountDetailSections(): readonly InventoryCountDetailSection[] {
  return [
    {
      id: 'scope',
      title: '盘点范围',
      body: '该区块待接入真实盘点详情数据。',
    },
    {
      id: 'difference',
      title: '盘点差异',
      body: '该区块待接入真实盘点详情数据。',
    },
    {
      id: 'review',
      title: '复核记录',
      body: '该区块待接入真实盘点详情数据。',
    },
    {
      id: 'adjustment',
      title: '调整建议',
      body: '该区块待接入真实盘点详情数据。',
    },
  ];
}
