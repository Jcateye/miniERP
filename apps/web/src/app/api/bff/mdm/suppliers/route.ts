import { NextRequest } from 'next/server';

import type { Supplier } from '@minierp/shared';

import { createMockListResponse, compareListValues, normalizeSortDirection, parsePositiveIntParam } from '@/lib/bff/mock-list';
import {
  isFixtureFallbackEnabled,
  toFixtureFallbackDisabledResponse,
  toUpstreamErrorResponse,
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
