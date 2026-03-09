import type { TemplateFamily, TemplateFamilyVariant } from '@/contracts/template-contracts';

export type ManufacturingOrderListItem = {
  readonly id: string;
  readonly orderNumber: string;
  readonly itemName: string | null;
  readonly bomVersion: string | null;
  readonly plannedQuantityLabel: string | null;
  readonly plannedStartAtLabel: string | null;
  readonly ownerName: string | null;
  readonly statusLabel: string | null;
};

export type ManufacturingOrderListColumnKey =
  | 'orderNumber'
  | 'itemName'
  | 'bomVersion'
  | 'plannedQuantity'
  | 'plannedStartAt'
  | 'ownerName'
  | 'status';

export type ManufacturingOrderListColumn = {
  readonly key: ManufacturingOrderListColumnKey;
  readonly label: string;
};

export type ManufacturingOrderListRow = {
  readonly id: string;
  readonly orderNumber: string;
  readonly itemName: string;
  readonly bomVersion: string;
  readonly plannedQuantity: string;
  readonly plannedStartAt: string;
  readonly ownerName: string;
  readonly status: string;
  readonly detailHref?: string;
};

export type ManufacturingOrderPagePresentation = {
  readonly family: TemplateFamily;
  readonly variant: TemplateFamilyVariant;
  readonly title: string;
  readonly summary: string;
  readonly primaryActionLabel: string;
  readonly detailHrefBase: string;
};

export const MANUFACTURING_ORDER_PAGE_PRESENTATION: ManufacturingOrderPagePresentation = {
  family: 'T2',
  variant: 'simple-list',
  title: '生产订单',
  summary: 'Manufacturing Orders · 下达与齐套',
  primaryActionLabel: '新建生产订单',
  detailHrefBase: '/manufacturing/orders',
};

export const MANUFACTURING_ORDER_LIST_COLUMNS: readonly ManufacturingOrderListColumn[] = [
  { key: 'orderNumber', label: 'MO编号' },
  { key: 'itemName', label: '成品' },
  { key: 'bomVersion', label: 'BOM版本' },
  { key: 'plannedQuantity', label: '计划数量' },
  { key: 'plannedStartAt', label: '计划开工' },
  { key: 'ownerName', label: '负责人' },
  { key: 'status', label: '状态' },
];

function getDisplayValue(value: string | null | undefined): string {
  return value && value.trim() ? value : '—';
}

export function buildManufacturingOrderListRows(
  items: readonly ManufacturingOrderListItem[],
): ManufacturingOrderListRow[] {
  return items.map((item) => ({
    id: item.id,
    orderNumber: item.orderNumber,
    itemName: getDisplayValue(item.itemName),
    bomVersion: getDisplayValue(item.bomVersion),
    plannedQuantity: getDisplayValue(item.plannedQuantityLabel),
    plannedStartAt: getDisplayValue(item.plannedStartAtLabel),
    ownerName: getDisplayValue(item.ownerName),
    status: getDisplayValue(item.statusLabel),
  }));
}
