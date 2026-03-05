import { NextResponse } from 'next/server';
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

export async function GET(
  _request: Request,
  context: { params: Promise<{ docType: string; id: string }> },
) {
  const { docType, id } = await context.params;
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
      { status: 400 },
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
      { status: 400 },
    );
  }

  try {
    const response = await fetch(buildBackendUrl(`/documents/${normalizedDocType}/${id}`), {
      headers: createServerHeaders(),
      cache: 'no-store',
    });

    if (response.ok) {
      return NextResponse.json(await response.json());
    }

    return toUpstreamErrorResponse(response);
  } catch {
    return toUpstreamUnavailableResponse('Backend document detail is unavailable');
  }
}
