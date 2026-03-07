import type { TemplateFamily, TemplateFamilyVariant } from '@/contracts/template-contracts';

export type UserListItem = {
  readonly id: string;
  readonly username: string;
  readonly name: string;
  readonly roleLabel: string | null;
  readonly departmentLabel: string | null;
  readonly lastLoginLabel: string | null;
  readonly statusLabel: string | null;
};

export type UserListColumnKey = 'username' | 'name' | 'role' | 'department' | 'lastLogin' | 'status';

export type UserListColumn = {
  readonly key: UserListColumnKey;
  readonly label: string;
};

export type UserListRow = {
  readonly id: string;
  readonly username: string;
  readonly name: string;
  readonly role: string;
  readonly department: string;
  readonly lastLogin: string;
  readonly status: string;
  readonly detailHref?: string;
};

export type UserPagePresentation = {
  readonly family: TemplateFamily;
  readonly variant: TemplateFamilyVariant;
  readonly title: string;
  readonly summary: string;
  readonly primaryActionLabel: string;
  readonly detailHrefBase: string;
};

export const USER_PAGE_PRESENTATION: UserPagePresentation = {
  family: 'T2',
  variant: 'simple-list',
  title: '用户管理',
  summary: '用户 · 权限管理',
  primaryActionLabel: '新建用户',
  detailHrefBase: '/mdm/users',
};

export const USER_LIST_COLUMNS: readonly UserListColumn[] = [
  { key: 'username', label: '用户名' },
  { key: 'name', label: '姓名' },
  { key: 'role', label: '角色' },
  { key: 'department', label: '部门' },
  { key: 'lastLogin', label: '最近登录' },
  { key: 'status', label: '状态' },
];

function getDisplayValue(value: string | null | undefined): string {
  return value && value.trim() ? value : '—';
}

export function buildUserListRows(items: readonly UserListItem[]): UserListRow[] {
  return items.map((item) => ({
    id: item.id,
    username: item.username,
    name: item.name,
    role: getDisplayValue(item.roleLabel),
    department: getDisplayValue(item.departmentLabel),
    lastLogin: getDisplayValue(item.lastLoginLabel),
    status: getDisplayValue(item.statusLabel),
  }));
}
