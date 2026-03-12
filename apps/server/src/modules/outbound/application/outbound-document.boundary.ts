import {
  assertStatusTransition,
  getDocumentModuleBoundary,
  type DocumentModuleBoundary,
} from '../../core-document/domain/status-transition';
import type { ShipmentLifecycleStatus } from '../../trading/domain/trading-document.catalog';

export type OutboundDocumentStatus = ShipmentLifecycleStatus;

export interface OutboundDocumentTransitionAttempt {
  entityId: string;
  fromStatus: OutboundDocumentStatus;
  toStatus: OutboundDocumentStatus;
}

export const outboundDocumentBoundary: DocumentModuleBoundary =
  getDocumentModuleBoundary('outbound');

export function assertOutboundDocumentStatusTransition(
  attempt: OutboundDocumentTransitionAttempt,
): void {
  assertStatusTransition({
    entityType: 'OUT',
    entityId: attempt.entityId,
    fromStatus: attempt.fromStatus,
    toStatus: attempt.toStatus,
  });
}
