import { NextResponse } from 'next/server';

import {
  toUpstreamErrorResponse,
  toUpstreamUnavailableResponse,
} from '@/lib/bff/server-fixtures';
import { fetchMasterdataEntityResult } from '../../_shared/masterdata-detail-resolvers';
import {
  buildBackendUrl,
  createServerHeaders,
} from '@/lib/bff/server-fixtures';

const ALLOWED_PATCH_FIELDS = [
  'name',
  'contactPerson',
  'contactPhone',
  'email',
  'address',
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

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function parseUpdateSupplierPayload(
  payload: unknown,
):
  | {
      readonly ok: true;
      readonly data: {
        readonly name?: string;
        readonly contactPerson?: string | null;
        readonly contactPhone?: string | null;
        readonly email?: string | null;
        readonly address?: string | null;
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

  if (!isOptionalNullableString(candidate.contactPerson)) {
    return { ok: false, message: 'contactPerson must be string or null' };
  }

  if (!isOptionalNullableString(candidate.contactPhone)) {
    return { ok: false, message: 'contactPhone must be string or null' };
  }

  if (!isOptionalNullableString(candidate.email)) {
    return { ok: false, message: 'email must be string or null' };
  }

  const normalizedEmail = normalizeOptionalNullableString(candidate.email);
  if (normalizedEmail !== undefined && normalizedEmail !== null && !isValidEmail(normalizedEmail)) {
    return { ok: false, message: 'email must be a valid email address' };
  }

  if (!isOptionalNullableString(candidate.address)) {
    return { ok: false, message: 'address must be string or null' };
  }

  if (candidate.isActive !== undefined && typeof candidate.isActive !== 'boolean') {
    return { ok: false, message: 'isActive must be boolean' };
  }

  return {
    ok: true,
    data: {
      name: candidate.name === undefined ? undefined : candidate.name.trim(),
      contactPerson: normalizeOptionalNullableString(candidate.contactPerson),
      contactPhone: normalizeOptionalNullableString(candidate.contactPhone),
      email: normalizedEmail,
      address: normalizeOptionalNullableString(candidate.address),
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

  const parsed = parseUpdateSupplierPayload(payload);
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
    const response = await fetch(buildBackendUrl(`/suppliers/${id}`), {
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
    return toUpstreamUnavailableResponse('Backend suppliers update is unavailable');
  }
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const result = await fetchMasterdataEntityResult('suppliers', id);

  if (result.kind === 'ok') {
    return NextResponse.json(result.data);
  }

  if (result.kind === 'unavailable') {
    return toUpstreamUnavailableResponse('Backend suppliers detail is unavailable');
  }

  return NextResponse.json(
    {
      error: {
        code: 'RESOURCE_NOT_FOUND',
        category: 'not_found',
        message: 'Supplier detail was not found',
      },
    },
    { status: 404 },
  );
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const response = await fetch(buildBackendUrl(`/suppliers/${id}`), {
      method: 'DELETE',
      headers: createServerHeaders(),
      cache: 'no-store',
    });

    if (response.ok) {
      return NextResponse.json(await response.json());
    }

    return toUpstreamErrorResponse(response);
  } catch {
    return toUpstreamUnavailableResponse('Backend suppliers delete is unavailable');
  }
}
