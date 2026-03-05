import { NextRequest, NextResponse } from 'next/server';
import { CORE_DOCUMENT_TYPES, type DocumentType } from '@minierp/shared';

import {
  buildBackendUrl,
  createServerHeaders,
  toUpstreamErrorResponse,
  toUpstreamUnavailableResponse,
} from '@/lib/bff/server-fixtures';

function isValidDocumentType(value: string): value is DocumentType {
  return (CORE_DOCUMENT_TYPES as readonly string[]).includes(value);
}

function isPositiveInteger(value: string): boolean {
  return /^\d+$/.test(value) && Number(value) > 0;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const upstreamParams = new URLSearchParams(searchParams);
  const docType = searchParams.get('docType');
  const page = searchParams.get('page');
  const pageSize = searchParams.get('pageSize');

  if (docType && !isValidDocumentType(docType.toUpperCase())) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_INVALID_DOC_TYPE',
          category: 'validation',
          message: 'docType must be one of PO, GRN, SO, OUT, ADJ',
        },
      },
      { status: 400 },
    );
  }

  if (docType) {
    upstreamParams.set('docType', docType.toUpperCase());
  }

  if (page && !isPositiveInteger(page)) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_INVALID_PAGE',
          category: 'validation',
          message: 'page must be a positive integer',
        },
      },
      { status: 400 },
    );
  }

  if (pageSize && !isPositiveInteger(pageSize)) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_INVALID_PAGE_SIZE',
          category: 'validation',
          message: 'pageSize must be a positive integer',
        },
      },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(buildBackendUrl(`/documents?${upstreamParams.toString()}`), {
      headers: createServerHeaders(),
      cache: 'no-store',
    });

    if (response.ok) {
      return NextResponse.json(await response.json());
    }

    return toUpstreamErrorResponse(response);
  } catch {
    return toUpstreamUnavailableResponse('Backend documents list is unavailable');
  }
}

export async function POST(request: NextRequest) {
  const idempotencyKey = request.headers.get('Idempotency-Key');

  if (!idempotencyKey || idempotencyKey.trim() === '') {
    return NextResponse.json(
      {
        error: {
          code: 'BFF_IDEMPOTENCY_KEY_REQUIRED',
          category: 'validation',
          message: 'Idempotency-Key header is required for document create',
        },
      },
      { status: 400 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_INVALID_JSON',
          category: 'validation',
          message: 'Request body must be valid JSON',
        },
      },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(buildBackendUrl('/documents'), {
      method: 'POST',
      headers: {
        ...createServerHeaders(),
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (response.ok) {
      return NextResponse.json(await response.json());
    }

    return toUpstreamErrorResponse(response);
  } catch {
    return toUpstreamUnavailableResponse('Backend document create is unavailable');
  }
}
