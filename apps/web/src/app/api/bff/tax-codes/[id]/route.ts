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
  const result = await fetchMasterdataEntityResult('tax-codes', id);

  if (result.kind === 'ok') {
    return result.fallbackHit
      ? toFixtureFallbackResponse(
          {
            data: result.data,
            message: 'fixture',
          },
          'fixture_tax_code_detail',
        )
      : NextResponse.json(result.data);
  }

  if (result.kind === 'unavailable') {
    return toFixtureFallbackDisabledResponse(
      'Backend tax code detail is unavailable in current environment',
      result.status,
    );
  }

  return applyBffTraceHeaders(
    NextResponse.json(
      {
        error: {
          code: 'TAX_CODE_NOT_FOUND',
          message: `Tax code with id ${id} not found`,
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
