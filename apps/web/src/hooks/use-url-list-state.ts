'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type UrlDefaults = Record<string, string>;
type UrlParams<TDefaults extends UrlDefaults> = {
  [TKey in keyof TDefaults]: string;
};
type ParamValue = string | number | boolean | null | undefined;
type UpdateOptions = {
  replace?: boolean;
  resetPage?: boolean;
};

export function useUrlListState<TDefaults extends UrlDefaults>(defaults: TDefaults) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();

  const params = React.useMemo(() => {
    const next = {} as UrlParams<TDefaults>;

    (Object.keys(defaults) as Array<keyof TDefaults>).forEach((key) => {
      const value = searchParams.get(String(key));
      next[key] = value?.trim() ? value : defaults[key];
    });

    return next;
  }, [defaults, searchParams]);

  const updateParams = React.useCallback(
    (updates: Partial<Record<keyof TDefaults, ParamValue>>, options: UpdateOptions = {}) => {
      const next = new URLSearchParams(searchParams.toString());

      if (options.resetPage && 'page' in defaults && !('page' in updates)) {
        next.delete('page');
      }

      (Object.entries(updates) as Array<[keyof TDefaults, ParamValue]>).forEach(([key, value]) => {
        const stringKey = String(key);
        const normalizedValue =
          value === null || value === undefined ? '' : String(value).trim();

        if (!normalizedValue || normalizedValue === defaults[key]) {
          next.delete(stringKey);
          return;
        }

        next.set(stringKey, normalizedValue);
      });

      const query = next.toString();
      const href = query ? `${pathname}?${query}` : pathname;
      const navigate = options.replace ? router.replace : router.push;

      startTransition(() => {
        navigate(href, { scroll: false });
      });
    },
    [defaults, pathname, router, searchParams],
  );

  return {
    isPending,
    params,
    searchParams,
    updateParams,
  };
}

export function parsePageParam(value: string, fallback = 1) {
  const page = Number.parseInt(value, 10);

  if (!Number.isFinite(page) || page < 1) {
    return fallback;
  }

  return page;
}

export function buildPagination(currentPage: number, totalPages: number) {
  if (totalPages <= 1) {
    return [1];
  }

  const pages = new Set<number>([1, totalPages, currentPage]);

  if (currentPage - 1 > 1) {
    pages.add(currentPage - 1);
  }

  if (currentPage + 1 < totalPages) {
    pages.add(currentPage + 1);
  }

  return Array.from(pages).sort((left, right) => left - right);
}
