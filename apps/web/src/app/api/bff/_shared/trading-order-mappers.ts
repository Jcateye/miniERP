import type { DocumentDetailDto, DocumentListItemDto } from '@/lib/sdk/types';

import type {
  PurchaseOrderDraft,
  PurchaseOrderDraftLine,
} from '../procure/purchase-orders/_store';
import type {
  SalesOrderDraft,
  SalesOrderDraftLine,
} from '../sales/orders/_store';
import type {
  PurchaseOrderListItem,
  SalesOrderListItem,
} from '@/lib/mocks/erp-list-fixtures';

export type PurchaseOrderStatusCode =
  | 'draft'
  | 'validating'
  | 'confirmed'
  | 'closed';

export type SalesOrderStatusCode = 'draft' | 'confirmed' | 'posted';

export interface PurchaseOrderDetailPayload {
  amount: string;
  lines: readonly PurchaseOrderDraftLine[];
  orderDate: string;
  orderNo: string;
  status: PurchaseOrderStatusCode;
  supplierId: string;
  supplierLabel: string;
}

export interface SalesOrderDetailPayload {
  amount: string;
  customerId: string;
  customerLabel: string;
  lines: readonly SalesOrderDraftLine[];
  orderDate: string;
  orderNo: string;
  status: SalesOrderStatusCode;
}

export const PURCHASE_ORDER_STATUS_LABEL_BY_CODE: Record<
  PurchaseOrderStatusCode,
  PurchaseOrderListItem['status']
> = {
  closed: '已完成',
  confirmed: '待收货',
  draft: '草稿',
  validating: '待审批',
};

export const SALES_ORDER_STATUS_LABEL_BY_CODE: Record<
  SalesOrderStatusCode,
  SalesOrderListItem['status']
> = {
  confirmed: '待发货',
  draft: '草稿',
  posted: '已发货',
};

export function mapPurchaseOrderStatus(
  status: DocumentListItemDto['status'],
): PurchaseOrderListItem['status'] {
  switch (status) {
    case 'draft':
    case 'cancelled':
      return '草稿';
    case 'validating':
      return '待审批';
    case 'posted':
    case 'closed':
      return '已完成';
    default:
      return '待收货';
  }
}

export function mapSalesOrderStatus(
  status: DocumentListItemDto['status'],
): SalesOrderListItem['status'] {
  switch (status) {
    case 'posted':
    case 'picking':
    case 'closed':
      return '已发货';
    case 'draft':
    case 'cancelled':
      return '草稿';
    default:
      return '待发货';
  }
}

export function mapBackendPurchaseOrder(
  item: DocumentListItemDto,
): PurchaseOrderListItem {
  return {
    amount: Number(item.totalAmount),
    date: item.docDate,
    id: item.id,
    po: item.docNo,
    skuCount: item.lineCount,
    status: mapPurchaseOrderStatus(item.status),
    supplier: `供应商 #${item.id}`,
  };
}

export function mapBackendSalesOrder(
  item: DocumentListItemDto,
): SalesOrderListItem {
  return {
    amount: Number(item.totalAmount),
    customer: `客户 #${item.id}`,
    date: item.docDate,
    id: item.id,
    skuCount: item.lineCount,
    so: item.docNo,
    status: mapSalesOrderStatus(item.status),
  };
}

export function mapPurchaseOrderDraftStatusCodeToLabel(
  status: PurchaseOrderStatusCode,
): PurchaseOrderListItem['status'] {
  return PURCHASE_ORDER_STATUS_LABEL_BY_CODE[status];
}

export function mapSalesOrderDraftStatusCodeToLabel(
  status: SalesOrderStatusCode,
): SalesOrderListItem['status'] {
  return SALES_ORDER_STATUS_LABEL_BY_CODE[status];
}

export function mapPurchaseOrderLabelToStatusCode(
  status: PurchaseOrderListItem['status'],
): PurchaseOrderStatusCode {
  switch (status) {
    case '待审批':
      return 'validating';
    case '待收货':
      return 'confirmed';
    case '已完成':
      return 'closed';
    default:
      return 'draft';
  }
}

export function mapSalesOrderLabelToStatusCode(
  status: SalesOrderListItem['status'],
): SalesOrderStatusCode {
  switch (status) {
    case '待发货':
      return 'confirmed';
    case '已发货':
      return 'posted';
    default:
      return 'draft';
  }
}

export function mapPurchaseOrderDraftToDetail(
  draft: PurchaseOrderDraft,
): PurchaseOrderDetailPayload {
  return {
    amount: String(draft.amount),
    lines: draft.lines,
    orderDate: draft.orderDate,
    orderNo: draft.orderNo,
    status: mapPurchaseOrderLabelToStatusCode(draft.status),
    supplierId: draft.supplierId,
    supplierLabel: draft.supplierLabel ?? draft.supplierId,
  };
}

export function mapSalesOrderDraftToDetail(
  draft: SalesOrderDraft,
): SalesOrderDetailPayload {
  return {
    amount: String(draft.amount),
    customerId: draft.customerId,
    customerLabel: draft.customerLabel ?? draft.customerId,
    lines: draft.lines,
    orderDate: draft.orderDate,
    orderNo: draft.orderNo,
    status: mapSalesOrderLabelToStatusCode(draft.status),
  };
}

function toDraftLineLabel(skuId: string): string {
  return /^\d+$/.test(skuId) ? `物料 #${skuId}` : skuId;
}

function calculateDetailAmount(detail: DocumentDetailDto): string {
  const total = detail.lines.reduce((sum, line) => {
    const amount = Number(line.amount);
    return Number.isFinite(amount) ? sum + amount : sum;
  }, 0);

  return total.toFixed(2).replace(/\.00$/, '');
}

export function mapBackendPurchaseOrderDetail(
  detail: DocumentDetailDto,
): PurchaseOrderDetailPayload {
  return {
    amount: calculateDetailAmount(detail),
    lines: detail.lines.map((line) => ({
      itemId: line.skuId,
      itemLabel: line.itemNameSnapshot ?? toDraftLineLabel(line.skuId),
      qty: line.qty,
      unitPrice: line.unitPrice,
    })),
    orderDate: detail.docDate,
    orderNo: detail.docNo,
    status: mapPurchaseOrderLabelToStatusCode(mapPurchaseOrderStatus(detail.status)),
    supplierId: detail.supplierId ?? detail.counterpartyId ?? '',
    supplierLabel: detail.supplierId ?? detail.counterpartyId ?? '',
  };
}

export function mapBackendSalesOrderDetail(
  detail: DocumentDetailDto,
): SalesOrderDetailPayload {
  return {
    amount: calculateDetailAmount(detail),
    customerId: detail.customerId ?? detail.counterpartyId ?? '',
    customerLabel: detail.customerId ?? detail.counterpartyId ?? '',
    lines: detail.lines.map((line) => ({
      itemId: line.skuId,
      itemLabel: line.itemNameSnapshot ?? toDraftLineLabel(line.skuId),
      qty: line.qty,
      unitPrice: line.unitPrice,
    })),
    orderDate: detail.docDate,
    orderNo: detail.docNo,
    status: mapSalesOrderLabelToStatusCode(mapSalesOrderStatus(detail.status)),
  };
}
