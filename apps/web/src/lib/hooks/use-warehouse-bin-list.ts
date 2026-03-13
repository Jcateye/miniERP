'use client';

import * as React from 'react';

import type { WarehouseBin } from '@minierp/shared';

import { useBffGet } from '@/hooks/use-bff-get';

type WarehouseBinListPayload = {
  data?: WarehouseBin[];
  total?: number;
};

export function useWarehouseBinList(warehouseId?: string) {
  const path = React.useMemo(() => {
    if (!warehouseId) {
      return null;
    }

    const query = new URLSearchParams({ warehouseId });

    return `/warehouse-bins?${query.toString()}`;
  }, [warehouseId]);

  const state = useBffGet<WarehouseBinListPayload>(path ?? '/warehouse-bins', Boolean(path));

  return {
    data: state.data?.data ?? [],
    error: state.error ? new Error(state.error) : null,
    loading: state.loading,
    reload: state.reload,
  };
}
