import { NextResponse } from 'next/server';

import {
  buildBackendUrl,
  createServerHeaders,
  toUpstreamErrorResponse,
  toUpstreamUnavailableResponse,
} from '@/lib/bff/server-fixtures';

export async function POST(request: Request) {
  const payload = await request.json();

  try {
    const response = await fetch(buildBackendUrl('/evidence/upload-intents'), {
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
    return toUpstreamUnavailableResponse('Backend evidence upload intent is unavailable');
  }
}
