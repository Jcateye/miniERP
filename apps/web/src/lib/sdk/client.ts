import type { ApiError, ApiResponse } from '@minierp/shared';

import type {
  PaginationEnvelope,
  QueryValue,
  RequestOptions,
  SdkClient,
  SdkRequestDescriptor,
} from './types';

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

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BFF_BASE_URL?.trim() || '/api/bff';
}

function isPaginationEnvelope<T>(value: unknown): value is PaginationEnvelope<T> {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<PaginationEnvelope<T>>;

  return (
    Array.isArray(candidate.data) &&
    typeof candidate.total === 'number' &&
    typeof candidate.page === 'number' &&
    typeof candidate.pageSize === 'number' &&
    typeof candidate.totalPages === 'number'
  );
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T | ApiResponse<T> | ApiError;

  if (!response.ok) {
    if ('error' in (payload as ApiError)) {
      throw new Error((payload as ApiError).error.message);
    }

    throw new Error(`Request failed with status ${response.status}`);
  }

  if ('data' in (payload as ApiResponse<T>) && 'message' in (payload as ApiResponse<T>)) {
    return (payload as ApiResponse<T>).data;
  }

  return payload as T;
}

class HttpSdkClient implements SdkClient {
  async request<T>(
    descriptor: string | SdkRequestDescriptor,
    options?: RequestOptions,
  ): Promise<ApiResponse<T>> {
    const method = resolveMethod(descriptor, options);
    const path = buildRequestPath(descriptor, options);
    const baseUrl = getBaseUrl();
    const requestUrl = path.startsWith('http') ? path : `${baseUrl}${path}`;
    const body =
      options?.body ??
      (typeof descriptor === 'string' ? undefined : descriptor.body);

    const data = await parseResponse<T>(
      await fetch(requestUrl, {
        method,
        body: body ? JSON.stringify(body) : undefined,
        headers: {
          'content-type': 'application/json',
          ...(options?.idempotencyKey ? { 'Idempotency-Key': options.idempotencyKey } : {}),
          ...options?.headers,
          ...(typeof descriptor === 'string' ? {} : descriptor.headers),
        },
        signal: options?.signal,
        cache: 'no-store',
      }),
    );

    return {
      data,
      message: 'ok',
    };
  }

  async requestPage<T>(
    descriptor: string | SdkRequestDescriptor,
    options?: RequestOptions,
  ): Promise<PaginationEnvelope<T>> {
    const method = resolveMethod(descriptor, options);
    const path = buildRequestPath(descriptor, options);
    const baseUrl = getBaseUrl();
    const requestUrl = path.startsWith('http') ? path : `${baseUrl}${path}`;

    const payload = await parseResponse<PaginationEnvelope<T> | ApiResponse<PaginationEnvelope<T>>>(
      await fetch(requestUrl, {
        method,
        headers: {
          'content-type': 'application/json',
          ...options?.headers,
          ...(typeof descriptor === 'string' ? {} : descriptor.headers),
        },
        signal: options?.signal,
        cache: 'no-store',
      }),
    );

    if (isPaginationEnvelope<T>(payload)) {
      return payload;
    }

    return {
      data: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0,
    };
  }
}

export const sdkClient: SdkClient = new HttpSdkClient();
