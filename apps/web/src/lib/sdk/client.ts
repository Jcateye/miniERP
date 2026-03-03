import type { ApiResponse } from '@minierp/shared';

import type {
  PaginationEnvelope,
  QueryValue,
  RequestOptions,
  SdkClient,
  SdkRequestDescriptor,
} from './types';

interface MockMap {
  [path: string]: unknown;
}

function normalizeQueryValue(value: QueryValue | QueryValue[]): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string | number | boolean => item !== null && item !== undefined)
      .map((item) => String(item));
  }

  if (value === null || value === undefined) {
    return [];
  }

  return [String(value)];
}

function buildRequestPath(
  descriptor: string | SdkRequestDescriptor,
  options?: RequestOptions,
): string {
  if (typeof descriptor === 'string') {
    return descriptor;
  }

  const searchParams = new URLSearchParams();
  const query = {
    ...descriptor.query,
    ...options?.query,
  };

  Object.entries(query).forEach(([key, value]) => {
    normalizeQueryValue(value).forEach((entry) => {
      searchParams.append(key, entry);
    });
  });

  const queryString = searchParams.toString();
  return queryString ? `${descriptor.path}?${queryString}` : descriptor.path;
}

function resolveMethod(
  descriptor: string | SdkRequestDescriptor,
  options?: RequestOptions,
) {
  if (typeof descriptor === 'string') {
    return options?.method ?? 'GET';
  }

  return options?.method ?? descriptor.method ?? 'GET';
}

function toEnvelope<T>(value: T): ApiResponse<T> {
  return {
    data: value,
    message: 'ok',
  };
}

export class MockSdkClient implements SdkClient {
  constructor(private readonly mockMap: MockMap = {}) {}

  seed(entries: MockMap) {
    Object.assign(this.mockMap, entries);
  }

  async request<T>(
    descriptor: string | SdkRequestDescriptor,
    options?: RequestOptions,
  ): Promise<ApiResponse<T>> {
    const requestPath = buildRequestPath(descriptor, options);
    const method = resolveMethod(descriptor, options);
    const mockKey = typeof descriptor === 'string' ? undefined : descriptor.mockKey;
    const lookupKeys = [mockKey, `${method} ${requestPath}`, requestPath].filter(
      (item): item is string => Boolean(item),
    );
    const seeded = lookupKeys.find((key) => key in this.mockMap);

    if (seeded) {
      return toEnvelope(this.mockMap[seeded] as T);
    }

    return toEnvelope({} as T);
  }

  async requestPage<T>(
    descriptor: string | SdkRequestDescriptor,
    options?: RequestOptions,
  ): Promise<PaginationEnvelope<T>> {
    const response = await this.request<PaginationEnvelope<T>>(descriptor, options);

    return response.data ?? {
      data: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0,
    };
  }
}

export const sdkClient: SdkClient = new MockSdkClient();
