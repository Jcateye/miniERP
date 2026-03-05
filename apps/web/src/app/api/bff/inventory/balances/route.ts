import { NextRequest, NextResponse } from 'next/server';

import {
  buildBackendUrl,
  createServerHeaders,
  isFixtureFallbackEnabled,
  toFixtureFallbackDisabledResponse,
  toUpstreamErrorResponse,
  toUpstreamUnavailableResponse,
} from '@/lib/bff/server-fixtures';
import type { InventoryBalanceSnapshot } from '@minierp/shared';

function getBalanceFixtures(): InventoryBalanceSnapshot[] {
  return [
    { skuId: 'CAB-HDMI-2M', warehouseId: 'WH-001', onHand: 280 },
    { skuId: 'ADP-USB-C-DP', warehouseId: 'WH-001', onHand: 96 },
    { skuId: 'CAB-HDMI-2M', warehouseId: 'WH-002', onHand: 150 },
    { skuId: 'ADP-USB-C-DP', warehouseId: 'WH-002', onHand: 54 },
  ];
}

export async function GET(request: NextRequest) {
  const skuId = request.nextUrl.searchParams.get('skuId') ?? undefined;
  const warehouseId = request.nextUrl.searchParams.get('warehouseId') ?? undefined;

  const queryParams = request.nextUrl.searchParams.toString();

  try {
    const response = await fetch(buildBackendUrl(`/inventory/balances?${queryParams}`), {
      headers: createServerHeaders(),
      cache: 'no-store',
    });

    if (response.ok) {
      return NextResponse.json(await response.json());
    }

    if (!isFixtureFallbackEnabled()) {
      return toFixtureFallbackDisabledResponse('Backend inventory balances are unavailable in current environment');
    }

    return toUpstreamErrorResponse(response);
  } catch {
    if (!isFixtureFallbackEnabled()) {
      return toFixtureFallbackDisabledResponse('Backend inventory balances are unavailable in current environment');
    }
  }

  // Fixture fallback
  let fixtures = getBalanceFixtures();

  if (skuId) {
    fixtures = fixtures.filter((item) => item.skuId === skuId);
  }
  if (warehouseId) {
    fixtures = fixtures.filter((item) => item.warehouseId === warehouseId);
  }

  return NextResponse.json({
    data: fixtures,
    total: fixtures.length,
    message: 'fixture',
  });
}
