'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';

import type {
  FilterParams,
  PaginatedResponse,
  PaginationParams,
  SortParams,
} from '@minierp/shared';

import { useBffGet } from '@/hooks/use-bff-get';

type QueryValue = string | number | boolean | null | undefined;

export type ListResourceQuery = PaginationParams & FilterParams & SortParams;

type ListResourceRequest = {
  base: ListResourceQuery;
  extras?: Record<string, QueryValue>;
};

type UseListResourceOptions = {
  buildRequest: (searchParams: ReturnType<typeof useSearchParams>) => ListResourceRequest;
  path: string;
};

export type UseListResourceResult<T> = {
  data: T[];
  error: Error | null;
  loading: boolean;
  pagination: PaginatedResponse<T>;
  reload: () => void;
  request: ListResourceRequest;
};

function appendQueryValue(
  searchParams: URLSearchParams,
  key: string,
  value: QueryValue,
) {
  if (value === null || value === undefined) {
    return;
  }

  const normalized = String(value).trim();
  if (!normalized) {
    return;
  }

  searchParams.set(key, normalized);
}

function buildRequestPath(path: string, request: ListResourceRequest) {
  const query = new URLSearchParams();

  appendQueryValue(query, 'page', request.base.page);
  appendQueryValue(query, 'pageSize', request.base.pageSize);
  appendQueryValue(query, 'search', request.base.search);
  appendQueryValue(query, 'sortBy', request.base.sortBy);
  appendQueryValue(query, 'sortOrder', request.base.sortOrder);

  Object.entries(request.extras ?? {}).forEach(([key, value]) => {
    appendQueryValue(query, key, value);
  });

  const serialized = query.toString();
  return serialized ? `${path}?${serialized}` : path;
}

function createEmptyPage<T>(request: ListResourceRequest): PaginatedResponse<T> {
  const page = request.base.page ?? 1;
  const pageSize = request.base.pageSize ?? 20;

  return {
    data: [],
    total: 0,
    page,
    pageSize,
    totalPages: 1,
  };
}

export function useListResource<T>({
  buildRequest,
  path,
}: UseListResourceOptions): UseListResourceResult<T> {
  const searchParams = useSearchParams();
  const request = React.useMemo(
    () => buildRequest(searchParams),
    [buildRequest, searchParams],
  );
  const requestPath = React.useMemo(
    () => buildRequestPath(path, request),
    [path, request],
  );
  const state = useBffGet<PaginatedResponse<T>>(requestPath);

  return {
    data: state.data?.data ?? [],
    error: state.error ? new Error(state.error) : null,
    loading: state.loading,
    pagination: state.data ?? createEmptyPage<T>(request),
    reload: state.reload,
    request,
  };
}
