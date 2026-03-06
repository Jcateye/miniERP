import { NextRequest, NextResponse } from 'next/server';

import {
  buildBackendUrl,
  createServerHeaders,
  toUpstreamErrorResponse,
  toUpstreamUnavailableResponse,
} from '@/lib/bff/server-fixtures';
import {
  normalizeBalancesPayload,
  parsePaginationParams,
  successResponse,
  toPaginatedBalances,
} from '../contract';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const pagination = parsePaginationParams(searchParams);

  if (pagination instanceof NextResponse) {
    return pagination;
  }

  const upstreamParams = new URLSearchParams();
  const skuId = searchParams.get('skuId');
  const warehouseId = searchParams.get('warehouseId');

  if (skuId) {
    upstreamParams.set('skuId', skuId);
  }

  if (warehouseId) {
    upstreamParams.set('warehouseId', warehouseId);
  }

  try {
    const response = await fetch(
      buildBackendUrl(`/inventory/balances?${upstreamParams.toString()}`),
      {
        headers: createServerHeaders(),
        cache: 'no-store',
      },
    );

    if (response.ok) {
      const payload = normalizeBalancesPayload(await response.json());
      const paginated = toPaginatedBalances(payload.data, pagination);
      return successResponse(paginated);
    }

    return toUpstreamErrorResponse(response);
  } catch {
    return toUpstreamUnavailableResponse('Backend inventory balances are unavailable');
  }
}
