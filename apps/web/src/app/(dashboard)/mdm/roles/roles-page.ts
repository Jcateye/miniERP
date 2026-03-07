import type { TemplateFamily, TemplateFamilyVariant } from '@/contracts/template-contracts';

export type RoleListItem = {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly permissionCountLabel: string | null;
  readonly userCountLabel: string | null;
  readonly statusLabel: string | null;
};

export type RoleListColumnKey = 'name' | 'description' | 'permissionCount' | 'userCount' | 'status';

export type RoleListColumn = {
  readonly key: RoleListColumnKey;
  readonly label: string;
};

export type RoleListRow = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly permissionCount: string;
  readonly userCount: string;
  readonly status: string;
  readonly detailHref?: string;
};

export type RolePagePresentation = {
  readonly family: TemplateFamily;
  readonly variant: TemplateFamilyVariant;
  readonly title: string;
  readonly summary: string;
  readonly primaryActionLabel: string;
  readonly detailHrefBase: string;
};

export const ROLE_PAGE_PRESENTATION: RolePagePresentation = {
  family: 'T2',
  variant: 'simple-list',
  title: '角色权限',
  summary: '角色 · 权限配置',
  primaryActionLabel: '新建角色',
  detailHrefBase: '/mdm/roles',
};

export const ROLE_LIST_COLUMNS: readonly RoleListColumn[] = [
  { key: 'name', label: '角色名称' },
  { key: 'description', label: '描述' },
  { key: 'permissionCount', label: '权限数' },
  { key: 'userCount', label: '用户数' },
  { key: 'status', label: '状态' },
];

function getDisplayValue(value: string | null | undefined): string {
  return value && value.trim() ? value : '—';
}

export function buildRoleListRows(items: readonly RoleListItem[]): RoleListRow[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    description: getDisplayValue(item.description),
    permissionCount: getDisplayValue(item.permissionCountLabel),
    userCount: getDisplayValue(item.userCountLabel),
    status: getDisplayValue(item.statusLabel),
  }));
}
