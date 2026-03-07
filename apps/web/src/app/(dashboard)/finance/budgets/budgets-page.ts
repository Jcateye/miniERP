import type { TemplateFamily, TemplateFamilyVariant } from '@/contracts/template-contracts';

export type BudgetListItem = {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly periodLabel: string | null;
  readonly budgetAmountLabel: string | null;
  readonly usedAmountLabel: string | null;
  readonly remainingAmountLabel: string | null;
  readonly statusLabel: string | null;
};

export type BudgetListColumnKey =
  | 'code'
  | 'name'
  | 'period'
  | 'budgetAmount'
  | 'usedAmount'
  | 'remainingAmount'
  | 'status';

export type BudgetListColumn = {
  readonly key: BudgetListColumnKey;
  readonly label: string;
};

export type BudgetListRow = {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly period: string;
  readonly budgetAmount: string;
  readonly usedAmount: string;
  readonly remainingAmount: string;
  readonly status: string;
  readonly detailHref?: string;
};

export type BudgetPagePresentation = {
  readonly family: TemplateFamily;
  readonly variant: TemplateFamilyVariant;
  readonly title: string;
  readonly summary: string;
  readonly primaryActionLabel: string;
  readonly detailHrefBase: string;
};

export const BUDGET_PAGE_PRESENTATION: BudgetPagePresentation = {
  family: 'T2',
  variant: 'simple-list',
  title: '预算管理',
  summary: 'Budgets · 预算编制与控制',
  primaryActionLabel: '新建预算',
  detailHrefBase: '/finance/budgets',
};

export const BUDGET_LIST_COLUMNS: readonly BudgetListColumn[] = [
  { key: 'code', label: '编号' },
  { key: 'name', label: '预算名称' },
  { key: 'period', label: '期间' },
  { key: 'budgetAmount', label: '预算金额' },
  { key: 'usedAmount', label: '已使用' },
  { key: 'remainingAmount', label: '剩余' },
  { key: 'status', label: '状态' },
];

function getDisplayValue(value: string | null | undefined): string {
  return value && value.trim() ? value : '—';
}

export function buildBudgetListRows(items: readonly BudgetListItem[]): BudgetListRow[] {
  return items.map((item) => ({
    id: item.id,
    code: item.code,
    name: item.name,
    period: getDisplayValue(item.periodLabel),
    budgetAmount: getDisplayValue(item.budgetAmountLabel),
    usedAmount: getDisplayValue(item.usedAmountLabel),
    remainingAmount: getDisplayValue(item.remainingAmountLabel),
    status: getDisplayValue(item.statusLabel),
  }));
}
