import type { TemplateFamily, TemplateFamilyVariant } from '@/contracts/template-contracts';

export type OrganizationListItem = {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly typeLabel: string | null;
  readonly parentName: string | null;
  readonly statusLabel: string | null;
};

export type OrganizationListColumnKey = 'code' | 'name' | 'type' | 'parentName' | 'status';

export type OrganizationListColumn = {
  readonly key: OrganizationListColumnKey;
  readonly label: string;
};

export type OrganizationListRow = {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly type: string;
  readonly parentName: string;
  readonly status: string;
  readonly detailHref?: string;
};

export type OrganizationPagePresentation = {
  readonly family: TemplateFamily;
  readonly variant: TemplateFamilyVariant;
  readonly title: string;
  readonly summary: string;
  readonly primaryActionLabel: string;
  readonly detailHrefBase: string;
};

export const ORGANIZATION_PAGE_PRESENTATION: OrganizationPagePresentation = {
  family: 'T2',
  variant: 'simple-list',
  title: '组织管理',
  summary: '公司 · 组织单元',
  primaryActionLabel: '新建组织',
  detailHrefBase: '/mdm/organizations',
};

export const ORGANIZATION_LIST_COLUMNS: readonly OrganizationListColumn[] = [
  { key: 'code', label: '编号' },
  { key: 'name', label: '名称' },
  { key: 'type', label: '类型' },
  { key: 'parentName', label: '上级组织' },
  { key: 'status', label: '状态' },
];

function getDisplayValue(value: string | null | undefined): string {
  return value && value.trim() ? value : '—';
}

export function buildOrganizationListRows(items: readonly OrganizationListItem[]): OrganizationListRow[] {
  return items.map((item) => ({
    id: item.id,
    code: item.code,
    name: item.name,
    type: getDisplayValue(item.typeLabel),
    parentName: getDisplayValue(item.parentName),
    status: getDisplayValue(item.statusLabel),
  }));
}
