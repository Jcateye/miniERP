'use client';

import { bffGet } from '@/lib/bff';

import { useBffQuery, type UseBffQueryState } from './use-bff-query';

export function useBffGet<T>(path: string, enabled = true): UseBffQueryState<T> {
  return useBffQuery(['bff-get', path], () => bffGet<T>(path), { enabled });
}
