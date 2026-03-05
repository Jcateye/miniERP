import { NextResponse } from 'next/server';

import {
  buildBackendUrl,
  createServerHeaders,
  isFixtureFallbackEnabled,
  toFixtureFallbackDisabledResponse,
  toUpstreamErrorResponse,
  toUpstreamUnavailableResponse,
} from '@/lib/bff/server-fixtures';

interface SkuDetailDto {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  specification: string | null;
  baseUnit: string;
  categoryId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const SKU_DETAIL_FIXTURES: Record<string, SkuDetailDto> = {
  sku_001: {
    id: 'sku_001',
    tenantId: '1001',
    code: 'CAB-HDMI-2M',
    name: 'HDMI高清线 2米',
    specification: 'HDMI 2.0, 4K@60Hz, 2米',
    baseUnit: 'PCS',
    categoryId: 'cat_cable',
    isActive: true,
    createdAt: '2026-03-01T08:00:00.000Z',
    updatedAt: '2026-03-01T08:00:00.000Z',
  },
  sku_002: {
    id: 'sku_002',
    tenantId: '1001',
    code: 'ADP-USB-C-DP',
    name: 'USB-C转DP适配器',
    specification: 'USB-C to DisplayPort, 4K@60Hz',
    baseUnit: 'PCS',
    categoryId: 'cat_adapter',
    isActive: true,
    createdAt: '2026-03-01T08:00:00.000Z',
    updatedAt: '2026-03-01T08:00:00.000Z',
  },
  sku_003: {
    id: 'sku_003',
    tenantId: '1001',
    code: 'CAB-LAN-CAT6',
    name: '网线 CAT6',
    specification: 'Cat6 UTP, 5米',
    baseUnit: 'PCS',
    categoryId: 'cat_cable',
    isActive: true,
    createdAt: '2026-03-02T09:30:00.000Z',
    updatedAt: '2026-03-02T09:30:00.000Z',
  },
};

function getSkuFixture(id: string): SkuDetailDto | null {
  return SKU_DETAIL_FIXTURES[id] ?? null;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const response = await fetch(buildBackendUrl(`/skus/${id}`), {
      headers: createServerHeaders(),
      cache: 'no-store',
    });

    if (response.ok) {
      return NextResponse.json(await response.json());
    }

    if (response.status === 404) {
      return NextResponse.json(
        {
          error: {
            code: 'SKU_NOT_FOUND',
            message: `SKU with id ${id} not found`,
            category: 'not_found',
          },
        },
        { status: 404 },
      );
    }

    if (!isFixtureFallbackEnabled()) {
      return toFixtureFallbackDisabledResponse('Backend SKU detail is unavailable in current environment');
    }
  } catch {
    if (!isFixtureFallbackEnabled()) {
      return toFixtureFallbackDisabledResponse('Backend SKU detail is unavailable in current environment');
    }
  }

  // Fixture fallback
  const fixture = getSkuFixture(id);

  if (!fixture) {
    return NextResponse.json(
      {
        error: {
          code: 'SKU_NOT_FOUND',
          message: `SKU with id ${id} not found`,
          category: 'not_found',
        },
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    data: fixture,
    message: 'fixture',
  });
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const idempotencyKey = request.headers.get('idempotency-key');

  if (!idempotencyKey || idempotencyKey.trim() === '') {
    return NextResponse.json(
      {
        error: {
          code: 'IDEMPOTENCY_KEY_REQUIRED',
          message: 'Idempotency-Key header is required for SKU update',
          category: 'validation',
        },
      },
      { status: 400 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: {
          code: 'INVALID_JSON',
          message: 'Request body must be valid JSON',
          category: 'validation',
        },
      },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(buildBackendUrl(`/skus/${id}`), {
      method: 'PUT',
      headers: {
        ...createServerHeaders(),
        'idempotency-key': idempotencyKey,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (response.ok) {
      return NextResponse.json(await response.json());
    }

    if (response.status === 404) {
      return NextResponse.json(
        {
          error: {
            code: 'SKU_NOT_FOUND',
            message: `SKU with id ${id} not found`,
            category: 'not_found',
          },
        },
        { status: 404 },
      );
    }

    return toUpstreamErrorResponse(response);
  } catch {
    return toUpstreamUnavailableResponse('Backend SKU update is unavailable');
  }
}
