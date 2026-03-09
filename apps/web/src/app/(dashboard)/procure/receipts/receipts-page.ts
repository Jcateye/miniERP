import type { TemplateFamily, TemplateFamilyVariant } from '@/contracts/template-contracts';

export type GoodsReceiptListItem = {
  readonly id: string;
  readonly grnNumber: string;
  readonly purchaseOrderNumber: string | null;
  readonly supplierName: string | null;
  readonly warehouseName: string | null;
  readonly quantityLabel: string | null;
  readonly postedAtLabel: string | null;
  readonly statusLabel: string | null;
};

export type GoodsReceiptListColumnKey =
  | 'grnNumber'
  | 'purchaseOrderNumber'
  | 'supplierName'
  | 'warehouseName'
  | 'quantity'
  | 'postedAt'
  | 'status';

export type GoodsReceiptListColumn = {
  readonly key: GoodsReceiptListColumnKey;
  readonly label: string;
};

export type GoodsReceiptListRow = {
  readonly id: string;
  readonly grnNumber: string;
  readonly purchaseOrderNumber: string;
  readonly supplierName: string;
  readonly warehouseName: string;
  readonly quantity: string;
  readonly postedAt: string;
  readonly status: string;
};

export type GoodsReceiptSearchFilters = {
  readonly keyword: string;
};

export type GoodsReceiptPagePresentation = {
  readonly family: TemplateFamily;
  readonly variant: TemplateFamilyVariant;
  readonly title: string;
  readonly summary: string;
  readonly primaryActionLabel: string;
  readonly searchPlaceholder: string;
  readonly detailHrefBase: string;
};

export const GOODS_RECEIPT_PAGE_PRESENTATION: GoodsReceiptPagePresentation = {
  family: 'T2',
  variant: 'search-list',
  title: '收货单管理',
  summary: 'GRN 收货单 · 采购入库',
  primaryActionLabel: '新建收货',
  searchPlaceholder: '搜索GRN编号, PO编号, 供应商...',
  detailHrefBase: '/procure/receipts',
};

export const GOODS_RECEIPT_LIST_COLUMNS: readonly GoodsReceiptListColumn[] = [
  { key: 'grnNumber', label: 'GRN编号' },
  { key: 'purchaseOrderNumber', label: '关联PO' },
  { key: 'supplierName', label: '供应商' },
  { key: 'warehouseName', label: '仓库' },
  { key: 'quantity', label: '数量' },
  { key: 'postedAt', label: '过账时间' },
  { key: 'status', label: '状态' },
];

function getDisplayValue(value: string | null | undefined): string {
  return value && value.trim() ? value : '—';
}

function includesKeyword(value: string | null | undefined, keyword: string): boolean {
  if (!keyword) {
    return true;
  }

  return value?.toLowerCase().includes(keyword.toLowerCase()) ?? false;
}

export function parseGoodsReceiptSearchParams(searchParams: URLSearchParams): GoodsReceiptSearchFilters {
  return {
    keyword: searchParams.get('keyword')?.trim() ?? '',
  };
}

export function buildGoodsReceiptSearchQuery(filters: GoodsReceiptSearchFilters): string {
  const params = new URLSearchParams();

  if (filters.keyword.trim()) {
    params.set('keyword', filters.keyword.trim());
  }

  return params.toString();
}

export function filterGoodsReceiptListItems(
  items: readonly GoodsReceiptListItem[],
  filters: GoodsReceiptSearchFilters,
): GoodsReceiptListItem[] {
  const keyword = filters.keyword.trim().toLowerCase();

  return items.filter((item) => {
    return (
      !keyword ||
      includesKeyword(item.grnNumber, keyword) ||
      includesKeyword(item.purchaseOrderNumber, keyword) ||
      includesKeyword(item.supplierName, keyword)
    );
  });
}

export function buildGoodsReceiptListRows(items: readonly GoodsReceiptListItem[]): GoodsReceiptListRow[] {
  return items.map((item) => ({
    id: item.id,
    grnNumber: item.grnNumber,
    purchaseOrderNumber: getDisplayValue(item.purchaseOrderNumber),
    supplierName: getDisplayValue(item.supplierName),
    warehouseName: getDisplayValue(item.warehouseName),
    quantity: getDisplayValue(item.quantityLabel),
    postedAt: getDisplayValue(item.postedAtLabel),
    status: getDisplayValue(item.statusLabel),
  }));
}
