import { NextRequest, NextResponse } from 'next/server';

import type { CreateWarehouseCommand, Warehouse } from '@minierp/shared';

import {
  buildBackendUrl,
  createServerHeaders,
  toFixtureFallbackDisabledResponse,
  toFixtureFallbackResponse,
  toUpstreamErrorResponse,
  toUpstreamUnavailableResponse,
} from '@/lib/bff/server-fixtures';
import { warehouseListFixtures } from '@/lib/mocks/erp-list-fixtures';

type BackendWarehouseDto = {
  id: string;
  tenantId?: string;
  code: string;
  name: string;
  address?: string | null;
  contactPerson?: string | null;
  contactPhone?: string | null;
  manageBin?: boolean;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
};

function isBackendWarehouseDto(value: unknown): value is BackendWarehouseDto {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { id?: unknown }).id === 'string' &&
    typeof (value as { code?: unknown }).code === 'string' &&
    typeof (value as { name?: unknown }).name === 'string' &&
    typeof (value as { createdAt?: unknown }).createdAt === 'string' &&
    typeof (value as { updatedAt?: unknown }).updatedAt === 'string'
  );
}

function mapBackendWarehouse(entity: BackendWarehouseDto): Warehouse {
  return {
    id: entity.id,
    tenantId: entity.tenantId ?? '1001',
    code: entity.code,
    name: entity.name,
    address: entity.address ?? null,
    contactName: entity.contactPerson ?? null,
    phone: entity.contactPhone ?? null,
    supportsBinManagement: entity.manageBin ?? false,
    status: entity.isActive === false ? 'disabled' : 'normal',
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
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

function parseCreateWarehouseCommand(
  payload: unknown,
):
  | { readonly ok: true; readonly data: CreateWarehouseCommand }
  | { readonly ok: false; readonly message: string } {
  if (typeof payload !== 'object' || payload === null) {
    return { ok: false, message: 'Request body must be an object' };
  }

  const candidate = payload as Record<string, unknown>;

  if (!isNonEmptyString(candidate.code)) {
    return { ok: false, message: 'code is required' };
  }

  if (!isNonEmptyString(candidate.name)) {
    return { ok: false, message: 'name is required' };
  }

  if (!isOptionalNullableString(candidate.address)) {
    return { ok: false, message: 'address must be string or null' };
  }

  if (!isOptionalNullableString(candidate.contactPerson)) {
    return { ok: false, message: 'contactPerson must be string or null' };
  }

  if (!isOptionalNullableString(candidate.contactPhone)) {
    return { ok: false, message: 'contactPhone must be string or null' };
  }

  if (candidate.manageBin !== undefined && typeof candidate.manageBin !== 'boolean') {
    return { ok: false, message: 'manageBin must be boolean' };
  }

  return {
    ok: true,
    data: {
      code: candidate.code.trim(),
      name: candidate.name.trim(),
      address: normalizeOptionalNullableString(candidate.address),
      contactPerson: normalizeOptionalNullableString(candidate.contactPerson),
      contactPhone: normalizeOptionalNullableString(candidate.contactPhone),
      manageBin: candidate.manageBin as boolean | undefined,
    },
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  try {
    const response = await fetch(buildBackendUrl(`/warehouses?${searchParams.toString()}`), {
      headers: createServerHeaders(),
      cache: 'no-store',
    });

    if (response.ok) {
      const payload = (await response.json()) as
        | { data?: BackendWarehouseDto[]; total?: number }
        | BackendWarehouseDto[];
      const data = Array.isArray(payload)
        ? payload.map(mapBackendWarehouse)
        : Array.isArray(payload.data)
          ? payload.data.map(mapBackendWarehouse)
          : [];

      return NextResponse.json({
        data,
        total: Array.isArray(payload) ? data.length : payload.total ?? data.length,
      });
    }

    return toUpstreamErrorResponse(response);
  } catch {
    if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
      return toFixtureFallbackDisabledResponse('Backend warehouses list is unavailable');
    }

    const q = searchParams.get('q')?.trim().toLowerCase() ?? '';
    const data = q
      ? warehouseListFixtures.filter((item) =>
          [item.code, item.name, item.address ?? '', item.contactName ?? '']
            .some((value) => value.toLowerCase().includes(q)),
        )
      : warehouseListFixtures;

    return toFixtureFallbackResponse(
      {
        data,
        total: data.length,
      },
      'fixture_warehouses_list',
    );
  }
}

export async function POST(request: NextRequest) {
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

  const parsed = parseCreateWarehouseCommand(payload);
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
    const response = await fetch(buildBackendUrl('/warehouses'), {
      method: 'POST',
      headers: createServerHeaders(),
      body: JSON.stringify(parsed.data),
      cache: 'no-store',
    });

    if (response.ok) {
      const payload = (await response.json()) as BackendWarehouseDto | { data?: BackendWarehouseDto };
      const entity =
        payload && typeof payload === 'object' && 'data' in payload
          ? payload.data
          : payload;

      if (!isBackendWarehouseDto(entity)) {
        return NextResponse.json(
          {
            error: {
              code: 'WAREHOUSE_CREATE_EMPTY',
              category: 'upstream',
              message: 'Backend warehouses create returned empty payload',
            },
          },
          { status: 502 },
        );
      }

      return NextResponse.json(mapBackendWarehouse(entity));
    }

    return toUpstreamErrorResponse(response);
  } catch {
    return toUpstreamUnavailableResponse('Backend warehouses create is unavailable');
  }
}
