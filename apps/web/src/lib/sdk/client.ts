import type { ApiResponse } from '@minierp/shared';

import type { RequestOptions, SdkClient } from './types';

interface MockMap {
  [path: string]: unknown;
}

export class MockSdkClient implements SdkClient {
  constructor(private readonly mockMap: MockMap = {}) {}

  async request<T>(path: string, _options?: RequestOptions): Promise<ApiResponse<T>> {
    const data = (this.mockMap[path] as T | undefined) ?? ({} as T);

    return {
      data,
      message: 'ok',
    };
  }
}

export const sdkClient: SdkClient = new MockSdkClient();
