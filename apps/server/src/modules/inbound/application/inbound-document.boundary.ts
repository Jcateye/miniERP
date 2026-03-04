import {
  assertStatusTransition,
  getDocumentModuleBoundary,
  type DocumentModuleBoundary,
} from '../../core-document/domain/status-transition';

export type GoodsReceiptStatus =
  | 'draft'
  | 'validating'
  | 'posted'
  | 'cancelled';

export interface GoodsReceiptTransitionAttempt {
  entityId: string;
  fromStatus: GoodsReceiptStatus;
  toStatus: GoodsReceiptStatus;
}

export const inboundDocumentBoundary: DocumentModuleBoundary =
  getDocumentModuleBoundary('inbound');

export function assertGoodsReceiptStatusTransition(
  attempt: GoodsReceiptTransitionAttempt,
): void {
  assertStatusTransition({
    entityType: 'GRN',
    entityId: attempt.entityId,
    fromStatus: attempt.fromStatus,
    toStatus: attempt.toStatus,
  });
}
