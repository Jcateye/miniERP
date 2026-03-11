import { NextRequest, NextResponse } from 'next/server';

import type { Sku } from '@minierp/shared';

import { createMockListResponse, compareListValues, normalizeSortDirection, parsePositiveIntParam } from '@/lib/bff/mock-list';
import {
  buildBackendUrl,
  createServerHeaders,
  isFixtureFallbackEnabled,
  toFixtureFallbackDisabledResponse,
  toUpstreamErrorResponse,
  toUpstreamUnavailableResponse,
} from '@/lib/bff/server-fixtures';
import {
  skuCategoryIdByLabel,
  skuListFixtures,
  skuViewMetaByCode,
} from '@/lib/mocks/erp-list-fixtures';
import {
  fetchBackendArray,
  toListRouteResponse,
} from '../../_shared/list-route-utils';

interface BackendSkuDto {
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

interface SkuMutationPayload {
  readonly code?: string;
  readonly name?: string;
  readonly specification?: string | null;
  readonly baseUnit?: string;
  readonly category?: string | null;
  readonly status?: 'normal' | 'warning' | 'disabled';
}

function matchesKeyword(item: Sku, search: string) {
  const code = item.code;
  const name = item.name;
  const meta = skuViewMetaByCode[code];
  const keyword = search.toLowerCase();

  return [code, name, item.specification ?? '', meta?.categoryLabel ?? '', meta?.supplierName ?? '', meta?.warehouseLabel ?? '']
    .some((value) => value.toLowerCase().includes(keyword));
}

function mapBackendSku(item: BackendSkuDto): Sku {
  const meta = skuViewMetaByCode[item.code];

  return {
    id: item.id,
    tenantId: item.tenantId,
    code: item.code,
    name: item.name,
    specification: item.specification,
    unit: item.baseUnit,
    categoryId:
      item.categoryId ??
      (meta ? skuCategoryIdByLabel[meta.categoryLabel] ?? null : null),
    barcode: null,
    batchManaged: false,
    serialManaged: false,
    status: item.isActive
      ? meta && meta.stock <= meta.threshold
        ? 'warning'
        : 'normal'
      : 'disabled',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isOptionalNullableString(value: unknown): value is string | null | undefined {
  return value === undefined || value === null || typeof value === 'string';
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeOptionalNullableString(value: string | null | undefined): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function normalizeCategoryId(value: string | null | undefined): string | null {
  const normalized = normalizeOptionalNullableString(value);

  if (normalized === null) {
    return null;
  }

  return skuCategoryIdByLabel[normalized] ?? normalized;
}

function parseStatus(value: unknown): SkuMutationPayload['status'] {
  if (value === undefined) {
    return 'normal';
  }

  if (value === 'normal' || value === 'warning' || value === 'disabled') {
    return value;
  }

  return undefined;
}

function parseCreateSkuPayload(
  payload: unknown,
):
  | {
      readonly ok: true;
      readonly data: {
        readonly categoryId: string | null;
        readonly code: string;
        readonly name: string;
        readonly specification: string | null;
        readonly baseUnit: string;
      };
      readonly status: NonNullable<SkuMutationPayload['status']>;
    }
  | { readonly ok: false; readonly message: string } {
  if (!isRecord(payload)) {
    return { ok: false, message: 'Request body must be an object' };
  }

  if (!isNonEmptyString(payload.code)) {
    return { ok: false, message: 'code is required' };
  }

  if (!isNonEmptyString(payload.name)) {
    return { ok: false, message: 'name is required' };
  }

  if (!isOptionalNullableString(payload.specification)) {
    return { ok: false, message: 'specification must be string or null' };
  }

  if (!isNonEmptyString(payload.baseUnit)) {
    return { ok: false, message: 'baseUnit is required' };
  }

  if (!isOptionalNullableString(payload.category)) {
    return { ok: false, message: 'category must be string or null' };
  }

  const status = parseStatus(payload.status);
  if (!status) {
    return { ok: false, message: 'status must be normal, warning or disabled' };
  }

  return {
    ok: true,
    data: {
      categoryId: normalizeCategoryId(payload.category),
      code: payload.code.trim(),
      name: payload.name.trim(),
      specification: normalizeOptionalNullableString(payload.specification),
      baseUnit: payload.baseUnit.trim(),
    },
    status,
  };
}

function unwrapPayload<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in (payload as Record<string, unknown>)) {
    return (payload as { data: T }).data;
  }

  return payload as T;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parsePositiveIntParam(searchParams.get('page'), 1);
  const pageSize = parsePositiveIntParam(searchParams.get('pageSize'), 5);
  const q = (searchParams.get('q') || searchParams.get('search') || '').trim();
  const category = (searchParams.get('category') || '').trim();
  const status = (searchParams.get('status') || '').trim();
  const supplier = (searchParams.get('supplier') || '').trim();
  const warehouse = (searchParams.get('warehouse') || '').trim();
  const lowStock = searchParams.get('lowStock') === '1';
  const sortBy = (searchParams.get('sortBy') || 'code') as SortField;
  const sortOrder = normalizeSortDirection(searchParams.get('sortOrder'));
  let source: readonly Sku[] = skuListFixtures;
  let fallbackReason: string | undefined;

  const upstream = await fetchBackendArray<BackendSkuDto>('/skus');
  if (upstream.ok) {
    source = upstream.data.map(mapBackendSku);
  } else if (upstream.response) {
    if (upstream.response.status >= 400 && upstream.response.status < 500) {
      return toUpstreamErrorResponse(upstream.response);
    }

    if (!isFixtureFallbackEnabled()) {
      return toFixtureFallbackDisabledResponse(
        'Backend SKU list is unavailable in current environment',
        upstream.response.status,
      );
    }

    fallbackReason = 'fixture_response';
  } else if (!isFixtureFallbackEnabled()) {
    return toFixtureFallbackDisabledResponse(
      'Backend SKU list is unavailable in current environment',
    );
  } else {
    fallbackReason = 'fixture_response';
  }

  const filtered = source
    .filter((item) => {
      const meta = skuViewMetaByCode[item.code];
      const hasMeta = Boolean(meta);

      if ((supplier || warehouse || lowStock) && !hasMeta) {
        return false;
      }

      if (q && !matchesKeyword(item, q)) {
        return false;
      }

      if (category && meta?.categoryLabel !== category) {
        return false;
      }

      if (status && item.status !== mapStatusLabelToValue(status)) {
        return false;
      }

      if (supplier && meta.supplierName !== supplier) {
        return false;
      }

      if (warehouse && meta.warehouseLabel !== warehouse) {
        return false;
      }

      if (lowStock && meta.stock > meta.threshold) {
        return false;
      }

      return true;
    })
    .toSorted((left, right) => {
      return compareListValues(
        getSortValue(left, sortBy),
        getSortValue(right, sortBy),
        sortOrder,
      );
    });

  const payload = createMockListResponse(
    filtered,
    page,
    pageSize,
    fallbackReason ? 'fixture' : 'OK',
  );

  return toListRouteResponse(payload, fallbackReason);
}

export async function POST(request: NextRequest) {
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

  const parsed = parseCreateSkuPayload(payload);
  if (!parsed.ok) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_INVALID_PAYLOAD',
          message: parsed.message,
          category: 'validation',
        },
      },
      { status: 400 },
    );
  }

  try {
    const createResponse = await fetch(buildBackendUrl('/skus'), {
      method: 'POST',
      headers: {
        ...createServerHeaders(),
        'idempotency-key': idempotencyKey,
      },
      body: JSON.stringify(parsed.data),
      cache: 'no-store',
    });

    if (!createResponse.ok) {
      return toUpstreamErrorResponse(createResponse);
    }

    const createdPayload = await createResponse.json();
    if (parsed.status !== 'disabled') {
      return NextResponse.json(createdPayload);
    }

    const createdSku = unwrapPayload<{ id?: string }>(createdPayload);
    if (!createdSku?.id) {
      return NextResponse.json(createdPayload);
    }

    const disableResponse = await fetch(buildBackendUrl(`/skus/${createdSku.id}`), {
      method: 'PUT',
      headers: {
        ...createServerHeaders(),
        'idempotency-key': `${idempotencyKey}-disable`,
      },
      body: JSON.stringify({ isActive: false }),
      cache: 'no-store',
    });

    if (!disableResponse.ok) {
      return toUpstreamErrorResponse(disableResponse);
    }

    return NextResponse.json(await disableResponse.json());
  } catch {
    return toUpstreamUnavailableResponse('Backend SKU creation is unavailable');
  }
}

function mapStatusLabelToValue(label: string) {
  switch (label) {
    case '下架':
      return 'disabled';
    case '补货':
      return 'warning';
    default:
      return 'normal';
  }
}

type SortField = 'cat' | 'code' | 'name' | 'status' | 'stock' | 'supp' | 'threshold';

function getSortValue(item: Sku, sortBy: SortField) {
  const meta = skuViewMetaByCode[item.code];

  switch (sortBy) {
    case 'cat':
      return meta?.categoryLabel ?? '';
    case 'name':
      return item.name;
    case 'status':
      return item.status;
    case 'stock':
      return meta?.stock ?? 0;
    case 'supp':
      return meta?.supplierName ?? '';
    case 'threshold':
      return meta?.threshold ?? 0;
    default:
      return item.code;
  }
}
