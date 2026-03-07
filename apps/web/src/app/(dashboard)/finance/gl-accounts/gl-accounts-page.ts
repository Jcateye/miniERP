import type { TemplateFamily, TemplateFamilyVariant } from '@/contracts/template-contracts';

export type GlAccountListItem = {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly categoryLabel: string | null;
  readonly currencyControlledLabel: string | null;
  readonly parentAccountLabel: string | null;
  readonly statusLabel: string | null;
  readonly level: number;
};

export type GlAccountListColumnKey =
  | 'code'
  | 'name'
  | 'category'
  | 'currencyControlled'
  | 'parentAccount'
  | 'status';

export type GlAccountListColumn = {
  readonly key: GlAccountListColumnKey;
  readonly label: string;
};

export type GlAccountListRow = {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly category: string;
  readonly currencyControlled: string;
  readonly parentAccount: string;
  readonly status: string;
  readonly detailHref?: string;
};

export type GlAccountPagePresentation = {
  readonly family: TemplateFamily;
  readonly variant: TemplateFamilyVariant;
  readonly title: string;
  readonly summary: string;
  readonly primaryActionLabel: string;
  readonly seedNotice: string;
  readonly detailHrefBase: string;
};

export const GL_ACCOUNT_PAGE_SEED_NOTICE = '当前为演示科目表数据，真实科目树、属性维护与启停流程尚未接入。';

export const GL_ACCOUNT_PAGE_PRESENTATION: GlAccountPagePresentation = {
  family: 'T2',
  variant: 'tree-list',
  title: '科目表',
  summary: 'Chart of Accounts · 会计科目',
  primaryActionLabel: '新建科目',
  seedNotice: GL_ACCOUNT_PAGE_SEED_NOTICE,
  detailHrefBase: '/finance/gl-accounts',
};

export const GL_ACCOUNT_LIST_COLUMNS: readonly GlAccountListColumn[] = [
  { key: 'code', label: '科目编码' },
  { key: 'name', label: '科目名称' },
  { key: 'category', label: '类型' },
  { key: 'currencyControlled', label: '币种控制' },
  { key: 'parentAccount', label: '上级科目' },
  { key: 'status', label: '状态' },
];

function getDisplayValue(value: string | null | undefined): string {
  return value && value.trim() ? value : '—';
}

function getIndentedName(name: string, level: number): string {
  return `${'　'.repeat(Math.max(level, 0))}${name}`;
}

export function buildGlAccountListRows(items: readonly GlAccountListItem[]): GlAccountListRow[] {
  return items.map((item) => ({
    id: item.id,
    code: item.code,
    name: getIndentedName(item.name, item.level),
    category: getDisplayValue(item.categoryLabel),
    currencyControlled: getDisplayValue(item.currencyControlledLabel),
    parentAccount: getDisplayValue(item.parentAccountLabel),
    status: getDisplayValue(item.statusLabel),
  }));
}
