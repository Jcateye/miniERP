import { NextResponse } from 'next/server';
import type { DocumentType } from '@minierp/shared';

import { buildBackendUrl, createServerHeaders, toUpstreamErrorResponse, toUpstreamUnavailableResponse } from '@/lib/bff/server-fixtures';

export async function POST(
  request: Request,
  context: { params: Promise<{ docType: string; id: string; action: string }> },
) {
  const { docType, id, action } = await context.params;
  const normalizedDocType = docType.toUpperCase() as DocumentType;

  // Phase 2.1: BFF 强制 Idempotency-Key
  const idempotencyKey = request.headers.get('Idempotency-Key');
  if (!idempotencyKey || idempotencyKey.trim() === '') {
    return NextResponse.json(
      {
        error: {
          code: 'IDEMPOTENCY_KEY_REQUIRED',
          message: 'Idempotency-Key header is required for document actions',
          category: 'validation',
        },
      },
      { status: 400 },
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
      return NextResponse.json(await response.json());
    }

    return toUpstreamErrorResponse(response);
  } catch {
    return toUpstreamUnavailableResponse('Backend document command is unavailable');
  }
}
