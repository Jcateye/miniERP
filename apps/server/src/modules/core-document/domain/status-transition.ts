import { HttpException, HttpStatus } from '@nestjs/common';

export const CORE_DOCUMENT_MODULES = [
  'purchase',
  'inbound',
  'sales',
  'outbound',
] as const;

export const CORE_DOCUMENT_TYPES = ['PO', 'GRN', 'SO', 'OUT', 'ADJ'] as const;

export const CORE_DOCUMENT_STATUSES = [
  'draft',
  'confirmed',
  'closed',
  'cancelled',
  'validating',
  'posted',
  'picking',
] as const;

export type CoreDocumentModule = (typeof CORE_DOCUMENT_MODULES)[number];
export type CoreDocumentType = (typeof CORE_DOCUMENT_TYPES)[number];
export type CoreDocumentStatus = (typeof CORE_DOCUMENT_STATUSES)[number];

export interface InvalidStatusTransitionDetails {
  entity_type: CoreDocumentType;
  entity_id: string;
  from_status: CoreDocumentStatus;
  to_status: CoreDocumentStatus;
  allowed_to_statuses: readonly CoreDocumentStatus[];
}

export interface InvalidStatusTransitionPayload {
  code: 'VALIDATION_STATUS_TRANSITION_INVALID';
  category: 'state_transition';
  message: string;
  details: InvalidStatusTransitionDetails;
}

export interface InvalidStatusTransitionTransition {
  entity: 'document';
  documentType: CoreDocumentType;
  fromStatus: CoreDocumentStatus;
  toStatus: CoreDocumentStatus;
  allowedFromStatuses: readonly CoreDocumentStatus[];
}

export interface StatusTransitionAttempt {
  entityType: CoreDocumentType;
  entityId: string;
  fromStatus: CoreDocumentStatus;
  toStatus: CoreDocumentStatus;
}

export interface DocumentModuleBoundary {
  module: CoreDocumentModule;
  entityType: CoreDocumentType;
  initialStatus: CoreDocumentStatus;
  statuses: readonly CoreDocumentStatus[];
  commands: readonly string[];
  queries: readonly string[];
}

type StatusGraph = Readonly<
  Record<
    CoreDocumentType,
    Readonly<Record<CoreDocumentStatus, readonly CoreDocumentStatus[]>>
  >
>;

const STATUS_GRAPH: StatusGraph = {
  PO: {
    draft: ['confirmed', 'cancelled'],
    confirmed: ['closed', 'cancelled'],
    closed: [],
    cancelled: [],
    validating: [],
    posted: [],
    picking: [],
  },
  GRN: {
    draft: ['validating', 'cancelled'],
    validating: ['posted', 'cancelled'],
    posted: [],
    cancelled: [],
    confirmed: [],
    closed: [],
    picking: [],
  },
  SO: {
    draft: ['confirmed', 'cancelled'],
    confirmed: ['closed', 'cancelled'],
    closed: [],
    cancelled: [],
    validating: [],
    posted: [],
    picking: [],
  },
  OUT: {
    draft: ['picking', 'cancelled'],
    picking: ['posted', 'cancelled'],
    posted: [],
    cancelled: [],
    confirmed: [],
    closed: [],
    validating: [],
  },
  ADJ: {
    draft: ['validating', 'cancelled'],
    validating: ['posted', 'cancelled'],
    posted: [],
    cancelled: [],
    confirmed: [],
    closed: [],
    picking: [],
  },
};
const MODULE_BOUNDARIES: Readonly<
  Record<CoreDocumentModule, DocumentModuleBoundary>
> = {
  purchase: {
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
  },
  inbound: {
    module: 'inbound',
    entityType: 'GRN',
    initialStatus: 'draft',
    statuses: ['draft', 'validating', 'posted', 'cancelled'],
    commands: [
      'createGoodsReceipt',
      'startGoodsReceiptValidation',
      'postGoodsReceipt',
      'cancelGoodsReceipt',
    ],
    queries: ['getGoodsReceipt', 'listGoodsReceipts'],
  },
  sales: {
    module: 'sales',
    entityType: 'SO',
    initialStatus: 'draft',
    statuses: ['draft', 'confirmed', 'closed', 'cancelled'],
    commands: [
      'createSalesOrder',
      'confirmSalesOrder',
      'closeSalesOrder',
      'cancelSalesOrder',
    ],
    queries: ['getSalesOrder', 'listSalesOrders'],
  },
  outbound: {
    module: 'outbound',
    entityType: 'OUT',
    initialStatus: 'draft',
    statuses: ['draft', 'picking', 'posted', 'cancelled'],
    commands: [
      'createOutboundOrder',
      'startOutboundPicking',
      'postOutboundOrder',
      'cancelOutboundOrder',
    ],
    queries: ['getOutboundOrder', 'listOutboundOrders'],
  },
};

export class InvalidStatusTransitionError extends HttpException {
  readonly code = 'VALIDATION_STATUS_TRANSITION_INVALID';
  readonly category = 'state_transition';
  readonly details: InvalidStatusTransitionDetails;
  readonly transition: InvalidStatusTransitionTransition;

  constructor(
    attempt: StatusTransitionAttempt,
    allowedToStatuses: readonly CoreDocumentStatus[],
  ) {
    const message = `Illegal status transition for ${attempt.entityType}(${attempt.entityId}): ${attempt.fromStatus} -> ${attempt.toStatus}`;
    const details: InvalidStatusTransitionDetails = {
      entity_type: attempt.entityType,
      entity_id: attempt.entityId,
      from_status: attempt.fromStatus,
      to_status: attempt.toStatus,
      allowed_to_statuses: allowedToStatuses,
    };
    const transition: InvalidStatusTransitionTransition = {
      entity: 'document',
      documentType: attempt.entityType,
      fromStatus: attempt.fromStatus,
      toStatus: attempt.toStatus,
      allowedFromStatuses: allowedToStatuses,
    };

    super(
      {
        code: 'VALIDATION_STATUS_TRANSITION_INVALID',
        category: 'state_transition',
        message,
        details,
        transition,
      },
      HttpStatus.CONFLICT,
    );

    this.name = 'InvalidStatusTransitionError';
    this.details = details;
    this.transition = transition;
  }

  toPayload(): InvalidStatusTransitionPayload & {
    transition: InvalidStatusTransitionTransition;
  } {
    return {
      code: this.code,
      category: this.category,
      message: this.message,
      details: this.details,
      transition: this.transition,
    };
  }
}

export function getDocumentModuleBoundary(
  module: CoreDocumentModule,
): DocumentModuleBoundary {
  return MODULE_BOUNDARIES[module];
}

export function getAllowedNextStatuses(
  entityType: CoreDocumentType,
  fromStatus: CoreDocumentStatus,
): readonly CoreDocumentStatus[] {
  return STATUS_GRAPH[entityType][fromStatus];
}

export function canTransitionStatus(attempt: StatusTransitionAttempt): boolean {
  return getAllowedNextStatuses(
    attempt.entityType,
    attempt.fromStatus,
  ).includes(attempt.toStatus);
}

export function assertStatusTransition(attempt: StatusTransitionAttempt): void {
  const allowedToStatuses = getAllowedNextStatuses(
    attempt.entityType,
    attempt.fromStatus,
  );

  if (!allowedToStatuses.includes(attempt.toStatus)) {
    throw new InvalidStatusTransitionError(attempt, allowedToStatuses);
  }
}
