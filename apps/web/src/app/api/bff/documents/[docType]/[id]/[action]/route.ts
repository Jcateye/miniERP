import { NextResponse } from 'next/server';
import type { DocumentType } from '@minierp/shared';

import { buildBackendUrl, createServerHeaders, toUpstreamErrorResponse, toUpstreamUnavailableResponse } from '@/lib/bff/server-fixtures';

export async function POST(
  request: Request,
  context: { params: Promise<{ docType: string; id: string; action: string }> },
) {
  const { docType, id, action } = await context.params;
  const normalizedDocType = docType.toUpperCase() as DocumentType;

  try {
    const response = await fetch(buildBackendUrl(`/documents/${normalizedDocType}/${id}/${action}`), {
      method: 'POST',
      headers: {
        ...createServerHeaders(),
        ...(request.headers.get('Idempotency-Key') ? { 'Idempotency-Key': request.headers.get('Idempotency-Key') as string } : {}),
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
