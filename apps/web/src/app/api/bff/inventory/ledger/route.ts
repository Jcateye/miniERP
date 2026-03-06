import { NextRequest, NextResponse } from 'next/server';
import { INVENTORY_REFERENCE_TYPES } from '@minierp/shared';

import {
  buildBackendUrl,
  createServerHeaders,
  toUpstreamErrorResponse,
  toUpstreamUnavailableResponse,
} from '@/lib/bff/server-fixtures';
import {
  normalizeLedgerPayload,
  parsePaginationParams,
  successResponse,
} from '../contract';

function isInventoryDocType(value: string): boolean {
  return (INVENTORY_REFERENCE_TYPES as readonly string[]).includes(value);
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const pagination = parsePaginationParams(searchParams);

  if (pagination instanceof NextResponse) {
    return pagination;
  }

  const upstreamParams = new URLSearchParams();
  const skuId = searchParams.get('skuId');
  const warehouseId = searchParams.get('warehouseId');
  const docType = searchParams.get('docType');

  if (skuId) {
    upstreamParams.set('skuId', skuId);
  }

  if (warehouseId) {
    upstreamParams.set('warehouseId', warehouseId);
  }

  if (docType) {
    const normalizedDocType = docType.toUpperCase();
    if (!isInventoryDocType(normalizedDocType)) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_INVALID_DOC_TYPE',
            category: 'validation',
            message: `docType must be one of ${INVENTORY_REFERENCE_TYPES.join(', ')}`,
          },
        },
        { status: 400 },
      );
    }
    upstreamParams.set('docType', normalizedDocType);
  }

  upstreamParams.set('page', String(pagination.page));
  upstreamParams.set('pageSize', String(pagination.pageSize));

  try {
    const response = await fetch(
      buildBackendUrl(`/inventory/ledger?${upstreamParams.toString()}`),
      {
        headers: createServerHeaders(),
        cache: 'no-store',
      },
    );

    if (response.ok) {
      const payload = normalizeLedgerPayload(await response.json());
      return successResponse({
        ...payload,
        page: pagination.page,
        pageSize: pagination.pageSize,
      });
    }

    return toUpstreamErrorResponse(response);
  } catch {
    return toUpstreamUnavailableResponse('Backend inventory ledger is unavailable');
  }
}
