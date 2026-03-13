import { NextResponse } from 'next/server';

import {
  applyBffTraceHeaders,
  toFixtureFallbackDisabledResponse,
  toFixtureFallbackResponse,
} from '@/lib/bff/server-fixtures';
import { fetchMasterdataEntityResult } from '../../_shared/masterdata-detail-resolvers';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const result = await fetchMasterdataEntityResult('uoms', id);

  if (result.kind === 'ok') {
    return result.fallbackHit
      ? toFixtureFallbackResponse(
          {
            data: result.data,
            message: 'fixture',
          },
          'fixture_uom_detail',
        )
      : NextResponse.json(result.data);
  }

  if (result.kind === 'unavailable') {
    return toFixtureFallbackDisabledResponse(
      'Backend uom detail is unavailable in current environment',
      result.status,
    );
  }

  return applyBffTraceHeaders(
    NextResponse.json(
      {
        error: {
          code: 'UOM_NOT_FOUND',
          message: `Uom with id ${id} not found`,
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
