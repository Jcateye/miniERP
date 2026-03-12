import {
  assertStatusTransition,
  getDocumentModuleBoundary,
  type DocumentModuleBoundary,
} from '../../core-document/domain/status-transition';
import type { PurchaseOrderLifecycleStatus } from '../../trading/domain/trading-document.catalog';

export type PurchaseOrderStatus = PurchaseOrderLifecycleStatus;

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
