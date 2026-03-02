import type { ApiResponse } from '@minierp/shared';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export interface SdkClient {
  request<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>>;
}
