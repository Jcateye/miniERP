'use client';

import * as React from 'react';

import { bffGet } from '@/lib/bff';

type LookupEntity = {
  id: string;
  code: string;
  name: string;
};

type LookupPayload =
  | LookupEntity[]
  | {
      data?: LookupEntity[];
      total?: number;
    };

const lookupOptionsCache = new Map<string, RemoteEntityOption[]>();
const lookupInflightCache = new Map<string, Promise<RemoteEntityOption[]>>();

export interface RemoteEntityOption {
  label: string;
  value: string;
}

interface RemoteEntitySelectProps {
  currentFallbackLabel?: string;
  disabled?: boolean;
  emptyLabel: string;
  endpoint: string;
  onChange: (value: string, label?: string) => void;
  open: boolean;
  value: string;
  valueKey?: 'code' | 'id';
}

function toLookupEntities(payload: LookupPayload): LookupEntity[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  return Array.isArray(payload.data) ? payload.data : [];
}

function formatOptionLabel(entity: LookupEntity): string {
  return `${entity.code} · ${entity.name}`;
}

function buildLookupPath(endpoint: string) {
  const [pathname, rawQuery = ''] = endpoint.split('?', 2);
  const searchParams = new URLSearchParams(rawQuery);

  if (!searchParams.has('isActive')) {
    searchParams.set('isActive', 'true');
  }

  const serialized = searchParams.toString();
  return serialized ? `${pathname}?${serialized}` : pathname;
}

export function RemoteEntitySelect({
  currentFallbackLabel,
  disabled = false,
  emptyLabel,
  endpoint,
  onChange,
  open,
  value,
  valueKey = 'id',
}: RemoteEntitySelectProps) {
  const [options, setOptions] = React.useState<RemoteEntityOption[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    let disposed = false;
    const requestPath = buildLookupPath(endpoint);
    const cacheKey = `${requestPath}::${valueKey}`;

    const load = async () => {
      const cached = lookupOptionsCache.get(cacheKey);
      if (cached) {
        setOptions(cached);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const inflight =
          lookupInflightCache.get(cacheKey) ??
          bffGet<LookupPayload>(requestPath).then((payload) =>
            toLookupEntities(payload).map((entity) => ({
              label: formatOptionLabel(entity),
              value: valueKey === 'code' ? entity.code : entity.id,
            })),
          );

        lookupInflightCache.set(cacheKey, inflight);
        const resolvedOptions = await inflight;
        if (disposed) {
          return;
        }

        lookupOptionsCache.set(cacheKey, resolvedOptions);
        lookupInflightCache.delete(cacheKey);
        setOptions(resolvedOptions);
      } catch (loadError) {
        if (disposed) {
          return;
        }

        lookupInflightCache.delete(cacheKey);
        setError(
          loadError instanceof Error ? loadError.message : '选项加载失败',
        );
        setOptions([]);
      } finally {
        if (!disposed) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      disposed = true;
    };
  }, [endpoint, open, valueKey]);

  const normalizedOptions = React.useMemo(() => {
    if (!value || options.some((option) => option.value === value)) {
      return options;
    }

    return [
      {
        label: currentFallbackLabel
          ? `当前值 · ${currentFallbackLabel}`
          : `当前值 · ${value}`,
        value,
      },
      ...options,
    ];
  }, [currentFallbackLabel, options, value]);

  return (
    <div className="flex flex-col gap-2">
      <select
        className="h-10 w-full border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary disabled:bg-gray-50 disabled:text-muted"
        disabled={disabled || loading}
        onChange={(event) => {
          const nextValue = event.target.value;
          const nextLabel = normalizedOptions.find(
            (option) => option.value === nextValue,
          )?.label;
          onChange(nextValue, nextLabel);
        }}
        value={value}
      >
        <option value="">{loading ? '加载中...' : emptyLabel}</option>
        {normalizedOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error ? <p className="text-xs text-[#B54A4A]">{error}</p> : null}
    </div>
  );
}
