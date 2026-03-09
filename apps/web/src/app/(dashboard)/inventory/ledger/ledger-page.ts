import type { TemplateFamily, TemplateFamilyVariant } from '@/contracts/template-contracts';

export type InventoryLedgerItem = {
  readonly id: string;
  readonly dateLabel: string | null;
  readonly itemCode: string | null;
  readonly warehouseName: string | null;
  readonly businessTypeLabel: string | null;
  readonly directionLabel: string | null;
  readonly quantityLabel: string | null;
  readonly documentNumber: string | null;
  readonly operatorName: string | null;
};

export type InventoryLedgerColumnKey =
  | 'date'
  | 'itemCode'
  | 'warehouseName'
  | 'businessType'
  | 'direction'
  | 'quantity'
  | 'documentNumber'
  | 'operatorName';

export type InventoryLedgerColumn = {
  readonly key: InventoryLedgerColumnKey;
  readonly label: string;
};

export type InventoryLedgerRow = {
  readonly id: string;
  readonly date: string;
  readonly itemCode: string;
  readonly warehouseName: string;
  readonly businessType: string;
  readonly direction: string;
  readonly quantity: string;
  readonly documentNumber: string;
  readonly operatorName: string;
  readonly detailHref?: string;
};

export type InventoryLedgerPagePresentation = {
  readonly family: TemplateFamily;
  readonly variant: TemplateFamilyVariant;
  readonly title: string;
  readonly summary: string;
  readonly searchPlaceholder: string;
  readonly apiBasePath: string;
};

export const INVENTORY_LEDGER_PAGE_PRESENTATION: InventoryLedgerPagePresentation = {
  family: 'T2',
  variant: 'search-list',
  title: '库存流水',
  summary: 'Inventory Ledger · 全量流水审计',
  searchPlaceholder: '搜索物料, 仓库, 单据号...',
  apiBasePath: '/api/bff/inventory/ledger',
};

export const INVENTORY_LEDGER_COLUMNS: readonly InventoryLedgerColumn[] = [
  { key: 'date', label: '日期' },
  { key: 'itemCode', label: '物料编号' },
  { key: 'warehouseName', label: '仓库' },
  { key: 'businessType', label: '事务类型' },
  { key: 'direction', label: '方向' },
  { key: 'quantity', label: '数量' },
  { key: 'documentNumber', label: '来源单据' },
  { key: 'operatorName', label: '操作人' },
];

function getDisplayValue(value: string | null | undefined): string {
  return value && value.trim() ? value : '—';
}

export function buildInventoryLedgerRows(items: readonly InventoryLedgerItem[]): InventoryLedgerRow[] {
  return items.map((item) => ({
    id: item.id,
    date: getDisplayValue(item.dateLabel),
    itemCode: getDisplayValue(item.itemCode),
    warehouseName: getDisplayValue(item.warehouseName),
    businessType: getDisplayValue(item.businessTypeLabel),
    direction: getDisplayValue(item.directionLabel),
    quantity: getDisplayValue(item.quantityLabel),
    documentNumber: getDisplayValue(item.documentNumber),
    operatorName: getDisplayValue(item.operatorName),
  }));
}

export function getSeedInventoryLedgerItems(): InventoryLedgerItem[] {
  return [
    {
      id: 'ledger_001',
      dateLabel: '03-01 14:20',
      itemCode: 'CAB-ETH-CAT6',
      warehouseName: '深圳总仓',
      businessTypeLabel: '采购入库',
      directionLabel: '入库',
      quantityLabel: '+120',
      documentNumber: 'DOC-PO-20260301-005',
      operatorName: '张三',
    },
    {
      id: 'ledger_002',
      dateLabel: '03-01 16:08',
      itemCode: 'CAB-ETH-CAT6',
      warehouseName: '深圳总仓',
      businessTypeLabel: '销售出库',
      directionLabel: '出库',
      quantityLabel: '-12',
      documentNumber: 'DOC-SO-20260301-009',
      operatorName: '李四',
    },
  ];
}
