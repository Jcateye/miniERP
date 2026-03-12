import {
  assertStatusTransition,
  getDocumentModuleBoundary,
  type DocumentModuleBoundary,
} from '../../core-document/domain/status-transition';
import type { SalesOrderLifecycleStatus } from '../../trading/domain/trading-document.catalog';

export type SalesOrderStatus = SalesOrderLifecycleStatus;

export interface SalesOrderTransitionAttempt {
  entityId: string;
  fromStatus: SalesOrderStatus;
  toStatus: SalesOrderStatus;
}

export const salesDocumentBoundary: DocumentModuleBoundary =
  getDocumentModuleBoundary('sales');

export function assertSalesOrderStatusTransition(
  attempt: SalesOrderTransitionAttempt,
): void {
  assertStatusTransition({
    entityType: 'SO',
    entityId: attempt.entityId,
    fromStatus: attempt.fromStatus,
    toStatus: attempt.toStatus,
  });
}
