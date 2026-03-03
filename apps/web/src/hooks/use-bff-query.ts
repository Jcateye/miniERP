'use client';

import { startTransition, useEffect, useEffectEvent, useState } from 'react';

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

  const runQuery = useEffectEvent(async (signal: AbortSignal) => {
    startTransition(() => {
      setState((previous) => ({
        ...previous,
        loading: true,
        error: null,
      }));
    });

    try {
      const data = await fetcher();

      if (signal.aborted) {
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
      if (signal.aborted) {
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
  });

  useEffect(() => {
    if (!enabled) {
      setState((previous) => ({
        ...previous,
        loading: false,
      }));
      return;
    }

    const controller = new AbortController();
    void runQuery(controller.signal);

    return () => {
      controller.abort();
    };
  }, [enabled, nonce, runQuery, serializedKey]);

  return {
    ...state,
    reload: () => {
      setNonce((previous) => previous + 1);
    },
  };
}
