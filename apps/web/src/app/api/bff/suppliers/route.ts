import { NextRequest, NextResponse } from 'next/server';

import {
  buildBackendUrl,
  createServerHeaders,
  isFixtureFallbackEnabled,
  toFixtureFallbackDisabledResponse,
  toUpstreamErrorResponse,
} from '@/lib/bff/server-fixtures';

// Fixture data for development/test
const supplierFixtures = [
  {
    id: 'sup_001',
    tenantId: '1001',
    code: 'SUP-A',
    name: '供应商A',
    contactPerson: '王五',
    contactPhone: '139-0000-0001',
    email: 'supplierA@example.com',
    address: '广东省深圳市南山区科技园',
    isActive: true,
    createdAt: '2026-02-15T08:00:00.000Z',
    updatedAt: '2026-02-15T08:00:00.000Z',
  },
  {
    id: 'sup_002',
    tenantId: '1001',
    code: 'SUP-B',
    name: '供应商B',
    contactPerson: '赵六',
    contactPhone: '139-0000-0002',
    email: 'supplierB@example.com',
    address: '江苏省苏州市工业园区',
    isActive: true,
    createdAt: '2026-02-20T09:00:00.000Z',
    updatedAt: '2026-02-20T09:00:00.000Z',
  },
  {
    id: 'sup_003',
    tenantId: '1001',
    code: 'SUP-C',
    name: '供应商C（已停用）',
    contactPerson: '孙七',
    contactPhone: '139-0000-0003',
    email: 'supplierC@example.com',
    address: '浙江省杭州市西湖区',
    isActive: false,
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  try {
    const response = await fetch(buildBackendUrl(`/suppliers?${searchParams.toString()}`), {
      headers: createServerHeaders(),
      cache: 'no-store',
    });

    if (response.ok) {
      return NextResponse.json(await response.json());
    }

    if (!isFixtureFallbackEnabled()) {
      return toFixtureFallbackDisabledResponse('Backend suppliers list is unavailable in current environment');
    }
  } catch {
    if (!isFixtureFallbackEnabled()) {
      return toFixtureFallbackDisabledResponse('Backend suppliers list is unavailable in current environment');
    }
  }

  // Fixture fallback
  const isActive = searchParams.get('isActive');
  let data = supplierFixtures;

  if (isActive !== null) {
    const isActiveBool = isActive === 'true';
    data = data.filter((s) => s.isActive === isActiveBool);
  }

  return NextResponse.json({ data, total: data.length });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await fetch(buildBackendUrl('/suppliers'), {
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
      return toFixtureFallbackDisabledResponse('Backend suppliers create is unavailable in current environment');
    }

    // Fixture fallback - simulate creation
    const body = await request.json().catch(() => ({}));
    const now = new Date().toISOString();
    const newSupplier = {
      id: `sup_${Date.now()}`,
      tenantId: '1001',
      code: body.code ?? 'SUP-NEW',
      name: body.name ?? '新供应商',
      contactPerson: body.contactPerson ?? null,
      contactPhone: body.contactPhone ?? null,
      email: body.email ?? null,
      address: body.address ?? null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    return NextResponse.json(newSupplier, { status: 201 });
  }
}
