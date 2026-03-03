import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const route = request.nextUrl.searchParams.get('route') ?? '/';
  const kind = request.nextUrl.searchParams.get('kind') ?? 'overview';

  return NextResponse.json({
    data: {
      route,
      kind,
    },
    message: 'ok',
  });
}
