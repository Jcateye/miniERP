import { NextRequest, NextResponse } from 'next/server';

import type { Supplier } from '@minierp/shared';

import { createMockListResponse, compareListValues, normalizeSortDirection, parsePositiveIntParam } from '@/lib/bff/mock-list';
import {
  buildBackendUrl,
  createServerHeaders,
  isFixtureFallbackEnabled,
  toFixtureFallbackDisabledResponse,
  toUpstreamErrorResponse,
  toUpstreamUnavailableResponse,
} from '@/lib/bff/server-fixtures';
import { supplierListFixtures, supplierViewMetaByCode } from '@/lib/mocks/erp-list-fixtures';
import {
  fetchBackendArray,
  toListRouteResponse,
} from '../../_shared/list-route-utils';

interface BackendSupplierDto {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  contactPerson: string | null;
  contactPhone: string | null;
  email: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

function mapBackendSupplier(item: BackendSupplierDto): Supplier {
  return {
    id: item.id,
    tenantId: item.tenantId,
    code: item.code,
    name: item.name,
    contactName: item.contactPerson,
    phone: item.contactPhone,
    email: item.email,
    address: item.address,
    status: item.isActive ? 'normal' : 'disabled',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

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

function parseCreateSupplierPayload(
  payload: unknown,
):
  | {
      readonly ok: true;
      readonly data: {
        readonly address?: string | null;
        readonly code: string;
        readonly contactPerson?: string | null;
        readonly contactPhone?: string | null;
        readonly email?: string | null;
        readonly name: string;
      };
    }
  | { readonly ok: false; readonly message: string } {
  if (!isRecord(payload)) {
    return { ok: false, message: 'Request body must be an object' };
  }

  if (!isNonEmptyString(payload.code)) {
    return { ok: false, message: 'code is required' };
  }

  if (!isNonEmptyString(payload.name)) {
    return { ok: false, message: 'name is required' };
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
      code: payload.code.trim(),
      contactPerson: normalizeOptionalNullableString(payload.contact),
      contactPhone: normalizeOptionalNullableString(payload.phone),
      email: normalizedEmail,
      name: payload.name.trim(),
    },
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parsePositiveIntParam(searchParams.get('page'), 1);
  const pageSize = parsePositiveIntParam(searchParams.get('pageSize'), 4);
  const q = (searchParams.get('q') || searchParams.get('search') || '').trim().toLowerCase();
  const sortBy = (searchParams.get('sortBy') || 'id') as SortField;
  const sortOrder = normalizeSortDirection(searchParams.get('sortOrder'));
  let source: readonly Supplier[] = supplierListFixtures;
  let fallbackReason: string | undefined;

  const upstream = await fetchBackendArray<BackendSupplierDto>('/suppliers');
  if (upstream.ok) {
    source = upstream.data.map(mapBackendSupplier);
  } else if (upstream.response) {
    if (upstream.response.status >= 400 && upstream.response.status < 500) {
      return toUpstreamErrorResponse(upstream.response);
    }

    if (!isFixtureFallbackEnabled()) {
      return toFixtureFallbackDisabledResponse(
        'Backend supplier list is unavailable in current environment',
        upstream.response.status,
      );
    }

    fallbackReason = 'fixture_response';
  } else if (!isFixtureFallbackEnabled()) {
    return toFixtureFallbackDisabledResponse(
      'Backend supplier list is unavailable in current environment',
    );
  } else {
    fallbackReason = 'fixture_response';
  }

  const filtered = source
    .filter((item) => {
      if (!q) {
        return true;
      }

      const meta = supplierViewMetaByCode[item.code];
      return [item.code, item.name, item.contactName ?? '', meta?.cert ?? '']
        .some((value) => value.toLowerCase().includes(q));
    })
    .toSorted((left, right) => {
      return compareListValues(
        getSortValue(left, sortBy),
        getSortValue(right, sortBy),
        sortOrder,
      );
    });

  const payload = createMockListResponse(
    filtered,
    page,
    pageSize,
    fallbackReason ? 'fixture' : 'OK',
  );

  return toListRouteResponse(payload, fallbackReason);
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

  const parsed = parseCreateSupplierPayload(payload);
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
    const response = await fetch(buildBackendUrl('/suppliers'), {
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
    return toUpstreamUnavailableResponse('Backend suppliers create is unavailable');
  }
}

type SortField = 'contact' | 'id' | 'name' | 'orders' | 'status';

function getSortValue(item: Supplier, sortBy: SortField) {
  const meta = supplierViewMetaByCode[item.code];

  switch (sortBy) {
    case 'contact':
      return item.contactName ?? '';
    case 'name':
      return item.name;
    case 'orders':
      return meta?.orders ?? 0;
    case 'status':
      return item.status;
    default:
      return item.code;
  }
}
