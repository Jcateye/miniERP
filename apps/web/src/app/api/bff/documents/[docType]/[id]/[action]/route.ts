import { NextResponse } from 'next/server';
import { CORE_DOCUMENT_TYPES, type DocumentType } from '@minierp/shared';

import { buildBackendUrl, createServerHeaders, toUpstreamErrorResponse, toUpstreamUnavailableResponse } from '@/lib/bff/server-fixtures';

const DOCUMENT_ACTIONS = ['confirm', 'validate', 'post', 'pick', 'close', 'cancel'] as const;
type DocumentAction = (typeof DOCUMENT_ACTIONS)[number];

function isValidDocumentType(value: string): value is DocumentType {
  return (CORE_DOCUMENT_TYPES as readonly string[]).includes(value);
}

function isValidDocumentAction(value: string): value is DocumentAction {
  return (DOCUMENT_ACTIONS as readonly string[]).includes(value);
}

function isPositiveInteger(value: string): boolean {
  return /^\d+$/.test(value) && Number(value) > 0;
}

/**
 * ADR-006 Phase 3: BFF 强制 Idempotency-Key
 * - 缺失 Idempotency-Key 时返回 400
 * - 透传 Idempotency-Key 到后端
 * - 添加 x-bff-fallback-hit 响应头
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ docType: string; id: string; action: string }> },
) {
  const { docType, id, action } = await context.params;
  const normalizedDocType = docType.toUpperCase();

  if (!isValidDocumentType(normalizedDocType)) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_INVALID_DOC_TYPE',
          category: 'validation',
          message: 'docType must be one of PO, GRN, SO, OUT, ADJ',
        },
      },
      { status: 400, headers: { 'x-bff-fallback-hit': '0' } },
    );
  }

  if (!isPositiveInteger(id)) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_INVALID_ID',
          category: 'validation',
          message: 'id must be a positive integer string',
        },
      },
      { status: 400, headers: { 'x-bff-fallback-hit': '0' } },
    );
  }

  if (!isValidDocumentAction(action)) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_INVALID_ACTION',
          category: 'validation',
          message: 'action must be one of confirm, validate, post, pick, close, cancel',
        },
      },
      { status: 400, headers: { 'x-bff-fallback-hit': '0' } },
    );
  }

  // Phase 3: 强制 Idempotency-Key
  const idempotencyKey = request.headers.get('Idempotency-Key');
  if (!idempotencyKey || idempotencyKey.trim() === '') {
    return NextResponse.json(
      {
        error: {
          code: 'BFF_IDEMPOTENCY_KEY_REQUIRED',
          category: 'validation',
          message: 'Idempotency-Key header is required for document actions',
        },
      },
      { status: 400, headers: { 'x-bff-fallback-hit': '0' } },
    );
  }

  try {
    const response = await fetch(buildBackendUrl(`/documents/${normalizedDocType}/${id}/${action}`), {
      method: 'POST',
      headers: {
        ...createServerHeaders(),
        'Idempotency-Key': idempotencyKey,
      },
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data, {
        headers: { 'x-bff-fallback-hit': '0' },
      });
    }

    const errorResponse = await toUpstreamErrorResponse(response);
    errorResponse.headers.set('x-bff-fallback-hit', '0');
    return errorResponse;
  } catch {
    const unavailableResponse = toUpstreamUnavailableResponse('Backend document command is unavailable');
    unavailableResponse.headers.set('x-bff-fallback-hit', '0');
    return unavailableResponse;
  }
}
