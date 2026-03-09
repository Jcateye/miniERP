import type { TemplateFamily, TemplateFamilyVariant } from '@/contracts/template-contracts';

export type ReplenishmentListItem = {
  readonly id: string;
  readonly itemCode: string;
  readonly itemName: string | null;
  readonly currentStockLabel: string | null;
  readonly safetyStockLabel: string | null;
  readonly gapLabel: string | null;
  readonly suggestedPurchaseQuantityLabel: string | null;
  readonly leadTimeLabel: string | null;
};

export type ReplenishmentListColumnKey =
  | 'itemCode'
  | 'itemName'
  | 'currentStock'
  | 'safetyStock'
  | 'gap'
  | 'suggestedPurchaseQuantity'
  | 'leadTime';

export type ReplenishmentListColumn = {
  readonly key: ReplenishmentListColumnKey;
  readonly label: string;
};

export type ReplenishmentListRow = {
  readonly id: string;
  readonly itemCode: string;
  readonly itemName: string;
  readonly currentStock: string;
  readonly safetyStock: string;
  readonly gap: string;
  readonly suggestedPurchaseQuantity: string;
  readonly leadTime: string;
  readonly detailHref?: string;
};

export type ReplenishmentPagePresentation = {
  readonly family: TemplateFamily;
  readonly variant: TemplateFamilyVariant;
  readonly title: string;
  readonly summary: string;
  readonly primaryActionLabel: string;
  readonly detailHrefBase: string;
};

export const REPLENISHMENT_PAGE_PRESENTATION: ReplenishmentPagePresentation = {
  family: 'T2',
  variant: 'simple-list',
  title: '补货建议',
  summary: 'Replenishment · 自动补货建议',
  primaryActionLabel: '批量生成PO',
  detailHrefBase: '/inventory/replenishment',
};

export const REPLENISHMENT_LIST_COLUMNS: readonly ReplenishmentListColumn[] = [
  { key: 'itemCode', label: '物料编号' },
  { key: 'itemName', label: '物料名称' },
  { key: 'currentStock', label: '当前库存' },
  { key: 'safetyStock', label: '安全库存' },
  { key: 'gap', label: '缺口' },
  { key: 'suggestedPurchaseQuantity', label: '建议采购量' },
  { key: 'leadTime', label: '交期' },
];

function getDisplayValue(value: string | null | undefined): string {
  return value && value.trim() ? value : '—';
}

export function buildReplenishmentListRows(items: readonly ReplenishmentListItem[]): ReplenishmentListRow[] {
  return items.map((item) => ({
    id: item.id,
    itemCode: item.itemCode,
    itemName: getDisplayValue(item.itemName),
    currentStock: getDisplayValue(item.currentStockLabel),
    safetyStock: getDisplayValue(item.safetyStockLabel),
    gap: getDisplayValue(item.gapLabel),
    suggestedPurchaseQuantity: getDisplayValue(item.suggestedPurchaseQuantityLabel),
    leadTime: getDisplayValue(item.leadTimeLabel),
  }));
}
