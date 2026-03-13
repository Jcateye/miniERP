import { NextRequest } from 'next/server';

import { fetchBackendArray, toListRouteResponse } from '../_shared/list-route-utils';
import { toFixtureFallbackDisabledResponse, toUpstreamErrorResponse } from '@/lib/bff/server-fixtures';
import { uomListFixtures } from '@/lib/mocks/erp-list-fixtures';

type UomLookupDto = {
  id: string;
  code?: string | null;
  name?: string | null;
  uomCode?: string | null;
  uomName?: string | null;
  status?: string | null;
};

function mapBackendUom(entity: UomLookupDto) {
  const code = entity.code ?? entity.uomCode ?? null;
  const name = entity.name ?? entity.uomName ?? null;

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
  const backend = await fetchBackendArray<UomLookupDto>(`/uoms?${searchParams.toString()}`);

  if (backend.ok) {
    return toListRouteResponse({
      data: backend.data.map(mapBackendUom).filter((entity) => entity !== null),
    });
  }

  if (backend.response) {
    if (backend.response.status === 404) {
      return toListRouteResponse(
        {
          data: uomListFixtures,
        },
        'fixture_uoms_list',
      );
    }

    if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
      return toUpstreamErrorResponse(backend.response);
    }
  }

  if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
    return toFixtureFallbackDisabledResponse('Backend uoms list is unavailable');
  }

  return toListRouteResponse(
    {
      data: uomListFixtures,
    },
    'fixture_uoms_list',
  );
}
