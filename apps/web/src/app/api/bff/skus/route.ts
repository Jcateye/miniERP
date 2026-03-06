import { NextRequest, NextResponse } from 'next/server';

import {
  buildBackendUrl,
  createServerHeaders,
  isFixtureFallbackEnabled,
  toFixtureFallbackResponse,
  toFixtureFallbackDisabledResponse,
  toUpstreamErrorResponse,
  toUpstreamUnavailableResponse,
} from '@/lib/bff/server-fixtures';

interface SkuListItemDto {
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

const SKU_FIXTURES: SkuListItemDto[] = [
  {
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
  {
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
  {
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
];

type SkuListFilter = {
  code?: string;
  name?: string;
  categoryId?: string;
  isActive?: boolean;
};

function getSkuFixtures(filter?: SkuListFilter): SkuListItemDto[] {
  let result = SKU_FIXTURES;

  const code = filter?.code;
  if (code) {
    result = result.filter((sku) =>
      sku.code.toLowerCase().includes(code.toLowerCase()),
    );
  }
  const name = filter?.name;
  if (name) {
    result = result.filter((sku) =>
      sku.name.toLowerCase().includes(name.toLowerCase()),
    );
  }
  if (filter?.categoryId) {
    result = result.filter((sku) => sku.categoryId === filter.categoryId);
  }
  if (filter?.isActive !== undefined) {
    result = result.filter((sku) => sku.isActive === filter.isActive);
  }

  return result;
}

function parseOptionalQueryString(value: string | null): string | undefined {
  if (value === null || value === '') {
    return undefined;
  }

  return value;
}

function parseSkuListQuery(searchParams: URLSearchParams):
  | { readonly ok: true; readonly filter: SkuListFilter; readonly upstreamQuery: string }
  | { readonly ok: false; readonly message: string } {
  const code = parseOptionalQueryString(searchParams.get('code'));
  const name = parseOptionalQueryString(searchParams.get('name'));
  const categoryId = parseOptionalQueryString(searchParams.get('categoryId'));
  const isActiveParam = searchParams.get('isActive');

  let isActive: boolean | undefined;
  if (isActiveParam === null) {
    isActive = undefined;
  } else if (isActiveParam === 'true') {
    isActive = true;
  } else if (isActiveParam === 'false') {
    isActive = false;
  } else {
    return { ok: false, message: 'isActive must be true or false' };
  }

  const upstreamParams = new URLSearchParams(searchParams);
  if (code === undefined) {
    upstreamParams.delete('code');
  }
  if (name === undefined) {
    upstreamParams.delete('name');
  }
  if (categoryId === undefined) {
    upstreamParams.delete('categoryId');
  }
  if (isActive === undefined) {
    upstreamParams.delete('isActive');
  } else {
    upstreamParams.set('isActive', String(isActive));
  }

  return {
    ok: true,
    filter: {
      code,
      name,
      categoryId,
      isActive,
    },
    upstreamQuery: upstreamParams.toString(),
  };
}

export async function GET(request: NextRequest) {
  const parsedQuery = parseSkuListQuery(request.nextUrl.searchParams);
  if (!parsedQuery.ok) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_INVALID_QUERY',
          category: 'validation',
          message: parsedQuery.message,
        },
      },
      { status: 400 },
    );
  }

  const upstreamPath = parsedQuery.upstreamQuery
    ? `/skus?${parsedQuery.upstreamQuery}`
    : '/skus';

  try {
    const response = await fetch(buildBackendUrl(upstreamPath), {
      headers: createServerHeaders(),
      cache: 'no-store',
    });

    if (response.ok) {
      return NextResponse.json(await response.json());
    }

    if (!isFixtureFallbackEnabled()) {
      return toFixtureFallbackDisabledResponse('Backend SKU list is unavailable in current environment', response.status);
    }

    return toUpstreamErrorResponse(response);
  } catch {
    if (!isFixtureFallbackEnabled()) {
      return toFixtureFallbackDisabledResponse('Backend SKU list is unavailable in current environment');
    }
  }

  // Fixture fallback
  const fixtures = getSkuFixtures(parsedQuery.filter);

  return toFixtureFallbackResponse({
    data: fixtures,
    total: fixtures.length,
    message: 'fixture',
  });
}

export async function POST(request: Request) {
  const idempotencyKey = request.headers.get('idempotency-key');

  if (!idempotencyKey || idempotencyKey.trim() === '') {
    return NextResponse.json(
      {
        error: {
          code: 'IDEMPOTENCY_KEY_REQUIRED',
          message: 'Idempotency-Key header is required for SKU creation',
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
    const response = await fetch(buildBackendUrl('/skus'), {
      method: 'POST',
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

    return toUpstreamErrorResponse(response);
  } catch {
    return toUpstreamUnavailableResponse('Backend SKU creation is unavailable');
  }
}
