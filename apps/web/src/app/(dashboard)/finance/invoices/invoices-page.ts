import type { InvoiceStatus } from '@minierp/shared/types';

export type InvoiceListItem = {
  readonly id: string;
  readonly code: string;
  readonly counterpartyName: string;
  readonly issuedDate: string;
  readonly amountLabel: string | null;
  readonly outstandingAmountLabel: string | null;
  readonly categoryLabel: string | null;
  readonly status: InvoiceStatus;
};

export type InvoiceListColumnKey =
  | 'code'
  | 'counterpartyName'
  | 'issuedDate'
  | 'amount'
  | 'outstandingAmount'
  | 'category'
  | 'status';

export type InvoiceListColumn = {
  readonly key: InvoiceListColumnKey;
  readonly label: string;
};

export type InvoiceListRow = {
  readonly id: string;
  readonly code: string;
  readonly counterpartyName: string;
  readonly issuedDate: string;
  readonly amount: string;
  readonly outstandingAmount: string;
  readonly category: string;
  readonly status: string;
  readonly detailHref?: string;
};

export type InvoicePagePresentation = {
  readonly family: 'T2';
  readonly variant: 'simple-list';
  readonly title: string;
  readonly summary: string;
  readonly primaryActionLabel: string;
  readonly seedNotice: string;
  readonly detailHrefBase: string;
};

export const INVOICE_PAGE_SEED_NOTICE = '当前为演示数据列表，真实发票数据与表单流程尚未接入。';

export const INVOICE_PAGE_PRESENTATION: InvoicePagePresentation = {
  family: 'T2',
  variant: 'simple-list',
  title: '发票管理',
  summary: 'Invoices · 开票与红冲',
  primaryActionLabel: '新建发票',
  seedNotice: INVOICE_PAGE_SEED_NOTICE,
  detailHrefBase: '/finance/invoices',
};

export const INVOICE_LIST_COLUMNS: readonly InvoiceListColumn[] = [
  { key: 'code', label: '发票编号' },
  { key: 'counterpartyName', label: '往来方' },
  { key: 'issuedDate', label: '开票日期' },
  { key: 'amount', label: '金额' },
  { key: 'outstandingAmount', label: '未结清' },
  { key: 'category', label: '票种' },
  { key: 'status', label: '状态' },
];

function getDisplayValue(value: string | null | undefined): string {
  return value && value.trim() ? value : '—';
}

function getInvoiceStatusLabel(status: InvoiceStatus): string {
  switch (status) {
    case 'draft':
      return '草稿';
    case 'issued':
      return '已开票';
    case 'partially_settled':
      return '部分结清';
    case 'settled':
      return '已结清';
    case 'reversed':
      return '已红冲';
    case 'cancelled':
      return '已取消';
    default:
      return '未知状态';
  }
}

export function buildInvoiceListRows(items: readonly InvoiceListItem[]): InvoiceListRow[] {
  return items.map((item) => ({
    id: item.id,
    code: item.code,
    counterpartyName: item.counterpartyName,
    issuedDate: item.issuedDate,
    amount: getDisplayValue(item.amountLabel),
    outstandingAmount: getDisplayValue(item.outstandingAmountLabel),
    category: getDisplayValue(item.categoryLabel),
    status: getInvoiceStatusLabel(item.status),
  }));
}
