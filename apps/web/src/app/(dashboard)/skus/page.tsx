'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Download, Plus, RefreshCw } from 'lucide-react';

import {
  ActionButton,
  DataTable,
  FilterTabs,
  FormInput,
  PageHeader,
  QuickPreview,
  SearchBar,
  StatusBadge,
  type TableColumn,
} from '@/components/ui';

import {
  buildApiPath,
  buildFilterSummary,
  buildQueryString,
  buildResultSummary,
  buildStatusTabs,
  getEmptyStateCopy,
  getQuickPreviewFields,
  getStatusTabKey,
  hasActiveFilters,
  mapRows,
  parseFilters,
  type SkuFilters,
  type SkuListItem,
  type SkuListResponse,
} from './sku-page-utils';

type NoticeTone = 'info' | 'warning';

type FilterChipProps = {
  label: string;
  onClear: () => void;
};

type EmptyStateProps = {
  title: string;
  description: string;
  actions?: ReactNode;
};

type NoticeBannerProps = {
  message: string;
  tone?: NoticeTone;
  actions?: ReactNode;
};

const columns: TableColumn[] = [
  { key: 'code', label: '编码', width: 160 },
  {
    key: 'name',
    label: '名称',
    width: 240,
    render: (value, row) => (
      <div style={{ display: 'grid', gap: 4, whiteSpace: 'normal' }}>
        <span style={{ fontWeight: 600, color: '#1A1A1A' }}>{value}</span>
        <span style={{ fontSize: 12, color: '#666666' }}>{row.searchHint ?? '—'}</span>
      </div>
    ),
  },
  {
    key: 'specification',
    label: '规格',
    width: 240,
    render: (value) => (
      <div style={{ whiteSpace: 'normal', lineHeight: 1.5, color: '#1A1A1A' }}>{value}</div>
    ),
  },
  { key: 'baseUnit', label: '基础单位', width: 90 },
  { key: 'categoryId', label: '分类', width: 140 },
  {
    key: 'status',
    label: '状态',
    width: 90,
    render: (value) => (
      <StatusBadge label={value} tone={value === '启用' ? 'success' : 'danger'} />
    ),
  },
  { key: 'updatedAt', label: '更新时间', width: 180 },
];

function EmptyState({ title, description, actions }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'grid',
        gap: 12,
        padding: '28px 24px',
        borderRadius: 8,
        background: '#FFFFFF',
        border: '1px solid #E0DDD8',
      }}
    >
      <div style={{ display: 'grid', gap: 8 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A' }}>{title}</div>
        <div style={{ fontSize: 13, color: '#666666', lineHeight: 1.6 }}>{description}</div>
      </div>
      {actions ? <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{actions}</div> : null}
    </div>
  );
}

function NoticeBanner({ message, tone = 'info', actions }: NoticeBannerProps) {
  const styles: Record<NoticeTone, { background: string; color: string; border: string }> = {
    info: {
      background: 'rgba(92,124,138,0.08)',
      color: '#35515B',
      border: '1px solid rgba(92,124,138,0.16)',
    },
    warning: {
      background: 'rgba(192,90,60,0.08)',
      color: '#8A3D27',
      border: '1px solid rgba(192,90,60,0.18)',
    },
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '10px 14px',
        borderRadius: 8,
        fontSize: 13,
        lineHeight: 1.5,
        flexWrap: 'wrap',
        ...styles[tone],
      }}
    >
      <span>{message}</span>
      {actions ? <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{actions}</div> : null}
    </div>
  );
}

function FilterChip({ label, onClear }: FilterChipProps) {
  return (
    <button
      onClick={onClear}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 10px',
        borderRadius: 999,
        border: '1px solid #D9D3CB',
        background: '#FFFFFF',
        color: '#4A4A4A',
        fontSize: 12,
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      <span>{label}</span>
      <span style={{ color: '#888888' }}>清除</span>
    </button>
  );
}

function PreviewPlaceholder({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div
      style={{
        width: 320,
        background: '#FFFFFF',
        borderLeft: '1px solid #E0DDD8',
        padding: 20,
        display: 'grid',
        gap: 12,
        alignContent: 'flex-start',
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>快速预览已关闭</div>
      <div style={{ fontSize: 13, color: '#666666', lineHeight: 1.6 }}>
        {hasFilters
          ? '可继续调整筛选，或点击任意一行重新打开右侧预览。'
          : '点击任意一行即可查看状态、规格、时间与租户等关键信息。'}
      </div>
    </div>
  );
}

async function requestJson<T>(path: string): Promise<T> {
  const response = await fetch(path, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      'content-type': 'application/json',
    },
  });

  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const errorMessage =
      typeof payload === 'object' &&
      payload !== null &&
      'error' in payload &&
      typeof payload.error === 'object' &&
      payload.error !== null &&
      'message' in payload.error &&
      typeof payload.error.message === 'string'
        ? payload.error.message
        : response.status >= 500
          ? '服务暂时不可用，请稍后重试。'
          : `请求失败：${response.status}`;

    throw new Error(errorMessage);
  }

  return payload as T;
}

function SKUWorkbenchPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo<SkuFilters>(() => parseFilters(searchParams), [searchParams]);
  const filterDirty = useMemo(() => hasActiveFilters(filters), [filters]);
  const filterSummary = useMemo(() => buildFilterSummary(filters), [filters]);
  const statusTabKey = useMemo(() => getStatusTabKey(filters.isActive), [filters.isActive]);

  const [items, setItems] = useState<SkuListItem[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState<{ message: string; tone: NoticeTone } | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(Boolean(filters.code));
  const [drafts, setDrafts] = useState({ name: filters.name, code: filters.code });
  const requestSequenceRef = useRef(0);

  const syncUrl = useCallback(
    (nextFilters: SkuFilters) => {
      const queryString = buildQueryString(nextFilters);
      router.replace(queryString ? `${pathname}?${queryString}` : pathname);
    },
    [pathname, router],
  );

  const applyFilters = useCallback(
    (nextFilters: SkuFilters) => {
      setDrafts({ name: nextFilters.name, code: nextFilters.code });
      syncUrl(nextFilters);
    },
    [syncUrl],
  );

  const loadItems = useCallback(async () => {
    const requestId = requestSequenceRef.current + 1;
    requestSequenceRef.current = requestId;
    setLoading(true);
    setError('');
    setNotice(null);

    try {
      const result = await requestJson<SkuListResponse>(buildApiPath(filters));

      if (requestSequenceRef.current !== requestId) {
        return;
      }

      setItems(result.data);

      if (result.message === 'fixture') {
        setNotice({
          message: `当前 SKU 列表来自 BFF fixture 回退数据，URL 筛选仍然有效；后端恢复后会自动切回真实数据。`,
          tone: 'warning',
        });
      }
    } catch (requestError) {
      if (requestSequenceRef.current !== requestId) {
        return;
      }

      setItems([]);
      setError(requestError instanceof Error ? requestError.message : 'SKU 列表加载失败');
    } finally {
      if (requestSequenceRef.current === requestId) {
        setLoading(false);
      }
    }
  }, [filters]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  useEffect(() => {
    setDrafts((previous) => {
      if (previous.name === filters.name && previous.code === filters.code) {
        return previous;
      }

      return { name: filters.name, code: filters.code };
    });
  }, [filters.code, filters.name]);

  useEffect(() => {
    if (filters.code) {
      setShowAdvancedFilters(true);
    }
  }, [filters.code]);

  useEffect(() => {
    if (drafts.name === filters.name && drafts.code === filters.code) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      syncUrl({ ...filters, name: drafts.name, code: drafts.code });
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [drafts.code, drafts.name, filters, syncUrl]);

  useEffect(() => {
    if (items.length === 0) {
      setSelectedId('');
      return;
    }

    setSelectedId((previous) => {
      if (!previous) {
        return items[0]!.id;
      }

      return items.some((item) => item.id === previous) ? previous : items[0]!.id;
    });
  }, [items]);

  const statusTabs = useMemo(() => buildStatusTabs(items), [items]);
  const rows = useMemo(() => mapRows(items), [items]);
  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );
  const pendingUrlSync = drafts.name !== filters.name || drafts.code !== filters.code;
  const currentInputFilters = useMemo<SkuFilters>(
    () => ({
      code: drafts.code,
      name: drafts.name,
      isActive: filters.isActive,
    }),
    [drafts.code, drafts.name, filters.isActive],
  );
  const emptyState = useMemo(
    () => getEmptyStateCopy({ filters, total: rows.length }),
    [filters, rows.length],
  );

  const handleStatusTabChange = (key: string) => {
    if (key === 'active') {
      applyFilters({ ...currentInputFilters, isActive: 'true' });
      return;
    }

    if (key === 'inactive') {
      applyFilters({ ...currentInputFilters, isActive: 'false' });
      return;
    }

    applyFilters({ ...currentInputFilters, isActive: '' });
  };

  const handleResetFilters = () => {
    applyFilters({ code: '', name: '', isActive: '' });
  };

  const activeFilterChips = [
    filters.name
      ? {
          key: 'name',
          label: `名称：${filters.name}`,
          onClear: () => applyFilters({ ...currentInputFilters, name: '' }),
        }
      : null,
    filters.code
      ? {
          key: 'code',
          label: `编码：${filters.code}`,
          onClear: () => applyFilters({ ...currentInputFilters, code: '' }),
        }
      : null,
    filters.isActive
      ? {
          key: 'status',
          label: `状态：${filters.isActive === 'true' ? '启用' : '停用'}`,
          onClear: () => applyFilters({ ...currentInputFilters, isActive: '' }),
        }
      : null,
  ].filter((value): value is NonNullable<typeof value> => value !== null);

  return (
    <div
      style={{
        padding: '32px 40px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        minHeight: '100%',
      }}
    >
      <PageHeader
        title="SKU 管理"
        subtitle="真实 SKU 列表 · 保持 URL 同步，并强化搜索、提示与快速预览体验"
        actions={
          <>
            <ActionButton
              label={loading ? '刷新中...' : '刷新'}
              icon={<RefreshCw size={14} />}
              tone="secondary"
              onClick={() => void loadItems()}
              disabled={loading}
            />
            <ActionButton label="导出" icon={<Download size={14} />} tone="secondary" disabled />
            <ActionButton label="新建 SKU" icon={<Plus size={14} />} tone="primary" disabled />
          </>
        }
      />

      <div
        style={{
          display: 'grid',
          gap: 12,
          padding: '16px 18px',
          background: '#FFFFFF',
          border: '1px solid #E0DDD8',
          borderRadius: 8,
        }}
      >
        <SearchBar
          placeholder="按 SKU 名称搜索，输入后自动同步 URL"
          value={drafts.name}
          onSearchChange={(value) => setDrafts((previous) => ({ ...previous, name: value }))}
          showAdvancedFilter
          advancedFilterLabel={showAdvancedFilters ? '收起编码筛选' : '展开编码筛选'}
          onAdvancedFilter={() => setShowAdvancedFilters((previous) => !previous)}
          trailing={
            <ActionButton
              label="重置筛选"
              tone="ghost"
              onClick={filterDirty || pendingUrlSync ? handleResetFilters : undefined}
              disabled={!filterDirty && !pendingUrlSync}
            />
          }
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 12, color: '#666666', lineHeight: 1.6 }}>
            {pendingUrlSync
              ? '正在根据输入更新筛选并同步 URL…'
              : filterDirty
                ? `当前筛选：${filterSummary}`
                : '可按名称快速搜索，并通过编码与状态缩小结果范围；刷新后会保留当前 URL 条件。'}
          </div>
          <div style={{ fontSize: 12, color: '#888888', lineHeight: 1.6 }}>
            {buildResultSummary(rows.length, filters)}
          </div>
        </div>

        {showAdvancedFilters ? (
          <div
            style={{
              display: 'grid',
              gap: 12,
              padding: '16px 18px',
              background: '#FAF8F5',
              border: '1px solid #ECE7E1',
              borderRadius: 8,
            }}
          >
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ minWidth: 280, flex: '0 1 320px' }}>
                <FormInput
                  label="按编码筛选"
                  placeholder="输入 SKU 编码，自动同步 URL"
                  value={drafts.code}
                  onChange={(value) => setDrafts((previous) => ({ ...previous, code: value }))}
                />
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#666666', lineHeight: 1.6 }}>
              状态筛选仍通过下方标签切换。名称与编码输入会在停止输入后自动更新列表，避免频繁跳动。
            </div>
          </div>
        ) : null}

        {activeFilterChips.length > 0 ? (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {activeFilterChips.map((chip) => (
              <FilterChip key={chip.key} label={chip.label} onClear={chip.onClear} />
            ))}
          </div>
        ) : null}
      </div>

      <FilterTabs
        tabs={statusTabs}
        activeKey={statusTabKey}
        onChange={handleStatusTabChange}
        summary={buildResultSummary(rows.length, filters)}
      />

      {notice ? (
        <NoticeBanner
          message={notice.message}
          tone={notice.tone}
          actions={
            filterDirty ? (
              <ActionButton label="清空筛选" tone="ghost" onClick={handleResetFilters} />
            ) : undefined
          }
        />
      ) : null}

      <div style={{ display: 'flex', gap: 0, flex: 1, minHeight: 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {loading ? (
            <EmptyState title="加载中" description="正在加载真实 SKU 列表，请稍候…" />
          ) : error ? (
            <EmptyState
              title="SKU 列表加载失败"
              description={
                filterDirty
                  ? `${error} 当前 URL 筛选：${filterSummary}。`
                  : error
              }
              actions={
                <>
                  <ActionButton
                    label="重试"
                    tone="secondary"
                    onClick={() => void loadItems()}
                    disabled={loading}
                  />
                  {filterDirty ? (
                    <ActionButton label="清空筛选后重试" tone="ghost" onClick={handleResetFilters} />
                  ) : null}
                </>
              }
            />
          ) : rows.length === 0 ? (
            <EmptyState
              title={emptyState.title}
              description={emptyState.description}
              actions={
                filterDirty ? (
                  <ActionButton label="清空筛选" tone="secondary" onClick={handleResetFilters} />
                ) : (
                  <ActionButton label="重新加载" tone="secondary" onClick={() => void loadItems()} />
                )
              }
            />
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              totalPages={1}
              currentPage={1}
              totalItems={rows.length}
              onRowClick={(row) => setSelectedId(row.id ?? '')}
              selectedRowId={selectedId}
            />
          )}
        </div>

        {!loading && !error && rows.length > 0 ? (
          selectedItem ? (
            <QuickPreview
              title="SKU 快速预览"
              heading={selectedItem.code}
              subheading={selectedItem.name}
              description={`当前选中项的状态、时间与基础信息会跟随表格选择更新。筛选条件：${filterSummary}。`}
              fields={getQuickPreviewFields(selectedItem)}
              onClose={() => setSelectedId('')}
              width={320}
            />
          ) : (
            <PreviewPlaceholder hasFilters={filterDirty} />
          )
        ) : null}
      </div>
    </div>
  );
}

export default function SKUWorkbenchPage() {
  return (
    <Suspense fallback={null}>
      <SKUWorkbenchPageContent />
    </Suspense>
  );
}
