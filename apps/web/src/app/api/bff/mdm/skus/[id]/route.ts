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
