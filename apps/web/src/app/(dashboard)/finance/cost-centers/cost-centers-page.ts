import type { TemplateFamily, TemplateFamilyVariant } from '@/contracts/template-contracts';

export type CostCenterListItem = {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly ownerName: string | null;
  readonly statusLabel: string | null;
};

export type CostCenterListColumnKey = 'code' | 'name' | 'ownerName' | 'status';

export type CostCenterListColumn = {
  readonly key: CostCenterListColumnKey;
  readonly label: string;
};

export type CostCenterListRow = {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly ownerName: string;
  readonly status: string;
  readonly detailHref?: string;
};

export type CostCenterPagePresentation = {
  readonly family: TemplateFamily;
  readonly variant: TemplateFamilyVariant;
  readonly title: string;
  readonly summary: string;
  readonly primaryActionLabel: string;
  readonly seedNotice: string;
  readonly detailHrefBase: string;
};

export const COST_CENTER_PAGE_SEED_NOTICE = '当前为演示成本中心数据，真实成本归集与辅助核算流程尚未接入。';

export const COST_CENTER_PAGE_PRESENTATION: CostCenterPagePresentation = {
  family: 'T2',
  variant: 'simple-list',
  title: '成本中心',
  summary: 'Cost Centers · 成本归集',
  primaryActionLabel: '新建成本中心',
  seedNotice: COST_CENTER_PAGE_SEED_NOTICE,
  detailHrefBase: '/finance/cost-centers',
};

export const COST_CENTER_LIST_COLUMNS: readonly CostCenterListColumn[] = [
  { key: 'code', label: '编码' },
  { key: 'name', label: '名称' },
  { key: 'ownerName', label: '负责人' },
  { key: 'status', label: '状态' },
];

function getDisplayValue(value: string | null | undefined): string {
  return value && value.trim() ? value : '—';
}

export function buildCostCenterListRows(items: readonly CostCenterListItem[]): CostCenterListRow[] {
  return items.map((item) => ({
    id: item.id,
    code: item.code,
    name: item.name,
    ownerName: getDisplayValue(item.ownerName),
    status: getDisplayValue(item.statusLabel),
  }));
}
