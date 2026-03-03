'use client';

import { startTransition, useEffect, useState } from 'react';

import type { BffHookOptions, QueryKey } from '@/lib/bff';

export interface UseBffQueryState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  reload: () => void;
}

export function useBffQuery<T>(
  queryKey: QueryKey,
  fetcher: () => Promise<T>,
  options: BffHookOptions = {},
): UseBffQueryState<T> {
  const [nonce, setNonce] = useState(0);
  const [state, setState] = useState<Omit<UseBffQueryState<T>, 'reload'>>({
    data: null,
    error: null,
    loading: options.enabled !== false,
  });
  const enabled = options.enabled !== false;
  const serializedKey = JSON.stringify(queryKey);

  useEffect(() => {
    if (!enabled) {
      setState((previous) => ({
        ...previous,
        loading: false,
      }));
      return;
    }

    const controller = new AbortController();
    const runQuery = async () => {
      startTransition(() => {
        setState((previous) => ({
          ...previous,
          loading: true,
          error: null,
        }));
      });

      try {
        const data = await fetcher();

        if (controller.signal.aborted) {
          return;
        }

        startTransition(() => {
          setState({
            data,
            error: null,
            loading: false,
          });
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        startTransition(() => {
          setState({
            data: null,
            error: error instanceof Error ? error.message : 'Request failed',
            loading: false,
          });
        });
      }
    };

    void runQuery();

    return () => {
      controller.abort();
    };
  }, [enabled, fetcher, nonce, serializedKey]);

  return {
    ...state,
    reload: () => {
      setNonce((previous) => previous + 1);
    },
  };
}
