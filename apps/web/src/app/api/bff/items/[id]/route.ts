import { NextResponse } from 'next/server';

import {
  applyBffTraceHeaders,
  toFixtureFallbackDisabledResponse,
  toFixtureFallbackResponse,
} from '@/lib/bff/server-fixtures';
import { fetchItemDetailResult } from '../../_shared/masterdata-detail-resolvers';

export { DELETE, PUT } from '../../mdm/skus/[id]/route';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const result = await fetchItemDetailResult(id);

  if (result.kind === 'ok') {
    return result.fallbackHit
      ? toFixtureFallbackResponse({
          data: result.data,
          message: 'fixture',
        })
      : NextResponse.json(result.data);
  }

  if (result.kind === 'unavailable') {
    return toFixtureFallbackDisabledResponse(
      'Backend item detail is unavailable in current environment',
      result.status,
    );
  }

  return applyBffTraceHeaders(
    NextResponse.json(
      {
        error: {
          code: 'ITEM_NOT_FOUND',
          message: `Item with id ${id} not found`,
          category: 'not_found',
        },
      },
      { status: 404 },
    ),
    {
      fallbackHit: '1',
      reason: 'fixture_miss',
    },
  );
}
