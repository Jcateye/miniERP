import { NextRequest, NextResponse } from 'next/server';

import type { CreateCustomerCommand } from '@minierp/shared';

import {
  buildBackendUrl,
  createServerHeaders,
  toUpstreamErrorResponse,
  toUpstreamUnavailableResponse,
} from '@/lib/bff/server-fixtures';

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

function parseCreateCustomerCommand(
  payload: unknown,
):
  | { readonly ok: true; readonly data: CreateCustomerCommand }
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

  if (!isOptionalNullableString(candidate.contactPerson)) {
    return { ok: false, message: 'contactPerson must be string or null' };
  }

  if (!isOptionalNullableString(candidate.contactPhone)) {
    return { ok: false, message: 'contactPhone must be string or null' };
  }

  if (!isOptionalNullableString(candidate.email)) {
    return { ok: false, message: 'email must be string or null' };
  }

  if (!isOptionalNullableString(candidate.address)) {
    return { ok: false, message: 'address must be string or null' };
  }

  return {
    ok: true,
    data: {
      code: candidate.code.trim(),
      name: candidate.name.trim(),
      contactPerson: normalizeOptionalNullableString(candidate.contactPerson),
      contactPhone: normalizeOptionalNullableString(candidate.contactPhone),
      email: normalizeOptionalNullableString(candidate.email),
      address: normalizeOptionalNullableString(candidate.address),
    },
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  try {
    const response = await fetch(buildBackendUrl(`/customers?${searchParams.toString()}`), {
      headers: createServerHeaders(),
      cache: 'no-store',
    });

    if (response.ok) {
      return NextResponse.json(await response.json());
    }

    return toUpstreamErrorResponse(response);
  } catch {
    return toUpstreamUnavailableResponse('Backend customers list is unavailable');
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

  const parsed = parseCreateCustomerCommand(payload);
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
    const response = await fetch(buildBackendUrl('/customers'), {
      method: 'POST',
      headers: createServerHeaders(),
      body: JSON.stringify(parsed.data),
      cache: 'no-store',
    });

    if (response.ok) {
      return NextResponse.json(await response.json());
    }

    return toUpstreamErrorResponse(response);
  } catch {
    return toUpstreamUnavailableResponse('Backend customers create is unavailable');
  }
}
