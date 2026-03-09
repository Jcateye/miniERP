export type NewInventoryCountStep = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
};

export type NewInventoryCountSection = {
  readonly id: string;
  readonly title: string;
  readonly body: string;
};

export const NEW_INVENTORY_COUNT_PAGE_PRESENTATION = {
  family: 'T4',
  title: '新建盘点',
  summary: '盘点创建信息接入中',
  backLabel: '返回盘点列表',
  backHref: '/inventory/counts',
  primaryActionLabel: '创建待接入',
} as const;

export function buildNewInventoryCountSteps(): readonly NewInventoryCountStep[] {
  return [
    {
      id: 'basic',
      title: '基础信息',
      description: '选择仓库、责任人与盘点日期。',
    },
    {
      id: 'scope',
      title: '盘点范围',
      description: '定义盘点范围与抽盘规则。',
    },
    {
      id: 'review',
      title: '复核提交',
      description: '确认任务并创建盘点单。',
    },
  ];
}

export function buildNewInventoryCountSections(): readonly NewInventoryCountSection[] {
  return [
    {
      id: 'basic',
      title: '基础信息',
      body: '该区块待接入真实盘点创建表单。',
    },
    {
      id: 'scope',
      title: '盘点范围',
      body: '该区块待接入真实盘点创建表单。',
    },
    {
      id: 'review',
      title: '复核提交',
      body: '该区块待接入真实盘点创建表单。',
    },
  ];
}
