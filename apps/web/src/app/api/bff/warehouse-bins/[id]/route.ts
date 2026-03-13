import { NextResponse } from 'next/server';

import {
  applyBffTraceHeaders,
  buildBackendUrl,
  createServerHeaders,
  toFixtureFallbackDisabledResponse,
  toFixtureFallbackResponse,
  toUpstreamErrorResponse,
  toUpstreamUnavailableResponse,
} from '@/lib/bff/server-fixtures';
import { fetchMasterdataEntityResult } from '../../_shared/masterdata-detail-resolvers';

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

function mapBackendWarehouseBin(entity: WarehouseBinLookupDto) {
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

function parseUpdateWarehouseBinPayload(payload: unknown) {
  if (typeof payload !== 'object' || payload === null) {
    return { ok: false as const, message: 'Request body must be an object' };
  }

  const candidate = payload as Record<string, unknown>;

  if (
    candidate.name !== undefined &&
    candidate.name !== null &&
    !isNonEmptyString(candidate.name)
  ) {
    return { ok: false as const, message: 'name cannot be empty' };
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
      name:
        candidate.name === undefined || candidate.name === null
          ? undefined
          : candidate.name.trim(),
      zoneCode: normalizeOptionalNullableString(candidate.zoneCode),
      binType: normalizeOptionalNullableString(candidate.binType),
      status: candidate.status === undefined
        ? undefined
        : candidate.status === 'disabled'
          ? 'inactive'
          : 'active',
    },
  };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const result = await fetchMasterdataEntityResult('warehouse-bins', id);

  if (result.kind === 'ok') {
    return result.fallbackHit
      ? toFixtureFallbackResponse(
          {
            data: result.data,
            message: 'fixture',
          },
          'fixture_warehouse_bin_detail',
        )
      : NextResponse.json(result.data);
  }

  if (result.kind === 'unavailable') {
    return toFixtureFallbackDisabledResponse(
      'Backend warehouse bin detail is unavailable in current environment',
      result.status,
    );
  }

  return applyBffTraceHeaders(
    NextResponse.json(
      {
        error: {
          code: 'WAREHOUSE_BIN_NOT_FOUND',
          message: `Warehouse bin with id ${id} not found`,
          category: 'not_found',
        },
      },
      { status: 404 },
    ),
    {
      fallbackHit: '1',
      reason: 'fixture_miss',
    },
  );
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
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

  const parsed = parseUpdateWarehouseBinPayload(payload);
  if (!parsed.ok) {
    return NextResponse.json(
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
    const response = await fetch(buildBackendUrl(`/warehouse-bins/${id}`), {
      method: 'PATCH',
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
        return NextResponse.json(
          {
            error: {
              code: 'WAREHOUSE_BIN_UPDATE_EMPTY',
              category: 'upstream',
              message: 'Backend warehouse bin update returned empty payload',
            },
          },
          { status: 502 },
        );
      }

      return NextResponse.json(mapped);
    }

    return toUpstreamErrorResponse(response);
  } catch {
    return toUpstreamUnavailableResponse('Backend warehouse bin update is unavailable');
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const response = await fetch(buildBackendUrl(`/warehouse-bins/${id}`), {
      method: 'DELETE',
      headers: createServerHeaders(),
      cache: 'no-store',
    });

    if (response.ok) {
      return NextResponse.json(await response.json());
    }

    return toUpstreamErrorResponse(response);
  } catch {
    return toUpstreamUnavailableResponse('Backend warehouse bin delete is unavailable');
  }
}
