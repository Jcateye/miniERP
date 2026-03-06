import { createHmac, randomUUID } from 'node:crypto';

import type { BigIntString, DocumentType } from '@minierp/shared';

import type { EvidenceCollectionContract } from '@/contracts';
import type { DocumentDetailDto, DocumentListItemDto, PaginationEnvelope } from '@/lib/sdk/types';

const DEV_FALLBACK_AUTH_CONTEXT_SECRET = 'dev-only-auth-context-secret';
const TEST_AUTH_CONTEXT_SECRET = 'test-only-auth-context-secret';
const BFF_FALLBACK_ENV = 'MINIERP_ENABLE_BFF_FIXTURE_FALLBACK';
const BFF_FALLBACK_HIT_HEADER = 'x-bff-fallback-hit';
const BFF_FALLBACK_REASON_HEADER = 'x-bff-fallback-reason';
const BFF_UPSTREAM_STATUS_HEADER = 'x-bff-upstream-status';

const documents: Record<DocumentType, DocumentListItemDto[]> = {
  PO: [
    createDocument('2001', 'DOC-PO-20260303-001', 'PO', 'pending', '280', '128800'),
    createDocument('2002', 'DOC-PO-20260303-002', 'PO', 'approved', '96', '41200'),
  ],
  SO: [
    createDocument('4001', 'DOC-SO-20260303-005', 'SO', 'pending', '160', '152400'),
    createDocument('4002', 'DOC-SO-20260303-006', 'SO', 'approved', '54', '68900'),
  ],
  GRN: [
    createDocument('3001', 'DOC-GRN-20260303-003', 'GRN', 'pending', '278', '127960'),
    createDocument('3002', 'DOC-GRN-20260303-004', 'GRN', 'completed', '96', '41200'),
  ],
  OUT: [
    createDocument('5001', 'DOC-OUT-20260303-002', 'OUT', 'pending', '160', '152400'),
    createDocument('5002', 'DOC-OUT-20260303-003', 'OUT', 'completed', '54', '68900'),
  ],
  ADJ: [],
  PAY: [],
  REC: [],
};

function createDocument(
  id: string,
  docNo: string,
  docType: DocumentType,
  status: string,
  totalQty: string,
  totalAmount: string,
): DocumentListItemDto {
  return {
    id,
    tenantId: '1001',
    docNo,
    docType,
    docDate: '2026-03-03',
    status,
    remarks: 'fixture',
    createdAt: '2026-03-03T08:00:00.000Z',
    createdBy: '9001',
    updatedAt: '2026-03-03T10:00:00.000Z',
    updatedBy: '9001',
    deletedAt: null,
    deletedBy: null,
    lineCount: 2,
    totalQty,
    totalAmount,
  };
}

export function listDocumentFixtures(docType: DocumentType): PaginationEnvelope<DocumentListItemDto> {
  const data = documents[docType] ?? [];

  return {
    data,
    total: data.length,
    page: 1,
    pageSize: 20,
    totalPages: data.length > 0 ? 1 : 0,
  };
}

export function getDocumentFixture(docType: DocumentType, id: BigIntString): DocumentDetailDto {
  const header = documents[docType]?.find((item) => item.id === id) ?? createDocument(id, `DOC-${docType}-20260303-000`, docType, 'draft', '0', '0');

  return {
    ...header,
    lines: [
      { id: '1', docId: id, lineNo: 1, skuId: 'CAB-HDMI-2M', qty: '120', unitPrice: '320', amount: '38400', taxAmount: '0' },
      { id: '2', docId: id, lineNo: 2, skuId: 'ADP-USB-C-DP', qty: '80', unitPrice: '420', amount: '33600', taxAmount: '0' },
    ],
  };
}

export function getEvidenceFixture(
  entityType: string,
  entityId: BigIntString,
  scope: 'document' | 'line',
  lineRef?: BigIntString,
): EvidenceCollectionContract {
  return {
    entityType: entityType as EvidenceCollectionContract['entityType'],
    entityId,
    scope,
    lineRef,
    stats: [
      { key: 'total', label: '文件数', value: scope === 'document' ? '3' : '2', tone: 'info' },
      { key: 'required', label: '必传项', value: '1', tone: 'warning' },
      { key: 'ready', label: '就绪度', value: '100%', tone: 'success' },
    ],
    tags: [
      { key: 'label', label: '标签', count: 1, tone: 'info' },
      { key: 'packing_list', label: '清单', count: 1, tone: 'warning' },
      { key: 'damage', label: '差异凭证', count: 1, tone: 'danger' },
    ],
    items: [
      {
        id: `${entityId}-${scope}-1`,
        assetId: `${entityId}01`,
        scope,
        lineRef,
        tag: 'label',
        tagLabel: '标签',
        fileName: `${entityType}-${entityId}-label.jpg`,
        uploadedAt: '2026-03-03 09:20',
        uploadedBy: 'warehouse.operator',
        status: 'active',
      },
      {
        id: `${entityId}-${scope}-2`,
        assetId: `${entityId}02`,
        scope,
        lineRef,
        tag: 'packing_list',
        tagLabel: '清单',
        fileName: `${entityType}-${entityId}-proof.pdf`,
        uploadedAt: '2026-03-03 09:42',
        uploadedBy: 'warehouse.operator',
        status: 'active',
        note: 'fixture fallback',
      },
    ],
  };
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function signPayload(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

export function createServerHeaders() {
  const nodeEnv = process.env.NODE_ENV ?? 'production';
  const configuredSecret = process.env.AUTH_CONTEXT_SECRET?.trim();

  if (!configuredSecret && nodeEnv !== 'development' && nodeEnv !== 'test') {
    throw new Error('AUTH_CONTEXT_SECRET is required outside development/test');
  }

  const secret =
    configuredSecret || (nodeEnv === 'test' ? TEST_AUTH_CONTEXT_SECRET : DEV_FALLBACK_AUTH_CONTEXT_SECRET);
  const tenantId = process.env.MINIERP_TENANT_ID ?? '1001';
  const authContext = {
    tenantId,
    actorId: process.env.MINIERP_ACTOR_ID ?? '9001',
    permissions: [
      'evidence:link:create',
      'evidence:link:read',
      'evidence:*',
      'masterdata.warehouse.read',
      'masterdata.warehouse.write',
      'masterdata.supplier.read',
      'masterdata.supplier.write',
      'masterdata.customer.read',
      'masterdata.customer.write',
      'masterdata.sku.read',
      'masterdata.sku.write',
    ],
    role: 'tenant_admin',
  };

  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'x-tenant-id': tenantId,
    'x-request-id': randomUUID(),
  };

  const encodedContext = base64UrlEncode(JSON.stringify(authContext));
  headers['x-auth-context'] = encodedContext;
  headers['x-auth-context-signature'] = signPayload(encodedContext, secret);

  return headers;
}

export function buildBackendUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || 'http://localhost:3001';
  return `${baseUrl}/api${path}`;
}

export function isFixtureFallbackEnabled() {
  return process.env.NODE_ENV === 'development' && process.env[BFF_FALLBACK_ENV]?.trim() === 'true';
}

type BffTraceHeadersInput = {
  fallbackHit: '0' | '1';
  reason: string;
  upstreamStatus?: number | string;
};

export function applyBffTraceHeaders<T extends Response>(response: T, trace: BffTraceHeadersInput): T {
  response.headers.set(BFF_FALLBACK_HIT_HEADER, trace.fallbackHit);
  response.headers.set(BFF_FALLBACK_REASON_HEADER, trace.reason);

  if (typeof trace.upstreamStatus !== 'undefined') {
    response.headers.set(BFF_UPSTREAM_STATUS_HEADER, String(trace.upstreamStatus));
  }

  return response;
}

export function toFixtureFallbackResponse(body: unknown, reason = 'fixture_response') {
  return applyBffTraceHeaders(Response.json(body, { status: 200 }), {
    fallbackHit: '1',
    reason,
  });
}

export function toFixtureFallbackDisabledResponse(message: string, upstreamStatus?: number) {
  return toUpstreamUnavailableResponse(message, {
    reason: 'fixture_disabled',
    upstreamStatus,
  });
}

export async function toUpstreamErrorResponse(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';
  const isClientError = response.status >= 400 && response.status < 500;

  if (contentType.includes('application/json')) {
    const upstreamBody = await response.json();

    if (isClientError) {
      return applyBffTraceHeaders(
        Response.json(upstreamBody, {
          status: response.status,
        }),
        {
          fallbackHit: '0',
          reason: 'upstream_error',
          upstreamStatus: response.status,
        },
      );
    }

    return applyBffTraceHeaders(
      Response.json(
        {
          error: {
            code: 'BFF_UPSTREAM_ERROR',
            message: 'Upstream service temporarily unavailable',
          },
        },
        {
          status: response.status,
        },
      ),
      {
        fallbackHit: '0',
        reason: 'upstream_error',
        upstreamStatus: response.status,
      },
    );
  }

  const fallbackMessage = isClientError
    ? 'Upstream request rejected'
    : 'Upstream service temporarily unavailable';

  return applyBffTraceHeaders(
    Response.json(
      {
        error: {
          code: 'BFF_UPSTREAM_ERROR',
          message: fallbackMessage,
        },
      },
      {
        status: response.status,
      },
    ),
    {
      fallbackHit: '0',
      reason: 'upstream_error',
      upstreamStatus: response.status,
    },
  );
}

export function toUpstreamUnavailableResponse(
  message: string,
  options?: { reason?: string; upstreamStatus?: number | string },
) {
  return applyBffTraceHeaders(
    Response.json(
      {
        error: {
          code: 'BFF_UPSTREAM_UNAVAILABLE',
          message,
        },
      },
      {
        status: 503,
      },
    ),
    {
      fallbackHit: '0',
      reason: options?.reason ?? 'upstream_unavailable',
      upstreamStatus: options?.upstreamStatus,
    },
  );
}
