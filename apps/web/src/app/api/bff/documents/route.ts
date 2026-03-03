import { NextRequest, NextResponse } from 'next/server';
import type { DocumentType } from '@minierp/shared';

import { buildBackendUrl, createServerHeaders, listDocumentFixtures } from '@/lib/bff/server-fixtures';

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
  } catch {}

  return NextResponse.json(listDocumentFixtures(docType));
}
