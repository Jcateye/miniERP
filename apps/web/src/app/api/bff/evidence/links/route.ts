import { NextRequest, NextResponse } from 'next/server';

import {
  buildBackendUrl,
  createServerHeaders,
  getEvidenceFixture,
  isFixtureFallbackEnabled,
  toFixtureFallbackDisabledResponse,
  toUpstreamErrorResponse,
  toUpstreamUnavailableResponse,
} from '@/lib/bff/server-fixtures';

export async function GET(request: NextRequest) {
  const entityType = request.nextUrl.searchParams.get('entityType') ?? 'grn';
  const entityId = request.nextUrl.searchParams.get('entityId') ?? '3001';
  const scope = (request.nextUrl.searchParams.get('scope') ?? 'document') as 'document' | 'line';
  const lineRef = request.nextUrl.searchParams.get('lineRef') ?? undefined;

  try {
    const response = await fetch(buildBackendUrl(`/evidence/links?${request.nextUrl.searchParams.toString()}`), {
      headers: createServerHeaders(),
      cache: 'no-store',
    });

    if (response.ok) {
      return NextResponse.json(await response.json());
    }

    if (!isFixtureFallbackEnabled()) {
      return toFixtureFallbackDisabledResponse('Backend evidence links are unavailable in current environment');
    }
  } catch {
    if (!isFixtureFallbackEnabled()) {
      return toFixtureFallbackDisabledResponse('Backend evidence links are unavailable in current environment');
    }
  }

  return NextResponse.json({
    data: getEvidenceFixture(entityType, entityId, scope, lineRef),
    message: 'fixture',
  });
}

export async function POST(request: Request) {
  const payload = await request.json();

  try {
    const response = await fetch(buildBackendUrl('/evidence/links'), {
      method: 'POST',
      headers: createServerHeaders(),
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (response.ok) {
      return NextResponse.json(await response.json());
    }

    return toUpstreamErrorResponse(response);
  } catch {
    return toUpstreamUnavailableResponse('Backend evidence attach is unavailable');
  }
}
