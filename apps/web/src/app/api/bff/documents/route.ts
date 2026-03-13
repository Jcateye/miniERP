import { NextRequest, NextResponse } from 'next/server';
import { CORE_DOCUMENT_TYPES, type DocumentType } from '@minierp/shared';

import {
  buildBackendUrl,
  createServerHeaders,
  toUpstreamErrorResponse,
  toUpstreamUnavailableResponse,
} from '@/lib/bff/server-fixtures';

function isValidDocumentType(value: string): value is DocumentType {
  return (CORE_DOCUMENT_TYPES as readonly string[]).includes(value);
}

function isPositiveInteger(value: string): boolean {
  return /^\d+$/.test(value) && Number(value) > 0;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function toStringValue(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'bigint') {
    return String(value);
  }

  return '';
}

function normalizeCreatePayload(payload: unknown) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Request body must be an object');
  }

  const candidate = payload as Record<string, unknown>;
  const docType = toStringValue(candidate.docType).trim().toUpperCase();

  if (!isValidDocumentType(docType)) {
    throw new Error('docType must be one of PO, GRN, SO, OUT, ADJ');
  }

  if (!Array.isArray(candidate.lines) || candidate.lines.length === 0) {
    throw new Error('lines must be a non-empty array');
  }

  return {
    docType,
    docDate: isNonEmptyString(candidate.docDate)
      ? candidate.docDate.trim()
      : undefined,
    remarks: isNonEmptyString(candidate.remarks)
      ? candidate.remarks.trim()
      : undefined,
    supplierId: isNonEmptyString(candidate.supplierId)
      ? candidate.supplierId.trim()
      : undefined,
    customerId: isNonEmptyString(candidate.customerId)
      ? candidate.customerId.trim()
      : undefined,
    warehouseId: isNonEmptyString(candidate.warehouseId)
      ? candidate.warehouseId.trim()
      : undefined,
    sourceDocId: isNonEmptyString(candidate.sourceDocId)
      ? candidate.sourceDocId.trim()
      : undefined,
    lines: candidate.lines.map((line, index) => {
      if (!line || typeof line !== 'object') {
        throw new Error(`lines[${index}] must be an object`);
      }

      const row = line as Record<string, unknown>;
      const skuId = toStringValue(row.skuId ?? row.sku ?? row.code).trim();
      const qty = toStringValue(
        row.qty ?? row.quantity ?? row.expected ?? row.actual ?? row.diff,
      ).trim();
      const unitPrice = toStringValue(row.unitPrice ?? row.price).trim();
      const rawBin = row.binId ?? row.bin ?? row.binCode;
      const binId = toStringValue(rawBin).trim();

      if (!skuId) {
        throw new Error(`lines[${index}].skuId is required`);
      }

      if (!qty) {
        throw new Error(`lines[${index}].qty is required`);
      }

      if (rawBin !== undefined && rawBin !== null && !binId) {
        throw new Error(
          `lines[${index}].binId must be a non-empty string when provided`,
        );
      }

      return {
        skuId,
        qty,
        unitPrice: unitPrice || undefined,
        binId: binId || undefined,
      };
    }),
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const upstreamParams = new URLSearchParams(searchParams);
  const docType = searchParams.get('docType');
  const page = searchParams.get('page');
  const pageSize = searchParams.get('pageSize');

  if (docType && !isValidDocumentType(docType.toUpperCase())) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_INVALID_DOC_TYPE',
          category: 'validation',
          message: 'docType must be one of PO, GRN, SO, OUT, ADJ',
        },
      },
      { status: 400 },
    );
  }

  if (docType) {
    upstreamParams.set('docType', docType.toUpperCase());
  }

  if (page && !isPositiveInteger(page)) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_INVALID_PAGE',
          category: 'validation',
          message: 'page must be a positive integer',
        },
      },
      { status: 400 },
    );
  }

  if (pageSize && !isPositiveInteger(pageSize)) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_INVALID_PAGE_SIZE',
          category: 'validation',
          message: 'pageSize must be a positive integer',
        },
      },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(buildBackendUrl(`/documents?${upstreamParams.toString()}`), {
      headers: createServerHeaders(),
      cache: 'no-store',
    });

    if (response.ok) {
      return NextResponse.json(await response.json());
    }

    return toUpstreamErrorResponse(response);
  } catch {
    return toUpstreamUnavailableResponse('Backend documents list is unavailable');
  }
}

export async function POST(request: NextRequest) {
  const idempotencyKey = request.headers.get('Idempotency-Key');

  if (!idempotencyKey || idempotencyKey.trim() === '') {
    return NextResponse.json(
      {
        error: {
          code: 'BFF_IDEMPOTENCY_KEY_REQUIRED',
          category: 'validation',
          message: 'Idempotency-Key header is required for document create',
        },
      },
      { status: 400 },
    );
  }

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

  let normalizedPayload: ReturnType<typeof normalizeCreatePayload>;
  try {
    normalizedPayload = normalizeCreatePayload(payload);
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_INVALID_PAYLOAD',
          category: 'validation',
          message: error instanceof Error ? error.message : 'Invalid payload',
        },
      },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(buildBackendUrl('/documents'), {
      method: 'POST',
      headers: {
        ...createServerHeaders(),
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(normalizedPayload),
      cache: 'no-store',
    });

    if (response.ok) {
      return NextResponse.json(await response.json());
    }

    return toUpstreamErrorResponse(response);
  } catch {
    return toUpstreamUnavailableResponse('Backend document create is unavailable');
  }
}
