import { NextResponse } from 'next/server';

import {
  buildBackendUrl,
  createServerHeaders,
  toUpstreamErrorResponse,
  toUpstreamUnavailableResponse,
} from '@/lib/bff/server-fixtures';

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

function parseUpdateCustomerPayload(
  payload: unknown,
):
  | {
      readonly ok: true;
      readonly data: {
        readonly address?: string | null;
        readonly contactPerson?: string | null;
        readonly contactPhone?: string | null;
        readonly email?: string | null;
        readonly name?: string;
      };
    }
  | { readonly ok: false; readonly message: string } {
  if (!isRecord(payload)) {
    return { ok: false, message: 'Request body must be an object' };
  }

  if (payload.name !== undefined && payload.name !== null && !isNonEmptyString(payload.name)) {
    return { ok: false, message: 'name cannot be empty' };
  }

  if (!isOptionalNullableString(payload.contact)) {
    return { ok: false, message: 'contact must be string or null' };
  }

  if (!isOptionalNullableString(payload.phone)) {
    return { ok: false, message: 'phone must be string or null' };
  }

  if (!isOptionalNullableString(payload.email)) {
    return { ok: false, message: 'email must be string or null' };
  }

  const normalizedEmail = normalizeOptionalNullableString(payload.email);
  if (normalizedEmail !== undefined && normalizedEmail !== null && !isValidEmail(normalizedEmail)) {
    return { ok: false, message: 'email must be a valid email address' };
  }

  if (!isOptionalNullableString(payload.address)) {
    return { ok: false, message: 'address must be string or null' };
  }

  return {
    ok: true,
    data: {
      address: normalizeOptionalNullableString(payload.address),
      contactPerson: normalizeOptionalNullableString(payload.contact),
      contactPhone: normalizeOptionalNullableString(payload.phone),
      email: normalizedEmail,
      name:
        typeof payload.name === 'string'
          ? payload.name.trim()
          : undefined,
    },
  };
}

export async function PUT(
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

  const parsed = parseUpdateCustomerPayload(payload);
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
    const response = await fetch(buildBackendUrl(`/customers/${id}`), {
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
    return toUpstreamUnavailableResponse('Backend customers update is unavailable');
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const response = await fetch(buildBackendUrl(`/customers/${id}`), {
      method: 'DELETE',
      headers: createServerHeaders(),
      cache: 'no-store',
    });

    if (response.ok) {
      return NextResponse.json(await response.json());
    }

    return toUpstreamErrorResponse(response);
  } catch {
    return toUpstreamUnavailableResponse('Backend customers delete is unavailable');
  }
}
