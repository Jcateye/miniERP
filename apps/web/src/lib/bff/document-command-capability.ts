import {
  CORE_DOCUMENT_STATUSES,
  CORE_DOCUMENT_TYPES,
  type CoreDocumentStatus,
  type CoreDocumentType,
  type DocumentType,
} from '@minierp/shared';

export const DOCUMENT_COMMANDS = ['confirm', 'post', 'cancel'] as const;
export type DocumentCommand = (typeof DOCUMENT_COMMANDS)[number];

const COMMAND_LABELS: Record<DocumentCommand, string> = {
  confirm: '确认',
  post: '过账',
  cancel: '取消',
};

const COMMAND_TARGET_STATUS: Record<DocumentCommand, CoreDocumentStatus> = {
  confirm: 'confirmed',
  post: 'posted',
  cancel: 'cancelled',
};

const CORE_STATUS_GRAPH: Readonly<
  Record<CoreDocumentType, Readonly<Record<CoreDocumentStatus, readonly CoreDocumentStatus[]>>>
> = {
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

const LEGACY_STATUS_ALIAS: Record<string, CoreDocumentStatus> = {
  pending: 'draft',
  approved: 'confirmed',
  completed: 'posted',
  rejected: 'cancelled',
};

function isCoreDocumentType(value: string): value is CoreDocumentType {
  return (CORE_DOCUMENT_TYPES as readonly string[]).includes(value);
}

function isCoreDocumentStatus(value: string): value is CoreDocumentStatus {
  return (CORE_DOCUMENT_STATUSES as readonly string[]).includes(value);
}

function supportsCommand(docType: CoreDocumentType, action: DocumentCommand): boolean {
  const targetStatus = COMMAND_TARGET_STATUS[action];
  return Object.values(CORE_STATUS_GRAPH[docType]).some((nextStatuses) => nextStatuses.includes(targetStatus));
}

export function normalizeDocumentStatus(status?: string): CoreDocumentStatus | null {
  if (!status) {
    return null;
  }

  const normalized = status.toLowerCase().trim();
  if (isCoreDocumentStatus(normalized)) {
    return normalized;
  }

  return LEGACY_STATUS_ALIAS[normalized] ?? null;
}

export interface CommandAvailability {
  enabled: boolean;
  reason?: string;
}

export interface DocumentCommandAvailability {
  normalizedStatus: CoreDocumentStatus | null;
  actions: Record<DocumentCommand, CommandAvailability>;
}

export function getDocumentCommandAvailability(options: {
  docType?: DocumentType;
  status?: string;
  backendReady?: boolean;
}): DocumentCommandAvailability {
  const { docType, status, backendReady = true } = options;
  const actions = {} as Record<DocumentCommand, CommandAvailability>;

  if (!docType || !isCoreDocumentType(docType)) {
    for (const action of DOCUMENT_COMMANDS) {
      actions[action] = {
        enabled: false,
        reason: '当前单据类型未接入动作接口。',
      };
    }
    return { normalizedStatus: null, actions };
  }

  if (!backendReady) {
    for (const action of DOCUMENT_COMMANDS) {
      actions[action] = {
        enabled: false,
        reason: '后端能力不可用，动作已禁用。',
      };
    }
    return { normalizedStatus: null, actions };
  }

  const normalizedStatus = normalizeDocumentStatus(status);
  for (const action of DOCUMENT_COMMANDS) {
    if (!supportsCommand(docType, action)) {
      actions[action] = {
        enabled: false,
        reason: `后端未提供“${COMMAND_LABELS[action]}”能力。`,
      };
      continue;
    }

    if (!normalizedStatus) {
      actions[action] = {
        enabled: false,
        reason: '尚未获取可判定状态，动作暂不可用。',
      };
      continue;
    }

    const targetStatus = COMMAND_TARGET_STATUS[action];
    const allowed = CORE_STATUS_GRAPH[docType][normalizedStatus].includes(targetStatus);
    actions[action] = allowed
      ? { enabled: true }
      : {
          enabled: false,
          reason: `状态“${normalizedStatus}”不支持“${COMMAND_LABELS[action]}”。`,
        };
  }

  return { normalizedStatus, actions };
}
