import { NextResponse } from 'next/server';

import {
  buildBackendUrl,
  createServerHeaders,
  toUpstreamErrorResponse,
  toUpstreamUnavailableResponse,
} from '@/lib/bff/server-fixtures';

const ALLOWED_PATCH_FIELDS = ['name', 'address', 'contactPerson', 'contactPhone', 'isActive'] as const;

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
      isActive: candidate.isActive as boolean | undefined,
    },
  };
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
      return NextResponse.json(await response.json());
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
