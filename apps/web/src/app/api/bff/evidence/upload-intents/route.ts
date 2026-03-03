import { NextResponse } from 'next/server';

import { buildBackendUrl, createServerHeaders } from '@/lib/bff/server-fixtures';

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
  } catch {}

  return NextResponse.json({
    data: {
      assetId: '8801',
      uploadUrl: 'https://example.invalid/upload',
      objectKey: `${payload.entityType ?? 'fixture'}/${payload.entityId ?? 'unknown'}/${payload.fileName ?? 'file'}`,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    },
    message: 'fixture',
  });
}
