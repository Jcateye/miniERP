import { NextRequest } from 'next/server';

import type { Customer } from '@minierp/shared';

import { createMockListResponse, compareListValues, normalizeSortDirection, parsePositiveIntParam } from '@/lib/bff/mock-list';
import {
  isFixtureFallbackEnabled,
  toFixtureFallbackDisabledResponse,
  toUpstreamErrorResponse,
} from '@/lib/bff/server-fixtures';
import { customerListFixtures } from '@/lib/mocks/erp-list-fixtures';
import {
  fetchBackendArray,
  toListRouteResponse,
} from '../../_shared/list-route-utils';

interface BackendCustomerDto {
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

const SORT_FIELDS = {
  contact: (item: Customer) => item.contactName ?? '',
  credit: (item: Customer) => Number(item.creditLimit ?? '0'),
  id: (item: Customer) => item.code,
  name: (item: Customer) => item.name,
  status: (item: Customer) => item.status,
} as const;

function mapBackendCustomer(item: BackendCustomerDto): Customer {
  return {
    id: item.id,
    tenantId: item.tenantId,
    code: item.code,
    name: item.name,
    contactName: item.contactPerson,
    phone: item.contactPhone,
    email: item.email,
    address: item.address,
    creditLimit: null,
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
  const sortBy = (searchParams.get('sortBy') || 'id') as keyof typeof SORT_FIELDS;
  const sortOrder = normalizeSortDirection(searchParams.get('sortOrder'));
  let source: readonly Customer[] = customerListFixtures;
  let fallbackReason: string | undefined;

  const upstream = await fetchBackendArray<BackendCustomerDto>('/customers');
  if (upstream.ok) {
    source = upstream.data.map(mapBackendCustomer);
  } else if (upstream.response) {
    if (upstream.response.status >= 400 && upstream.response.status < 500) {
      return toUpstreamErrorResponse(upstream.response);
    }

    if (!isFixtureFallbackEnabled()) {
      return toFixtureFallbackDisabledResponse(
        'Backend customer list is unavailable in current environment',
        upstream.response.status,
      );
    }

    fallbackReason = 'fixture_response';
  } else if (!isFixtureFallbackEnabled()) {
    return toFixtureFallbackDisabledResponse(
      'Backend customer list is unavailable in current environment',
    );
  } else {
    fallbackReason = 'fixture_response';
  }

  const filtered = source
    .filter((item) => {
      if (!q) {
        return true;
      }

      return [item.code, item.name, item.contactName ?? '', item.phone ?? '']
        .some((value) => value.toLowerCase().includes(q));
    })
    .toSorted((left, right) => {
      const getter = SORT_FIELDS[sortBy] ?? SORT_FIELDS.id;
      return compareListValues(getter(left), getter(right), sortOrder);
    });

  const payload = createMockListResponse(
    filtered,
    page,
    pageSize,
    fallbackReason ? 'fixture' : 'OK',
  );

  return toListRouteResponse(payload, fallbackReason);
}
