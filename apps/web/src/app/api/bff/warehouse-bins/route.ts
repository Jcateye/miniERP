import { NextRequest } from 'next/server';

import type { WarehouseBin } from '@minierp/shared';

import { fetchBackendArray, toListRouteResponse } from '../_shared/list-route-utils';
import {
  buildBackendUrl,
  createServerHeaders,
  toFixtureFallbackDisabledResponse,
  toUpstreamErrorResponse,
  toUpstreamUnavailableResponse,
} from '@/lib/bff/server-fixtures';
import { warehouseBinListFixtures } from '@/lib/mocks/erp-list-fixtures';

type WarehouseBinLookupDto = {
  id: string;
  tenantId?: string | null;
  warehouseId?: string | null;
  code?: string | null;
  name?: string | null;
  binCode?: string | null;
  binName?: string | null;
  zoneCode?: string | null;
  binType?: string | null;
  status?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

function isWarehouseBinLookupDto(value: unknown): value is WarehouseBinLookupDto {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { id?: unknown }).id === 'string'
  );
}

function mapBackendWarehouseBin(entity: WarehouseBinLookupDto): WarehouseBin | null {
  const code = entity.code ?? entity.binCode ?? null;
  const name = entity.name ?? entity.binName ?? null;

  if (!entity.id || !entity.warehouseId || !code || !name) {
    return null;
  }

  return {
    id: entity.id,
    tenantId: entity.tenantId ?? '1001',
    warehouseId: entity.warehouseId,
    code,
    name,
    zoneCode: entity.zoneCode ?? null,
    binType: entity.binType ?? null,
    status: entity.status === 'inactive' ? 'disabled' : 'normal',
    createdAt: entity.createdAt ?? new Date(0).toISOString(),
    updatedAt: entity.updatedAt ?? new Date(0).toISOString(),
  };
}

function isOptionalNullableString(value: unknown): value is string | null | undefined {
  return value === undefined || value === null || typeof value === 'string';
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeOptionalNullableString(value: string | null | undefined): string | null | undefined {
  if (value === undefined || value === null) {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function parseCreateWarehouseBinPayload(payload: unknown) {
  if (typeof payload !== 'object' || payload === null) {
    return { ok: false as const, message: 'Request body must be an object' };
  }

  const candidate = payload as Record<string, unknown>;

  if (!isNonEmptyString(candidate.warehouseId)) {
    return { ok: false as const, message: 'warehouseId is required' };
  }

  if (!isNonEmptyString(candidate.code)) {
    return { ok: false as const, message: 'code is required' };
  }

  if (!isNonEmptyString(candidate.name)) {
    return { ok: false as const, message: 'name is required' };
  }

  if (!isOptionalNullableString(candidate.zoneCode)) {
    return { ok: false as const, message: 'zoneCode must be string or null' };
  }

  if (!isOptionalNullableString(candidate.binType)) {
    return { ok: false as const, message: 'binType must be string or null' };
  }

  if (
    candidate.status !== undefined &&
    candidate.status !== 'normal' &&
    candidate.status !== 'disabled'
  ) {
    return { ok: false as const, message: 'status must be normal or disabled' };
  }

  return {
    ok: true as const,
    data: {
      warehouseId: candidate.warehouseId.trim(),
      code: candidate.code.trim(),
      name: candidate.name.trim(),
      zoneCode: normalizeOptionalNullableString(candidate.zoneCode),
      binType: normalizeOptionalNullableString(candidate.binType),
      status: candidate.status === 'disabled' ? 'inactive' : 'active',
    },
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const backend = await fetchBackendArray<WarehouseBinLookupDto>(
    `/warehouse-bins?${searchParams.toString()}`,
  );

  if (backend.ok) {
    return toListRouteResponse({
      data: backend.data.map(mapBackendWarehouseBin).filter((entity) => entity !== null),
    });
  }

  if (backend.response) {
    if (backend.response.status === 404) {
      return toListRouteResponse(
        {
          data: warehouseBinListFixtures,
        },
        'fixture_warehouse_bins_list',
      );
    }

    if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
      return toUpstreamErrorResponse(backend.response);
    }
  }

  if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
    return toFixtureFallbackDisabledResponse('Backend warehouse bins list is unavailable');
  }

  const warehouseId = searchParams.get('warehouseId');
  const data = warehouseId
    ? warehouseBinListFixtures.filter((entity) => entity.warehouseId === warehouseId)
    : warehouseBinListFixtures;

  return toListRouteResponse(
    {
      data,
    },
    'fixture_warehouse_bins_list',
  );
}

export async function POST(request: NextRequest) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json(
      {
        error: {
          code: 'VALIDATION_INVALID_JSON',
          category: 'validation',
          message: 'Request body must be valid JSON',
        },
      },
      { status: 400 },
    );
  }

  const parsed = parseCreateWarehouseBinPayload(payload);
  if (!parsed.ok) {
    return Response.json(
      {
        error: {
          code: 'VALIDATION_INVALID_PAYLOAD',
          category: 'validation',
          message: parsed.message,
        },
      },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(buildBackendUrl('/warehouse-bins'), {
      method: 'POST',
      headers: createServerHeaders(),
      body: JSON.stringify(parsed.data),
      cache: 'no-store',
    });

    if (response.ok) {
      const payload = (await response.json()) as WarehouseBinLookupDto | { data?: WarehouseBinLookupDto };
      const entity =
        payload && typeof payload === 'object' && 'data' in payload ? payload.data : payload;
      const mapped = isWarehouseBinLookupDto(entity)
        ? mapBackendWarehouseBin(entity)
        : null;

      if (!mapped) {
        return Response.json(
          {
            error: {
              code: 'WAREHOUSE_BIN_CREATE_EMPTY',
              category: 'upstream',
              message: 'Backend warehouse bin create returned empty payload',
            },
          },
          { status: 502 },
        );
      }

      return Response.json(mapped);
    }

    return toUpstreamErrorResponse(response);
  } catch {
    return toUpstreamUnavailableResponse('Backend warehouse bin create is unavailable');
  }
}
