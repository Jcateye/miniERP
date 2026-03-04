import { NextRequest, NextResponse } from 'next/server';
import type { DocumentType } from '@minierp/shared';

import {
  buildBackendUrl,
  createServerHeaders,
  isFixtureFallbackEnabled,
  listDocumentFixtures,
  toFixtureFallbackDisabledResponse,
} from '@/lib/bff/server-fixtures';

export async function GET(request: NextRequest) {
  const docType = (request.nextUrl.searchParams.get('docType') ?? 'PO') as DocumentType;

  try {
    const response = await fetch(buildBackendUrl(`/documents?${request.nextUrl.searchParams.toString()}`), {
      headers: createServerHeaders(),
      cache: 'no-store',
    });

    if (response.ok) {
      return NextResponse.json(await response.json());
    }

    if (!isFixtureFallbackEnabled()) {
      return toFixtureFallbackDisabledResponse('Backend documents list is unavailable in current environment');
    }
  } catch {
    if (!isFixtureFallbackEnabled()) {
      return toFixtureFallbackDisabledResponse('Backend documents list is unavailable in current environment');
    }
  }

  return NextResponse.json(listDocumentFixtures(docType));
}
