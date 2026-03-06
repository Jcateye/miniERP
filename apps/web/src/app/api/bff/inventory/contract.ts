import { NextResponse } from 'next/server';
import type {
  ApiResponse,
  InventoryBalancePage,
  InventoryBalanceSnapshot,
  InventoryLedgerEntry,
  InventoryLedgerPage,
} from '@minierp/shared';

const POSITIVE_INTEGER_PATTERN = /^[1-9]\d*$/;

export interface PaginationParams {
  readonly page: number;
  readonly pageSize: number;
}

export function parsePaginationParams(
  searchParams: URLSearchParams,
): PaginationParams | NextResponse {
  const pageRaw = searchParams.get('page');
  const pageSizeRaw = searchParams.get('pageSize');

  const page = pageRaw ?? '1';
  const pageSize = pageSizeRaw ?? '20';

  if (!POSITIVE_INTEGER_PATTERN.test(page)) {
    return validationError(
      'VALIDATION_INVALID_PAGE',
      'page must be a positive integer',
    );
  }

  if (!POSITIVE_INTEGER_PATTERN.test(pageSize)) {
    return validationError(
      'VALIDATION_INVALID_PAGE_SIZE',
      'pageSize must be a positive integer',
    );
  }

  const parsedPage = Number(page);
  const parsedPageSize = Number(pageSize);

  if (parsedPageSize > 200) {
    return validationError(
      'VALIDATION_INVALID_PAGE_SIZE',
      'pageSize must be <= 200',
    );
  }

  return {
    page: parsedPage,
    pageSize: parsedPageSize,
  };
}

export function unwrapApiResponse<T>(payload: unknown): T {
  const candidate = payload as ApiResponse<T>;

  if (
    typeof payload === 'object' &&
    payload !== null &&
    'data' in candidate &&
    'message' in candidate
  ) {
    return candidate.data;
  }

  return payload as T;
}

export function normalizeBalancesPayload(payload: unknown): {
  readonly data: InventoryBalanceSnapshot[];
  readonly total: number;
} {
  const value = unwrapApiResponse<unknown>(payload);
  const candidate = value as Partial<InventoryBalancePage> & {
    data?: unknown;
  };

  if (!Array.isArray(candidate.data)) {
    return {
      data: [],
      total: 0,
    };
  }

  return {
    data: candidate.data as InventoryBalanceSnapshot[],
    total:
      typeof candidate.total === 'number'
        ? candidate.total
        : candidate.data.length,
  };
}

export function normalizeLedgerPayload(payload: unknown): InventoryLedgerPage {
  const value = unwrapApiResponse<unknown>(payload);
  const candidate = value as Partial<InventoryLedgerPage> & {
    data?: unknown;
  };

  if (!Array.isArray(candidate.data)) {
    return {
      data: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0,
    };
  }

  return {
    data: candidate.data as InventoryLedgerEntry[],
    total:
      typeof candidate.total === 'number'
        ? candidate.total
        : candidate.data.length,
    page: typeof candidate.page === 'number' ? candidate.page : 1,
    pageSize: typeof candidate.pageSize === 'number' ? candidate.pageSize : 20,
    totalPages:
      typeof candidate.totalPages === 'number'
        ? candidate.totalPages
        : candidate.data.length > 0
          ? 1
          : 0,
  };
}

export function toPaginatedBalances(
  rows: readonly InventoryBalanceSnapshot[],
  pagination: PaginationParams,
): InventoryBalancePage {
  const start = (pagination.page - 1) * pagination.pageSize;
  const data = rows.slice(start, start + pagination.pageSize);
  const total = rows.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / pagination.pageSize);

  return {
    data,
    total,
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalPages,
  };
}

export function successResponse<T>(data: T) {
  return NextResponse.json({
    message: 'OK',
    data,
  });
}

function validationError(code: string, message: string) {
  return NextResponse.json(
    {
      error: {
        code,
        category: 'validation',
        message,
      },
    },
    { status: 400 },
  );
}
