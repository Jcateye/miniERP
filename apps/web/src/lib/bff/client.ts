import { sdkClient } from '@/lib/sdk';

export async function bffGet<T>(path: string): Promise<T> {
  const response = await sdkClient.request<T>(path, { method: 'GET' });
  return response.data;
}

export async function bffPost<TInput extends object, TOutput>(
  path: string,
  body: TInput,
): Promise<TOutput> {
  const response = await sdkClient.request<TOutput>(path, {
    method: 'POST',
    body,
  });

  return response.data;
}
