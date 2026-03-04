import { NextResponse } from 'next/server';
import type { DocumentType } from '@minierp/shared';

import { buildBackendUrl, createServerHeaders, toUpstreamErrorResponse, toUpstreamUnavailableResponse } from '@/lib/bff/server-fixtures';

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
  const normalizedDocType = docType.toUpperCase() as DocumentType;

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
    return NextResponse.json(
      {
        error: {
          code: 'BFF_UPSTREAM_UNAVAILABLE',
          message: 'Backend document command is unavailable',
        },
      },
      {
        status: 503,
        headers: { 'x-bff-fallback-hit': '0' },
      },
    );
  }
}
