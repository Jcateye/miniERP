import { NextResponse } from 'next/server';

import {
  buildBackendUrl,
  createServerHeaders,
  toUpstreamErrorResponse,
  toUpstreamUnavailableResponse,
} from '@/lib/bff/server-fixtures';
import { skuCategoryIdByLabel } from '@/lib/mocks/erp-list-fixtures';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isOptionalNullableString(value: unknown): value is string | null | undefined {
  return value === undefined || value === null || typeof value === 'string';
}

function isOptionalNullableBoolean(value: unknown): value is boolean | null | undefined {
  return value === undefined || value === null || typeof value === 'boolean';
}

function isOptionalNullableInteger(value: unknown): value is number | null | undefined {
  return (
    value === undefined ||
    value === null ||
    (typeof value === 'number' && Number.isInteger(value))
  );
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

function normalizeCategoryId(value: string | null | undefined): string | null | undefined {
  const normalized = normalizeOptionalNullableString(value);

  if (normalized === undefined || normalized === null) {
    return normalized;
  }

  return skuCategoryIdByLabel[normalized] ?? normalized;
}

function parseUpdateSkuPayload(
  payload: unknown,
):
  | {
      readonly ok: true;
      readonly data: {
        readonly name?: string;
        readonly specification?: string | null;
        readonly baseUnit?: string;
        readonly categoryId?: string | null;
        readonly itemType?: string | null;
        readonly taxCodeId?: string | null;
        readonly taxRate?: string | null;
        readonly barcode?: string | null;
        readonly batchManaged?: boolean;
        readonly serialManaged?: boolean;
        readonly shelfLifeDays?: number | null;
        readonly minStockQty?: string | null;
        readonly maxStockQty?: string | null;
        readonly leadTimeDays?: number | null;
        readonly isActive?: boolean;
      };
    }
  | { readonly ok: false; readonly message: string } {
  if (!isRecord(payload)) {
    return { ok: false, message: 'Request body must be an object' };
  }

  if (payload.name !== undefined && payload.name !== null && !isNonEmptyString(payload.name)) {
    return { ok: false, message: 'name cannot be empty' };
  }

  if (!isOptionalNullableString(payload.specification)) {
    return { ok: false, message: 'specification must be string or null' };
  }

  if (payload.baseUnit !== undefined && payload.baseUnit !== null && !isNonEmptyString(payload.baseUnit)) {
    return { ok: false, message: 'baseUnit cannot be empty' };
  }

  if (!isOptionalNullableString(payload.category)) {
    return { ok: false, message: 'category must be string or null' };
  }
  if (!isOptionalNullableString(payload.itemType)) {
    return { ok: false, message: 'itemType must be string or null' };
  }
  if (!isOptionalNullableString(payload.taxCodeId)) {
    return { ok: false, message: 'taxCodeId must be string or null' };
  }
  if (!isOptionalNullableString(payload.taxRate)) {
    return { ok: false, message: 'taxRate must be string or null' };
  }

  if (!isOptionalNullableString(payload.barcode)) {
    return { ok: false, message: 'barcode must be string or null' };
  }

  if (!isOptionalNullableBoolean(payload.batchManaged)) {
    return { ok: false, message: 'batchManaged must be boolean or null' };
  }

  if (!isOptionalNullableBoolean(payload.serialManaged)) {
    return { ok: false, message: 'serialManaged must be boolean or null' };
  }

  if (!isOptionalNullableString(payload.minStockQty)) {
    return { ok: false, message: 'minStockQty must be string or null' };
  }

  if (!isOptionalNullableString(payload.maxStockQty)) {
    return { ok: false, message: 'maxStockQty must be string or null' };
  }

  if (!isOptionalNullableInteger(payload.leadTimeDays)) {
    return { ok: false, message: 'leadTimeDays must be integer or null' };
  }
  if (!isOptionalNullableInteger(payload.shelfLifeDays)) {
    return { ok: false, message: 'shelfLifeDays must be integer or null' };
  }

  if (
    payload.status !== undefined &&
    payload.status !== 'normal' &&
    payload.status !== 'warning' &&
    payload.status !== 'disabled'
  ) {
    return { ok: false, message: 'status must be normal, warning or disabled' };
  }

  return {
    ok: true,
    data: {
      name:
        payload.name === undefined || payload.name === null
          ? undefined
          : payload.name.trim(),
      specification: normalizeOptionalNullableString(payload.specification),
      baseUnit:
        payload.baseUnit === undefined || payload.baseUnit === null
          ? undefined
          : payload.baseUnit.trim(),
      categoryId: normalizeCategoryId(payload.category),
      itemType: normalizeOptionalNullableString(payload.itemType),
      taxCodeId: normalizeOptionalNullableString(payload.taxCodeId),
      taxRate: normalizeOptionalNullableString(payload.taxRate),
      barcode: normalizeOptionalNullableString(payload.barcode),
      batchManaged:
        payload.batchManaged === undefined || payload.batchManaged === null
          ? undefined
          : payload.batchManaged,
      serialManaged:
        payload.serialManaged === undefined || payload.serialManaged === null
          ? undefined
          : payload.serialManaged,
      minStockQty: normalizeOptionalNullableString(payload.minStockQty),
      maxStockQty: normalizeOptionalNullableString(payload.maxStockQty),
      shelfLifeDays:
        payload.shelfLifeDays === undefined || payload.shelfLifeDays === null
          ? undefined
          : payload.shelfLifeDays,
      leadTimeDays:
        payload.leadTimeDays === undefined || payload.leadTimeDays === null
          ? undefined
          : payload.leadTimeDays,
      isActive:
        payload.status === undefined
          ? undefined
          : payload.status === 'disabled'
            ? false
            : true,
    },
  };
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

  const parsed = parseUpdateSkuPayload(payload);
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
    const response = await fetch(buildBackendUrl(`/skus/${id}`), {
      method: 'PUT',
      headers: {
        ...createServerHeaders(),
        'idempotency-key': idempotencyKey,
      },
      body: JSON.stringify(parsed.data),
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

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const response = await fetch(buildBackendUrl(`/skus/${id}`), {
      method: 'DELETE',
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

    return toUpstreamErrorResponse(response);
  } catch {
    return toUpstreamUnavailableResponse('Backend SKU delete is unavailable');
  }
}
