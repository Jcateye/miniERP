import { NextRequest, NextResponse } from 'next/server';

import {
  buildBackendUrl,
  createServerHeaders,
  isFixtureFallbackEnabled,
  toFixtureFallbackDisabledResponse,
  toUpstreamErrorResponse,
} from '@/lib/bff/server-fixtures';

// Fixture data for development/test
const warehouseFixtures = [
  {
    id: 'wh_001',
    tenantId: '1001',
    code: 'WH-MAIN',
    name: '主仓库',
    address: '上海市浦东新区张江高科技园区',
    contactPerson: '张三',
    contactPhone: '138-0000-0001',
    isActive: true,
    createdAt: '2026-03-01T08:00:00.000Z',
    updatedAt: '2026-03-01T08:00:00.000Z',
  },
  {
    id: 'wh_002',
    tenantId: '1001',
    code: 'WH-SECOND',
    name: '备用仓库',
    address: '上海市闵行区莘庄工业区',
    contactPerson: '李四',
    contactPhone: '138-0000-0002',
    isActive: true,
    createdAt: '2026-03-02T09:00:00.000Z',
    updatedAt: '2026-03-02T09:00:00.000Z',
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  try {
    const response = await fetch(buildBackendUrl(`/warehouses?${searchParams.toString()}`), {
      headers: createServerHeaders(),
      cache: 'no-store',
    });

    if (response.ok) {
      return NextResponse.json(await response.json());
    }

    if (!isFixtureFallbackEnabled()) {
      return toFixtureFallbackDisabledResponse('Backend warehouses list is unavailable in current environment');
    }
  } catch {
    if (!isFixtureFallbackEnabled()) {
      return toFixtureFallbackDisabledResponse('Backend warehouses list is unavailable in current environment');
    }
  }

  // Fixture fallback
  const isActive = searchParams.get('isActive');
  let data = warehouseFixtures;

  if (isActive !== null) {
    const isActiveBool = isActive === 'true';
    data = data.filter((w) => w.isActive === isActiveBool);
  }

  return NextResponse.json({ data, total: data.length });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await fetch(buildBackendUrl('/warehouses'), {
      method: 'POST',
      headers: createServerHeaders(),
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (response.ok) {
      return NextResponse.json(await response.json());
    }

    return toUpstreamErrorResponse(response);
  } catch (error) {
    if (!isFixtureFallbackEnabled()) {
      return toFixtureFallbackDisabledResponse('Backend warehouses create is unavailable in current environment');
    }

    // Fixture fallback - simulate creation
    const body = await request.json().catch(() => ({}));
    const now = new Date().toISOString();
    const newWarehouse = {
      id: `wh_${Date.now()}`,
      tenantId: '1001',
      code: body.code ?? 'WH-NEW',
      name: body.name ?? '新仓库',
      address: body.address ?? null,
      contactPerson: body.contactPerson ?? null,
      contactPhone: body.contactPhone ?? null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    return NextResponse.json(newWarehouse, { status: 201 });
  }
}
