import {
  assertStatusTransition,
  getDocumentModuleBoundary,
  type DocumentModuleBoundary,
} from '../../core-document/domain/status-transition';

export type OutboundDocumentStatus =
  | 'draft'
  | 'picking'
  | 'posted'
  | 'cancelled';

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
