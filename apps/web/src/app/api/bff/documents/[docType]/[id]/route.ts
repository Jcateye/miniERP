import { NextResponse } from 'next/server';
import type { DocumentType } from '@minierp/shared';

import {
  buildBackendUrl,
  createServerHeaders,
  getDocumentFixture,
  isFixtureFallbackEnabled,
  toFixtureFallbackDisabledResponse,
} from '@/lib/bff/server-fixtures';

export async function GET(
  _request: Request,
  context: { params: Promise<{ docType: string; id: string }> },
) {
  const { docType, id } = await context.params;
  const normalizedDocType = docType.toUpperCase() as DocumentType;

  try {
    const response = await fetch(buildBackendUrl(`/documents/${normalizedDocType}/${id}`), {
      headers: createServerHeaders(),
      cache: 'no-store',
    });

    if (response.ok) {
      return NextResponse.json(await response.json());
    }

    if (!isFixtureFallbackEnabled()) {
      return toFixtureFallbackDisabledResponse('Backend document detail is unavailable in current environment');
    }
  } catch {
    if (!isFixtureFallbackEnabled()) {
      return toFixtureFallbackDisabledResponse('Backend document detail is unavailable in current environment');
    }
  }

  return NextResponse.json({
    data: getDocumentFixture(normalizedDocType, id),
    message: 'fixture',
  });
}
