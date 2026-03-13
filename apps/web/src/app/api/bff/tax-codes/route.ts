import { NextRequest } from 'next/server';

import { fetchBackendArray, toListRouteResponse } from '../_shared/list-route-utils';
import { toFixtureFallbackDisabledResponse, toUpstreamErrorResponse } from '@/lib/bff/server-fixtures';
import { taxCodeListFixtures } from '@/lib/mocks/erp-list-fixtures';

type TaxCodeLookupDto = {
  id: string;
  code?: string | null;
  name?: string | null;
  taxCode?: string | null;
  taxName?: string | null;
  status?: string | null;
};

function mapBackendTaxCode(entity: TaxCodeLookupDto) {
  const code = entity.code ?? entity.taxCode ?? null;
  const name = entity.name ?? entity.taxName ?? null;

  if (!entity.id || !code || !name) {
    return null;
  }

  if (entity.status && entity.status !== 'active') {
    return null;
  }

  return {
    id: entity.id,
    code,
    name,
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const backend = await fetchBackendArray<TaxCodeLookupDto>(`/tax-codes?${searchParams.toString()}`);

  if (backend.ok) {
    return toListRouteResponse({
      data: backend.data.map(mapBackendTaxCode).filter((entity) => entity !== null),
    });
  }

  if (backend.response) {
    if (backend.response.status === 404) {
      return toListRouteResponse(
        {
          data: taxCodeListFixtures,
        },
        'fixture_tax_codes_list',
      );
    }

    if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
      return toUpstreamErrorResponse(backend.response);
    }
  }

  if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
    return toFixtureFallbackDisabledResponse('Backend tax codes list is unavailable');
  }

  return toListRouteResponse(
    {
      data: taxCodeListFixtures,
    },
    'fixture_tax_codes_list',
  );
}
