import type { TemplateFamily, TemplateFamilyVariant } from '@/contracts/template-contracts';

export type AdjustmentListItem = {
  readonly id: string;
  readonly documentNumber: string;
  readonly warehouseName: string | null;
  readonly dateLabel: string | null;
  readonly lineCountLabel: string | null;
  readonly quantityLabel: string | null;
  readonly reasonLabel: string | null;
  readonly statusLabel: string | null;
};

export type AdjustmentListColumnKey =
  | 'documentNumber'
  | 'warehouseName'
  | 'date'
  | 'lineCount'
  | 'quantity'
  | 'reason'
  | 'status';

export type AdjustmentListColumn = {
  readonly key: AdjustmentListColumnKey;
  readonly label: string;
};

export type AdjustmentListRow = {
  readonly id: string;
  readonly documentNumber: string;
  readonly warehouseName: string;
  readonly date: string;
  readonly lineCount: string;
  readonly quantity: string;
  readonly reason: string;
  readonly status: string;
  readonly detailHref?: string;
};

export type AdjustmentPagePresentation = {
  readonly family: TemplateFamily;
  readonly variant: TemplateFamilyVariant;
  readonly title: string;
  readonly summary: string;
  readonly primaryActionLabel: string;
  readonly detailHrefBase: string;
};

export const ADJUSTMENT_PAGE_PRESENTATION: AdjustmentPagePresentation = {
  family: 'T2',
  variant: 'simple-list',
  title: '库存调整',
  summary: 'Adjustments · 调整事务',
  primaryActionLabel: '新建调整',
  detailHrefBase: '/inventory/adjustments',
};

export const ADJUSTMENT_LIST_COLUMNS: readonly AdjustmentListColumn[] = [
  { key: 'documentNumber', label: '调整单号' },
  { key: 'warehouseName', label: '仓库' },
  { key: 'date', label: '日期' },
  { key: 'lineCount', label: '行数' },
  { key: 'quantity', label: '调整数量' },
  { key: 'reason', label: '原因' },
  { key: 'status', label: '状态' },
];

function getDisplayValue(value: string | null | undefined): string {
  return value && value.trim() ? value : '—';
}

export function buildAdjustmentListRows(items: readonly AdjustmentListItem[]): AdjustmentListRow[] {
  return items.map((item) => ({
    id: item.id,
    documentNumber: item.documentNumber,
    warehouseName: getDisplayValue(item.warehouseName),
    date: getDisplayValue(item.dateLabel),
    lineCount: getDisplayValue(item.lineCountLabel),
    quantity: getDisplayValue(item.quantityLabel),
    reason: getDisplayValue(item.reasonLabel),
    status: getDisplayValue(item.statusLabel),
  }));
}
