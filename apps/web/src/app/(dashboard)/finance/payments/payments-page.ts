import type { PaymentStatus } from '@minierp/shared/types';

export type PaymentListItem = {
  readonly id: string;
  readonly code: string;
  readonly supplierName: string;
  readonly paymentDate: string;
  readonly amountLabel: string | null;
  readonly methodLabel: string | null;
  readonly reconciledAmountLabel: string | null;
  readonly status: PaymentStatus;
};

export type PaymentListColumnKey =
  | 'code'
  | 'supplierName'
  | 'paymentDate'
  | 'amount'
  | 'method'
  | 'reconciledAmount'
  | 'status';

export type PaymentListColumn = {
  readonly key: PaymentListColumnKey;
  readonly label: string;
};

export type PaymentListRow = {
  readonly id: string;
  readonly code: string;
  readonly supplierName: string;
  readonly paymentDate: string;
  readonly amount: string;
  readonly method: string;
  readonly reconciledAmount: string;
  readonly status: string;
  readonly detailHref?: string;
};

export type PaymentPagePresentation = {
  readonly family: 'T2';
  readonly variant: 'simple-list';
  readonly title: string;
  readonly summary: string;
  readonly primaryActionLabel: string;
  readonly seedNotice: string;
  readonly detailHrefBase: string;
};

export const PAYMENT_PAGE_SEED_NOTICE = '当前为演示数据列表，真实付款数据与表单流程尚未接入。';

export const PAYMENT_PAGE_PRESENTATION: PaymentPagePresentation = {
  family: 'T2',
  variant: 'simple-list',
  title: '付款管理',
  summary: 'Payments · 供应商付款',
  primaryActionLabel: '新建付款',
  seedNotice: PAYMENT_PAGE_SEED_NOTICE,
  detailHrefBase: '/finance/payments',
};

export const PAYMENT_LIST_COLUMNS: readonly PaymentListColumn[] = [
  { key: 'code', label: '付款编号' },
  { key: 'supplierName', label: '供应商' },
  { key: 'paymentDate', label: '日期' },
  { key: 'amount', label: '金额' },
  { key: 'method', label: '方式' },
  { key: 'reconciledAmount', label: '已核销' },
  { key: 'status', label: '状态' },
];

function getDisplayValue(value: string | null | undefined): string {
  return value && value.trim() ? value : '—';
}

function getPaymentStatusLabel(status: PaymentStatus): string {
  switch (status) {
    case 'draft':
      return '草稿';
    case 'confirmed':
      return '待审批';
    case 'settled':
      return '已核销';
    case 'cancelled':
      return '已取消';
    default:
      return '未知状态';
  }
}

export function buildPaymentListRows(items: readonly PaymentListItem[]): PaymentListRow[] {
  return items.map((item) => ({
    id: item.id,
    code: item.code,
    supplierName: item.supplierName,
    paymentDate: item.paymentDate,
    amount: getDisplayValue(item.amountLabel),
    method: getDisplayValue(item.methodLabel),
    reconciledAmount: getDisplayValue(item.reconciledAmountLabel),
    status: getPaymentStatusLabel(item.status),
  }));
}
