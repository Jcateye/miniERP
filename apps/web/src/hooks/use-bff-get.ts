import { useEffect, useState } from 'react';

import { bffGet } from '@/lib/bff';

interface UseBffGetState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useBffGet<T>(path: string): UseBffGetState<T> {
  const [state, setState] = useState<UseBffGetState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setState((previous) => ({
        ...previous,
        loading: true,
        error: null,
      }));

      try {
        const data = await bffGet<T>(path);

        if (!cancelled) {
          setState({
            data,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error.message : 'Request failed',
          });
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [path]);

  return state;
}
