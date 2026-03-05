import { NextRequest, NextResponse } from 'next/server';

import {
  buildBackendUrl,
  createServerHeaders,
  isFixtureFallbackEnabled,
  toFixtureFallbackDisabledResponse,
  toUpstreamErrorResponse,
  toUpstreamUnavailableResponse,
} from '@/lib/bff/server-fixtures';
import type { InventoryLedgerDto } from '@minierp/shared';

function getLedgerFixtures(): InventoryLedgerDto[] {
  return [
    {
      id: 'LED-001',
      skuId: 'CAB-HDMI-2M',
      warehouseId: 'WH-001',
      docType: 'GRN',
      docNo: 'DOC-GRN-20260303-001',
      qtyDelta: '120',
      balanceAfter: '280',
      postedAt: '2026-03-03T09:00:00.000Z',
    },
    {
      id: 'LED-002',
      skuId: 'ADP-USB-C-DP',
      warehouseId: 'WH-001',
      docType: 'GRN',
      docNo: 'DOC-GRN-20260303-001',
      qtyDelta: '80',
      balanceAfter: '96',
      postedAt: '2026-03-03T09:00:00.000Z',
    },
    {
      id: 'LED-003',
      skuId: 'CAB-HDMI-2M',
      warehouseId: 'WH-001',
      docType: 'OUT',
      docNo: 'DOC-OUT-20260303-001',
      qtyDelta: '-50',
      balanceAfter: '230',
      postedAt: '2026-03-03T14:00:00.000Z',
    },
    {
      id: 'LED-004',
      skuId: 'CAB-HDMI-2M',
      warehouseId: 'WH-002',
      docType: 'GRN',
      docNo: 'DOC-GRN-20260303-002',
      qtyDelta: '150',
      balanceAfter: '150',
      postedAt: '2026-03-03T10:30:00.000Z',
    },
  ];
}

export async function GET(request: NextRequest) {
  const skuId = request.nextUrl.searchParams.get('skuId') ?? undefined;
  const warehouseId = request.nextUrl.searchParams.get('warehouseId') ?? undefined;
  const docType = request.nextUrl.searchParams.get('docType') ?? undefined;

  const queryParams = request.nextUrl.searchParams.toString();

  try {
    const response = await fetch(buildBackendUrl(`/inventory/ledger?${queryParams}`), {
      headers: createServerHeaders(),
      cache: 'no-store',
    });

    if (response.ok) {
      return NextResponse.json(await response.json());
    }

    if (!isFixtureFallbackEnabled()) {
      return toFixtureFallbackDisabledResponse('Backend inventory ledger is unavailable in current environment');
    }

    return toUpstreamErrorResponse(response);
  } catch {
    if (!isFixtureFallbackEnabled()) {
      return toFixtureFallbackDisabledResponse('Backend inventory ledger is unavailable in current environment');
    }
  }

  // Fixture fallback
  let fixtures = getLedgerFixtures();

  if (skuId) {
    fixtures = fixtures.filter((item) => item.skuId === skuId);
  }
  if (warehouseId) {
    fixtures = fixtures.filter((item) => item.warehouseId === warehouseId);
  }
  if (docType) {
    fixtures = fixtures.filter((item) => item.docType === docType);
  }

  return NextResponse.json({
    data: fixtures,
    total: fixtures.length,
    page: 1,
    pageSize: 20,
    totalPages: fixtures.length > 0 ? 1 : 0,
    message: 'fixture',
  });
}
