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
import { warehouseListFixtures } from '@/lib/mocks/erp-list-fixtures';
import type { Warehouse } from '@minierp/shared';

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

const ALLOWED_PATCH_FIELDS = [
  'name',
  'address',
  'contactPerson',
  'contactPhone',
  'manageBin',
  'isActive',
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
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

function parseUpdateWarehousePayload(
  payload: unknown,
):
  | {
      readonly ok: true;
      readonly data: {
        readonly name?: string;
        readonly address?: string | null;
        readonly contactPerson?: string | null;
        readonly contactPhone?: string | null;
        readonly manageBin?: boolean;
        readonly isActive?: boolean;
      };
    }
  | { readonly ok: false; readonly message: string } {
  if (!isRecord(payload)) {
    return { ok: false, message: 'Request body must be an object' };
  }

  const candidate = payload;

  if (
    Object.keys(candidate).some(
      (key) => !ALLOWED_PATCH_FIELDS.includes(key as (typeof ALLOWED_PATCH_FIELDS)[number]),
    )
  ) {
    return { ok: false, message: 'Request body contains unsupported fields' };
  }

  if (candidate.name !== undefined && !isNonEmptyString(candidate.name)) {
    return { ok: false, message: 'name cannot be empty' };
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

  if (candidate.isActive !== undefined && typeof candidate.isActive !== 'boolean') {
    return { ok: false, message: 'isActive must be boolean' };
  }

  return {
    ok: true,
    data: {
      name: candidate.name === undefined ? undefined : candidate.name.trim(),
      address: normalizeOptionalNullableString(candidate.address),
      contactPerson: normalizeOptionalNullableString(candidate.contactPerson),
      contactPhone: normalizeOptionalNullableString(candidate.contactPhone),
      manageBin: candidate.manageBin as boolean | undefined,
      isActive: candidate.isActive as boolean | undefined,
    },
  };
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

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const response = await fetch(buildBackendUrl(`/warehouses/${id}`), {
      method: 'GET',
      headers: createServerHeaders(),
      cache: 'no-store',
    });

    if (response.ok) {
      const payload = (await response.json()) as
        | BackendWarehouseDto
        | { data?: BackendWarehouseDto };
      const entity =
        payload && typeof payload === 'object' && 'data' in payload
          ? payload.data
          : payload;

      if (!isBackendWarehouseDto(entity)) {
        return NextResponse.json(
          {
            error: {
              code: 'WAREHOUSE_NOT_FOUND',
              message: `Warehouse with id ${id} not found`,
              category: 'not_found',
            },
          },
          { status: 404 },
        );
      }

      return NextResponse.json(mapBackendWarehouse(entity));
    }

    return toUpstreamErrorResponse(response);
  } catch {
    if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
      return toFixtureFallbackDisabledResponse('Backend warehouse detail is unavailable');
    }

    const entity = warehouseListFixtures.find((item) => item.id === id);
    if (!entity) {
      return applyBffTraceHeaders(
        NextResponse.json(
          {
            error: {
              code: 'WAREHOUSE_NOT_FOUND',
              message: `Warehouse with id ${id} not found`,
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

    return toFixtureFallbackResponse(
      {
        data: entity,
        message: 'fixture',
      },
      'fixture_warehouse_detail',
    );
  }
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

  const parsed = parseUpdateWarehousePayload(payload);
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
    const response = await fetch(buildBackendUrl(`/warehouses/${id}`), {
      method: 'PATCH',
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

      if (!entity || !isBackendWarehouseDto(entity)) {
        return NextResponse.json(
          {
            error: {
              code: 'WAREHOUSE_UPDATE_EMPTY',
              category: 'upstream',
              message: 'Backend warehouses update returned empty payload',
            },
          },
          { status: 502 },
        );
      }

      return NextResponse.json(mapBackendWarehouse(entity));
    }

    return toUpstreamErrorResponse(response);
  } catch {
    return toUpstreamUnavailableResponse('Backend warehouses update is unavailable');
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const response = await fetch(buildBackendUrl(`/warehouses/${id}`), {
      method: 'DELETE',
      headers: createServerHeaders(),
      cache: 'no-store',
    });

    if (response.ok) {
      return NextResponse.json(await response.json());
    }

    return toUpstreamErrorResponse(response);
  } catch {
    return toUpstreamUnavailableResponse('Backend warehouses delete is unavailable');
  }
}
