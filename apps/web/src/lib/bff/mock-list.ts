import type {
  ApiResponse,
  PaginatedResponse,
  SortDirection,
} from '@minierp/shared';

export function parsePositiveIntParam(
  value: string | null,
  fallback: number,
) {
  const parsed = Number.parseInt(value ?? '', 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

export function normalizeSortDirection(
  value: string | null,
  fallback: SortDirection = 'asc',
): SortDirection {
  return value === 'desc' ? 'desc' : fallback;
}

export function compareListValues(
  left: string | number | boolean | null | undefined,
  right: string | number | boolean | null | undefined,
  order: SortDirection,
) {
  const direction = order === 'asc' ? 1 : -1;

  if (typeof left === 'number' && typeof right === 'number') {
    return (left - right) * direction;
  }

  if (typeof left === 'boolean' && typeof right === 'boolean') {
    return (Number(left) - Number(right)) * direction;
  }

  return String(left ?? '').localeCompare(String(right ?? ''), 'zh-CN') * direction;
}

export function paginateItems<T>(
  items: readonly T[],
  page: number,
  pageSize: number,
): PaginatedResponse<T> {
  const total = items.length;
  const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    data: items.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

export function createMockListResponse<T>(
  items: readonly T[],
  page: number,
  pageSize: number,
  message = 'mock',
): ApiResponse<PaginatedResponse<T>> {
  return {
    data: paginateItems(items, page, pageSize),
    message,
  };
}
