import { NextRequest, NextResponse } from 'next/server';

import {
  buildBackendUrl,
  createServerHeaders,
  isFixtureFallbackEnabled,
  toFixtureFallbackDisabledResponse,
  toUpstreamErrorResponse,
} from '@/lib/bff/server-fixtures';

// Fixture data for development/test
const customerFixtures = [
  {
    id: 'cust_001',
    tenantId: '1001',
    code: 'CUST-A',
    name: '客户A',
    contactPerson: '周八',
    contactPhone: '137-0000-0001',
    email: 'customerA@example.com',
    address: '北京市朝阳区建国路88号',
    isActive: true,
    createdAt: '2026-02-01T08:00:00.000Z',
    updatedAt: '2026-02-01T08:00:00.000Z',
  },
  {
    id: 'cust_002',
    tenantId: '1001',
    code: 'CUST-B',
    name: '客户B',
    contactPerson: '吴九',
    contactPhone: '137-0000-0002',
    email: 'customerB@example.com',
    address: '广州市天河区珠江新城',
    isActive: true,
    createdAt: '2026-02-10T09:00:00.000Z',
    updatedAt: '2026-02-10T09:00:00.000Z',
  },
  {
    id: 'cust_003',
    tenantId: '1001',
    code: 'CUST-C',
    name: '客户C',
    contactPerson: '郑十',
    contactPhone: '137-0000-0003',
    email: 'customerC@example.com',
    address: '成都市高新区天府大道',
    isActive: true,
    createdAt: '2026-02-15T10:00:00.000Z',
    updatedAt: '2026-02-15T10:00:00.000Z',
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  try {
    const response = await fetch(buildBackendUrl(`/customers?${searchParams.toString()}`), {
      headers: createServerHeaders(),
      cache: 'no-store',
    });

    if (response.ok) {
      return NextResponse.json(await response.json());
    }

    if (!isFixtureFallbackEnabled()) {
      return toFixtureFallbackDisabledResponse('Backend customers list is unavailable in current environment');
    }
  } catch {
    if (!isFixtureFallbackEnabled()) {
      return toFixtureFallbackDisabledResponse('Backend customers list is unavailable in current environment');
    }
  }

  // Fixture fallback
  const isActive = searchParams.get('isActive');
  let data = customerFixtures;

  if (isActive !== null) {
    const isActiveBool = isActive === 'true';
    data = data.filter((c) => c.isActive === isActiveBool);
  }

  return NextResponse.json({ data, total: data.length });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await fetch(buildBackendUrl('/customers'), {
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
      return toFixtureFallbackDisabledResponse('Backend customers create is unavailable in current environment');
    }

    // Fixture fallback - simulate creation
    const body = await request.json().catch(() => ({}));
    const now = new Date().toISOString();
    const newCustomer = {
      id: `cust_${Date.now()}`,
      tenantId: '1001',
      code: body.code ?? 'CUST-NEW',
      name: body.name ?? '新客户',
      contactPerson: body.contactPerson ?? null,
      contactPhone: body.contactPhone ?? null,
      email: body.email ?? null,
      address: body.address ?? null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    return NextResponse.json(newCustomer, { status: 201 });
  }
}
