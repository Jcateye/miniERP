import {
  InvalidStatusTransitionError,
  assertStatusTransition,
  canTransitionStatus,
  getAllowedNextStatuses,
  getDocumentModuleBoundary,
} from './status-transition';

describe('status-transition', () => {
  it('returns purchase boundary with command and query contracts', () => {
    expect(getDocumentModuleBoundary('purchase')).toEqual({
      module: 'purchase',
      entityType: 'PO',
      initialStatus: 'draft',
      statuses: ['draft', 'confirmed', 'closed', 'cancelled'],
      commands: [
        'createPurchaseOrder',
        'confirmPurchaseOrder',
        'closePurchaseOrder',
        'cancelPurchaseOrder',
      ],
      queries: ['getPurchaseOrder', 'listPurchaseOrders'],
    });
  });

  it('accepts valid purchase, outbound and adjustment transitions', () => {
    expect(
      canTransitionStatus({
        entityType: 'PO',
        entityId: 'PO-001',
        fromStatus: 'draft',
        toStatus: 'confirmed',
      }),
    ).toBe(true);

    expect(
      canTransitionStatus({
        entityType: 'OUT',
        entityId: 'OUT-001',
        fromStatus: 'picking',
        toStatus: 'posted',
      }),
    ).toBe(true);

    expect(
      canTransitionStatus({
        entityType: 'ADJ',
        entityId: 'ADJ-001',
        fromStatus: 'draft',
        toStatus: 'validating',
      }),
    ).toBe(true);
  });

  it('exposes allowed next statuses for grn validating state', () => {
    expect(getAllowedNextStatuses('GRN', 'validating')).toEqual([
      'posted',
      'cancelled',
    ]);
  });

  it('throws normalized invalid transition error for illegal purchase transition', () => {
    expect(() =>
      assertStatusTransition({
        entityType: 'PO',
        entityId: 'PO-001',
        fromStatus: 'draft',
        toStatus: 'closed',
      }),
    ).toThrow(InvalidStatusTransitionError);

    try {
      assertStatusTransition({
        entityType: 'PO',
        entityId: 'PO-001',
        fromStatus: 'draft',
        toStatus: 'closed',
      });
      fail('expected invalid transition error');
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidStatusTransitionError);
      expect((error as InvalidStatusTransitionError).toPayload()).toEqual({
        code: 'VALIDATION_STATUS_TRANSITION_INVALID',
        category: 'state_transition',
        message: 'Illegal status transition for PO(PO-001): draft -> closed',
        details: {
          entity_type: 'PO',
          entity_id: 'PO-001',
          from_status: 'draft',
          to_status: 'closed',
          allowed_to_statuses: ['confirmed', 'cancelled'],
        },
        transition: {
          entity: 'document',
          documentType: 'PO',
          fromStatus: 'draft',
          toStatus: 'closed',
          allowedFromStatuses: ['confirmed', 'cancelled'],
        },
      });
    }
  });

  it('rejects posted grn rollback to draft', () => {
    expect(() =>
      assertStatusTransition({
        entityType: 'GRN',
        entityId: 'GRN-001',
        fromStatus: 'posted',
        toStatus: 'draft',
      }),
    ).toThrow('Illegal status transition for GRN(GRN-001): posted -> draft');
  });

  it('rejects posted adjustment rollback to draft', () => {
    expect(() =>
      assertStatusTransition({
        entityType: 'ADJ',
        entityId: 'ADJ-001',
        fromStatus: 'posted',
        toStatus: 'draft',
      }),
    ).toThrow('Illegal status transition for ADJ(ADJ-001): posted -> draft');
  });
});
