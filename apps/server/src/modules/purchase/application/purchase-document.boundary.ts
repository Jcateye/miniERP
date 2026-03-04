import {
  assertStatusTransition,
  getDocumentModuleBoundary,
  type DocumentModuleBoundary,
} from '../../core-document/domain/status-transition';

export type PurchaseOrderStatus =
  | 'draft'
  | 'confirmed'
  | 'closed'
  | 'cancelled';

export interface PurchaseOrderTransitionAttempt {
  entityId: string;
  fromStatus: PurchaseOrderStatus;
  toStatus: PurchaseOrderStatus;
}

export const purchaseDocumentBoundary: DocumentModuleBoundary =
  getDocumentModuleBoundary('purchase');

export function assertPurchaseOrderStatusTransition(
  attempt: PurchaseOrderTransitionAttempt,
): void {
  assertStatusTransition({
    entityType: 'PO',
    entityId: attempt.entityId,
    fromStatus: attempt.fromStatus,
    toStatus: attempt.toStatus,
  });
}
