import type { ReceiptStatus } from '@minierp/shared/types';

export type ReceiptListItem = {
  readonly id: string;
  readonly code: string;
  readonly customerName: string;
  readonly receiptDate: string;
  readonly amountLabel: string | null;
  readonly methodLabel: string | null;
  readonly reconciledAmountLabel: string | null;
  readonly status: ReceiptStatus;
};

export type ReceiptListColumnKey =
  | 'code'
  | 'customerName'
  | 'receiptDate'
  | 'amount'
  | 'method'
  | 'reconciledAmount'
  | 'status';

export type ReceiptListColumn = {
  readonly key: ReceiptListColumnKey;
  readonly label: string;
};

export type ReceiptListRow = {
  readonly id: string;
  readonly code: string;
  readonly customerName: string;
  readonly receiptDate: string;
  readonly amount: string;
  readonly method: string;
  readonly reconciledAmount: string;
  readonly status: string;
  readonly detailHref?: string;
};

export type ReceiptPagePresentation = {
  readonly family: 'T2';
  readonly variant: 'simple-list';
  readonly title: string;
  readonly summary: string;
  readonly primaryActionLabel: string;
  readonly seedNotice: string;
  readonly detailHrefBase: string;
};

export const RECEIPT_PAGE_SEED_NOTICE = '当前为演示数据列表，真实收款数据与表单流程尚未接入。';

export const RECEIPT_PAGE_PRESENTATION: ReceiptPagePresentation = {
  family: 'T2',
  variant: 'simple-list',
  title: '收款管理',
  summary: 'Receipts · 客户收款',
  primaryActionLabel: '新建收款',
  seedNotice: RECEIPT_PAGE_SEED_NOTICE,
  detailHrefBase: '/finance/receipts',
};

export const RECEIPT_LIST_COLUMNS: readonly ReceiptListColumn[] = [
  { key: 'code', label: '收款编号' },
  { key: 'customerName', label: '客户' },
  { key: 'receiptDate', label: '日期' },
  { key: 'amount', label: '金额' },
  { key: 'method', label: '方式' },
  { key: 'reconciledAmount', label: '已核销' },
  { key: 'status', label: '状态' },
];

function getDisplayValue(value: string | null | undefined): string {
  return value && value.trim() ? value : '—';
}

function getReceiptStatusLabel(status: ReceiptStatus): string {
  switch (status) {
    case 'draft':
      return '草稿';
    case 'confirmed':
      return '待核销';
    case 'settled':
      return '已核销';
    case 'cancelled':
      return '已取消';
    default:
      return '未知状态';
  }
}

export function buildReceiptListRows(items: readonly ReceiptListItem[]): ReceiptListRow[] {
  return items.map((item) => ({
    id: item.id,
    code: item.code,
    customerName: item.customerName,
    receiptDate: item.receiptDate,
    amount: getDisplayValue(item.amountLabel),
    method: getDisplayValue(item.methodLabel),
    reconciledAmount: getDisplayValue(item.reconciledAmountLabel),
    status: getReceiptStatusLabel(item.status),
  }));
}
