import { NextRequest, NextResponse } from 'next/server';

import {
  buildBackendUrl,
  createServerHeaders,
  toUpstreamErrorResponse,
  toUpstreamUnavailableResponse,
} from '@/lib/bff/server-fixtures';

export async function GET(request: NextRequest) {
  const queryParams = request.nextUrl.searchParams.toString();

  try {
    const response = await fetch(buildBackendUrl(`/inventory/ledger?${queryParams}`), {
      headers: createServerHeaders(),
      cache: 'no-store',
    });

    if (response.ok) {
      return NextResponse.json(await response.json());
    }

    return toUpstreamErrorResponse(response);
  } catch {
    return toUpstreamUnavailableResponse('Backend inventory ledger is unavailable');
  }
}
