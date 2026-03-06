'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { INVENTORY_REFERENCE_TYPES, type InventoryBalancePage, type InventoryLedgerPage } from '@minierp/shared';
import { useEffect, useMemo, useState, type FormEvent } from 'react';

import { useBffGet, useDocumentDetail, useDocumentEvidence, useLineEvidence, useWorkbenchList } from '@/hooks';
import { DetailLayout, EmptyState, HeaderActions, OverviewLayout, SurfaceCard, TemplateBadge, WorkbenchLayout, WizardLayout, styles } from '@/components/layouts';
import { EvidencePanel } from '@/components/evidence/evidence-panel';
import { LineEvidenceDrawer } from '@/components/evidence/line-evidence-drawer';
import { attachEvidence, createDocument, createEvidenceUploadIntent, submitDocumentCommand } from '@/lib/bff';

import type {
  AssemblyRow,
  DetailAssemblyConfig,
  OverviewAssemblyConfig,
  WizardAssemblyConfig,
  WorkbenchAssemblyConfig,
} from './erp-page-config';

function toTone(value?: string) {
  if (value === 'difference' || value === 'risk' || value === 'urgent') {
    return 'warning' as const;
  }

  if (value === 'active' || value === 'approved' || value === 'completed' || value === 'posted' || value === 'healthy' || value === 'published' || value === 'enabled') {
    return 'success' as const;
  }

  if (value === 'pending' || value === 'picking' || value === 'counting' || value === 'reviewing' || value === 'reviewed' || value === 'watch') {
    return 'info' as const;
  }

  return 'neutral' as const;
}

function renderCell(row: AssemblyRow, column: WorkbenchAssemblyConfig['columns'][number]) {
  const value = row[column.key] ?? '-';

  if (column.type === 'badge') {
    return <TemplateBadge label={value} tone={column.toneMap?.[value] ?? toTone(value)} />;
  }

  if (column.type === 'link' && row.href) {
    return (
      <Link href={row.href} style={{ color: 'var(--color-terracotta)', textDecoration: 'none', fontWeight: 650 }}>
        {value}
      </Link>
    );
  }

  return <span>{value}</span>;
}

type InventoryWorkbenchRoute = '/inventory' | '/inventory/ledger';

type InventoryUrlState = {
  skuId: string;
  warehouseId: string;
  docType: string;
  page: number;
  pageSize: number;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function parsePositiveInt(value: string | null, fallback: number) {
  if (!value) {
    return fallback;
  }

  if (!/^[1-9]\d*$/.test(value)) {
    return fallback;
  }

  return Number(value);
}

function idempotencyKey(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function formatPostedAt(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString('zh-CN', { hour12: false });
}

function getRowValue(row: AssemblyRow, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = row[key];
    if (value && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
}

function ToolbarCard({ config }: { config: WorkbenchAssemblyConfig }) {
  return (
    <SurfaceCard title="筛选与视图" description="模板化工作台过滤区，数据编排位于 hooks/BFF 层。">
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        {config.contract.filters.map((filter) => (
          <div
            key={filter.key}
            style={{
              border: '1px solid rgba(224,221,214,0.92)',
              borderRadius: 14,
              padding: 14,
              background: 'rgba(245,243,239,0.72)',
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{filter.label}</div>
            <div style={{ marginTop: 8, fontSize: 13, fontWeight: 600 }}>
              {filter.placeholder ?? filter.options?.map((item) => item.label).join(' / ') ?? filter.kind}
            </div>
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}

function InventoryToolbar({
  route,
  state,
  validationError,
  onSubmit,
  onReset,
}: {
  route: InventoryWorkbenchRoute;
  state: InventoryUrlState;
  validationError: string | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
}) {
  return (
    <SurfaceCard title="筛选与视图" description="筛选项与分页状态全部 URL 化，可分享与回放。">
      <form
        key={`${route}-${state.skuId}-${state.warehouseId}-${state.docType}-${state.pageSize}`}
        onSubmit={onSubmit}
        style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}
      >
        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>SKU</span>
          <input
            name="skuId"
            defaultValue={state.skuId}
            placeholder="如 CAB-HDMI-2M"
            style={{
              border: '1px solid rgba(224,221,214,0.92)',
              borderRadius: 10,
              padding: '8px 10px',
              background: 'rgba(255,255,255,0.86)',
            }}
          />
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>仓库</span>
          <input
            name="warehouseId"
            defaultValue={state.warehouseId}
            placeholder="如 SZ-DC-01"
            style={{
              border: '1px solid rgba(224,221,214,0.92)',
              borderRadius: 10,
              padding: '8px 10px',
              background: 'rgba(255,255,255,0.86)',
            }}
          />
        </label>
        {route === '/inventory/ledger' ? (
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>来源类型</span>
            <select
              name="docType"
              defaultValue={state.docType}
              style={{
                border: '1px solid rgba(224,221,214,0.92)',
                borderRadius: 10,
                padding: '8px 10px',
                background: 'rgba(255,255,255,0.86)',
              }}
            >
              <option value="">全部</option>
              {INVENTORY_REFERENCE_TYPES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>每页条数</span>
          <select
            name="pageSize"
            defaultValue={String(state.pageSize)}
            style={{
              border: '1px solid rgba(224,221,214,0.92)',
              borderRadius: 10,
              padding: '8px 10px',
              background: 'rgba(255,255,255,0.86)',
            }}
          >
            {[20, 50, 100, 200].map((size) => (
              <option key={size} value={String(size)}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          <button
            type="submit"
            style={{
              border: '1px solid var(--color-terracotta)',
              borderRadius: 10,
              padding: '8px 14px',
              background: 'var(--color-terracotta)',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            应用筛选
          </button>
          <button
            type="button"
            onClick={onReset}
            style={{
              border: '1px solid rgba(224,221,214,0.92)',
              borderRadius: 10,
              padding: '8px 14px',
              background: 'rgba(255,255,255,0.9)',
              color: 'var(--color-text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            重置
          </button>
        </div>
      </form>
      {validationError ? (
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--color-danger)' }}>{validationError}</div>
      ) : null}
    </SurfaceCard>
  );
}

export function OverviewAssembly({ config }: { config: OverviewAssemblyConfig }) {
  return (
    <OverviewLayout
      contract={config.contract}
      searchSlot={
        <SurfaceCard title="统一搜索" description="跨单据、SKU、客户与供应商的入口。">
          <div
            style={{
              border: '1px solid rgba(224,221,214,0.92)',
              borderRadius: 14,
              padding: '14px 16px',
              background: 'rgba(255,255,255,0.74)',
              color: 'var(--color-text-secondary)',
            }}
          >
            {config.searchPlaceholder}
          </div>
        </SurfaceCard>
      }
      todoSlot={
        <SurfaceCard title="待办 / 异常" description="按业务优先级排序。">
          <div style={{ display: 'grid', gap: 10 }}>
            {config.todos.map((item) => (
              <Link
                key={item.title}
                href={item.href ?? '#'}
                style={{
                  display: 'block',
                  border: '1px solid rgba(224,221,214,0.92)',
                  borderRadius: 14,
                  padding: 14,
                  textDecoration: 'none',
                  color: 'inherit',
                  background: 'rgba(255,255,255,0.72)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 650 }}>{item.title}</div>
                  <TemplateBadge label={item.tag} tone={item.tone ?? 'neutral'} />
                </div>
                <div style={{ marginTop: 6, fontSize: 13, lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>
                  {item.description}
                </div>
              </Link>
            ))}
          </div>
        </SurfaceCard>
      }
      quickActionsSlot={
        <SurfaceCard title="快捷操作" description="面向当前阶段 1 的核心页面装配入口。">
          <div style={{ display: 'grid', gap: 10 }}>
            {config.quickActions.map((action) => (
              <Link
                key={action.key}
                href={action.href ?? '#'}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderRadius: 14,
                  border: '1px solid rgba(224,221,214,0.92)',
                  background: 'rgba(255,255,255,0.72)',
                  color: 'inherit',
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {action.label}
                <span style={{ color: 'var(--color-terracotta)' }}>→</span>
              </Link>
            ))}
          </div>
        </SurfaceCard>
      }
      timelineSlot={
        <SurfaceCard title="最近动作" description="保留阶段 1 联调前的上下文。">
          <div style={{ display: 'grid', gap: 10 }}>
            {config.timeline.map((item) => (
              <div key={`${item.action}-${item.time}`} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', marginTop: 5, background: `var(--color-${item.tone ?? 'info'})` }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{item.action}</div>
                  <div style={{ marginTop: 4, fontSize: 12, color: 'var(--color-text-secondary)' }}>{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>
      }
    />
  );
}

export function WorkbenchAssembly({ config }: { config: WorkbenchAssemblyConfig }) {
  const route = config.contract.route;
  const isInventoryRoute = route === '/inventory';
  const isInventoryLedgerRoute = route === '/inventory/ledger';
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hook = useWorkbenchList(config.docType);
  const queryState = useMemo<InventoryUrlState>(
    () => ({
      skuId: searchParams.get('skuId')?.trim() ?? '',
      warehouseId: searchParams.get('warehouseId')?.trim() ?? '',
      docType: searchParams.get('docType')?.trim().toUpperCase() ?? '',
      page: parsePositiveInt(searchParams.get('page'), DEFAULT_PAGE),
      pageSize: Math.min(
        parsePositiveInt(searchParams.get('pageSize'), DEFAULT_PAGE_SIZE),
        200,
      ),
    }),
    [searchParams],
  );
  const inventoryQueryValidationError = useMemo(() => {
    if (!isInventoryRoute) {
      return null;
    }

    if (
      (queryState.skuId && !queryState.warehouseId) ||
      (!queryState.skuId && queryState.warehouseId)
    ) {
      return '筛选库存余额时，SKU 与仓库必须同时填写。';
    }

    return null;
  }, [isInventoryRoute, queryState.skuId, queryState.warehouseId]);

  const replaceInventoryQuery = (
    patch: Partial<InventoryUrlState>,
    options?: { resetPage?: boolean },
  ) => {
    if (!isInventoryRoute && !isInventoryLedgerRoute) {
      return;
    }

    const nextState: InventoryUrlState = {
      ...queryState,
      ...patch,
    };
    const page = options?.resetPage
      ? DEFAULT_PAGE
      : Math.max(DEFAULT_PAGE, nextState.page);
    const pageSize = Math.min(
      Math.max(DEFAULT_PAGE, nextState.pageSize),
      200,
    );
    const params = new URLSearchParams();

    if (nextState.skuId) {
      params.set('skuId', nextState.skuId);
    }

    if (nextState.warehouseId) {
      params.set('warehouseId', nextState.warehouseId);
    }

    if (isInventoryLedgerRoute && nextState.docType) {
      params.set('docType', nextState.docType.toUpperCase());
    }

    params.set('page', String(page));
    params.set('pageSize', String(pageSize));

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  const handleInventoryFilterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    replaceInventoryQuery(
      {
        skuId: String(formData.get('skuId') ?? '').trim(),
        warehouseId: String(formData.get('warehouseId') ?? '').trim(),
        docType: String(formData.get('docType') ?? '').trim().toUpperCase(),
        pageSize: parsePositiveInt(
          String(formData.get('pageSize') ?? ''),
          queryState.pageSize,
        ),
      },
      { resetPage: true },
    );
  };

  const inventoryBalancePath = useMemo(() => {
    const params = new URLSearchParams();

    if (queryState.skuId) {
      params.set('skuId', queryState.skuId);
    }

    if (queryState.warehouseId) {
      params.set('warehouseId', queryState.warehouseId);
    }

    params.set('page', String(queryState.page));
    params.set('pageSize', String(queryState.pageSize));

    return `/inventory/balances?${params.toString()}`;
  }, [queryState.page, queryState.pageSize, queryState.skuId, queryState.warehouseId]);

  const inventoryLedgerPath = useMemo(() => {
    const params = new URLSearchParams();

    if (queryState.skuId) {
      params.set('skuId', queryState.skuId);
    }

    if (queryState.warehouseId) {
      params.set('warehouseId', queryState.warehouseId);
    }

    if (queryState.docType) {
      params.set('docType', queryState.docType);
    }

    params.set('page', String(queryState.page));
    params.set('pageSize', String(queryState.pageSize));

    return `/inventory/ledger?${params.toString()}`;
  }, [
    queryState.docType,
    queryState.page,
    queryState.pageSize,
    queryState.skuId,
    queryState.warehouseId,
  ]);

  const inventoryBalanceHook = useBffGet<InventoryBalancePage>(
    inventoryBalancePath,
    isInventoryRoute && !inventoryQueryValidationError,
  );
  const inventoryLedgerHook = useBffGet<InventoryLedgerPage>(
    inventoryLedgerPath,
    isInventoryLedgerRoute,
  );

  const rows = useMemo<AssemblyRow[]>(() => {
    if (isInventoryRoute) {
      const liveRows = inventoryBalanceHook.data?.data ?? [];
      return liveRows.map((item) => ({
        id: `${item.skuId}-${item.warehouseId}`,
        sku: item.skuId,
        warehouse: item.warehouseId,
        onHand: String(item.onHand),
        available: String(item.onHand),
        reserved: '0',
        status: item.onHand > 0 ? 'healthy' : 'risk',
      }));
    }

    if (isInventoryLedgerRoute) {
      const liveRows = inventoryLedgerHook.data?.data ?? [];
      return liveRows.map((item) => ({
        id: item.id,
        docNo: `${item.referenceType}-${item.referenceId}`,
        sku: item.skuId,
        warehouse: item.warehouseId,
        delta:
          item.quantityDelta >= 0
            ? `+${item.quantityDelta}`
            : String(item.quantityDelta),
        balance: '-',
        postedAt: formatPostedAt(item.postedAt),
        status: item.reversalOfLedgerId ? 'reversed' : 'posted',
      }));
    }

    if (!hook?.data?.data?.length) {
      return config.rows;
    }

    return hook.data.data.map((item) => ({
      id: item.id,
      href: `${config.contract.route}/${item.id}`,
      docNo: item.docNo,
      qty: item.totalQty,
      amount: item.totalAmount,
      status: item.status,
      warehouse: 'API',
    }));
  }, [
    config,
    hook?.data,
    inventoryBalanceHook.data,
    inventoryLedgerHook.data,
    isInventoryLedgerRoute,
    isInventoryRoute,
  ]);

  const [selectedId, setSelectedId] = useState(rows[0]?.id ?? '');

  useEffect(() => {
    if (rows.length === 0) {
      setSelectedId('');
      return;
    }

    setSelectedId((previous) => {
      if (!previous) {
        return rows[0]!.id;
      }

      const exists = rows.some((row) => row.id === previous);
      return exists ? previous : rows[0]!.id;
    });
  }, [rows]);

  const inventoryPagination = useMemo(() => {
    if (isInventoryRoute) {
      return {
        page: inventoryBalanceHook.data?.page ?? queryState.page,
        pageSize: inventoryBalanceHook.data?.pageSize ?? queryState.pageSize,
        total: inventoryBalanceHook.data?.total ?? 0,
        totalPages: inventoryBalanceHook.data?.totalPages ?? 0,
      };
    }

    if (isInventoryLedgerRoute) {
      return {
        page: inventoryLedgerHook.data?.page ?? queryState.page,
        pageSize: inventoryLedgerHook.data?.pageSize ?? queryState.pageSize,
        total: inventoryLedgerHook.data?.total ?? 0,
        totalPages: inventoryLedgerHook.data?.totalPages ?? 0,
      };
    }

    return null;
  }, [
    inventoryBalanceHook.data,
    inventoryLedgerHook.data,
    isInventoryLedgerRoute,
    isInventoryRoute,
    queryState.page,
    queryState.pageSize,
  ]);

  const inventoryQueryError = isInventoryRoute
    ? (inventoryQueryValidationError ?? inventoryBalanceHook.error)
    : isInventoryLedgerRoute
      ? inventoryLedgerHook.error
      : null;
  const selectedRow = rows.find((row) => row.id === selectedId) ?? rows[0];

  const description = useMemo(() => {
    if (isInventoryRoute) {
      return inventoryQueryError
        ? `库存接口请求失败：${inventoryQueryError}`
        : '已接入 /api/bff/inventory/balances，展示真实库存余额。';
    }

    if (isInventoryLedgerRoute) {
      return inventoryQueryError
        ? `库存流水接口请求失败：${inventoryQueryError}`
        : '已接入 /api/bff/inventory/ledger，展示真实库存流水。';
    }

    return hook?.error
      ? `接口不可用，当前展示装配种子数据：${hook.error}`
      : '已接入 hooks 层；如接口有数据将优先展示真实返回。';
  }, [
    hook?.error,
    inventoryQueryError,
    isInventoryLedgerRoute,
    isInventoryRoute,
  ]);

  const loading = isInventoryRoute
    ? inventoryBalanceHook.loading
    : isInventoryLedgerRoute
      ? inventoryLedgerHook.loading
      : Boolean(hook?.loading);
  const canPaginateInventory = isInventoryRoute || isInventoryLedgerRoute;
  const totalPages = inventoryPagination?.totalPages ?? 0;
  const canGoPrevious = canPaginateInventory && (inventoryPagination?.page ?? 1) > 1;
  const canGoNext =
    canPaginateInventory &&
    totalPages > 0 &&
    (inventoryPagination?.page ?? 1) < totalPages;
  const handleReload = () => {
    if (isInventoryRoute) {
      inventoryBalanceHook.reload();
      return;
    }

    if (isInventoryLedgerRoute) {
      inventoryLedgerHook.reload();
      return;
    }

    hook?.reload();
  };
  const handleResetInventoryQuery = () => {
    replaceInventoryQuery(
      {
        skuId: '',
        warehouseId: '',
        docType: '',
        page: DEFAULT_PAGE,
        pageSize: DEFAULT_PAGE_SIZE,
      },
      { resetPage: true },
    );
  };

  return (
    <WorkbenchLayout
      contract={config.contract}
      toolbarSlot={
        isInventoryRoute || isInventoryLedgerRoute ? (
          <InventoryToolbar
            route={route as InventoryWorkbenchRoute}
            state={queryState}
            validationError={inventoryQueryValidationError}
            onSubmit={handleInventoryFilterSubmit}
            onReset={handleResetInventoryQuery}
          />
        ) : (
          <ToolbarCard config={config} />
        )
      }
      resultsSlot={
        <SurfaceCard
          title="列表结果"
          description={description}
          actions={loading ? <TemplateBadge label="加载中" tone="info" /> : undefined}
        >
          {inventoryQueryError ? (
            <div style={{ display: 'grid', gap: 12 }}>
              <EmptyState title="查询失败" description={inventoryQueryError} />
              {inventoryQueryValidationError ? null : (
                <button
                  type="button"
                  onClick={handleReload}
                  style={{
                    justifySelf: 'start',
                    border: '1px solid rgba(224,221,214,0.92)',
                    borderRadius: 10,
                    padding: '8px 14px',
                    background: 'rgba(255,255,255,0.92)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  重试
                </button>
              )}
            </div>
          ) : !loading && rows.length === 0 ? (
            <EmptyState
              title="暂无数据"
              description="当前筛选条件未命中记录，可调整筛选后重试。"
            />
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {config.columns.map((column) => (
                      <th key={column.key} style={styles.th}>
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedId(row.id)}
                      style={{
                        background:
                          row.id === selectedId
                            ? 'rgba(192,90,60,0.08)'
                            : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      {config.columns.map((column) => (
                        <td key={column.key} style={styles.td}>
                          {renderCell(row, column)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {canPaginateInventory && inventoryPagination ? (
            <div
              style={{
                marginTop: 12,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 8,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                共 {inventoryPagination.total} 条，当前第 {inventoryPagination.page} /{' '}
                {Math.max(inventoryPagination.totalPages, 1)} 页
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  disabled={!canGoPrevious}
                  onClick={() =>
                    replaceInventoryQuery({
                      page: Math.max(
                        DEFAULT_PAGE,
                        (inventoryPagination.page ?? DEFAULT_PAGE) - 1,
                      ),
                    })
                  }
                  style={{
                    border: '1px solid rgba(224,221,214,0.92)',
                    borderRadius: 10,
                    padding: '6px 12px',
                    background: canGoPrevious
                      ? 'rgba(255,255,255,0.92)'
                      : 'rgba(245,243,239,0.8)',
                    color: canGoPrevious
                      ? 'var(--color-text-primary)'
                      : 'var(--color-text-muted)',
                    cursor: canGoPrevious ? 'pointer' : 'not-allowed',
                  }}
                >
                  上一页
                </button>
                <button
                  type="button"
                  disabled={!canGoNext}
                  onClick={() =>
                    replaceInventoryQuery({
                      page: (inventoryPagination.page ?? DEFAULT_PAGE) + 1,
                    })
                  }
                  style={{
                    border: '1px solid rgba(224,221,214,0.92)',
                    borderRadius: 10,
                    padding: '6px 12px',
                    background: canGoNext
                      ? 'rgba(255,255,255,0.92)'
                      : 'rgba(245,243,239,0.8)',
                    color: canGoNext
                      ? 'var(--color-text-primary)'
                      : 'var(--color-text-muted)',
                    cursor: canGoNext ? 'pointer' : 'not-allowed',
                  }}
                >
                  下一页
                </button>
              </div>
            </div>
          ) : null}
        </SurfaceCard>
      }
      detailSlot={
        selectedRow ? (
          <SurfaceCard title="选中摘要" description="用于模拟 T2 详情抽屉。">
            <div style={{ display: 'grid', gap: 10 }}>
              {config.drawerFields.map((field) => (
                <div key={field.key} style={styles.fieldCard}>
                  <div style={styles.fieldLabel}>{field.label}</div>
                  <div style={styles.fieldValue}>{selectedRow[field.key] ?? '-'}</div>
                </div>
              ))}
              {selectedRow.href ? (
                <Link href={selectedRow.href} style={{ color: 'var(--color-terracotta)', textDecoration: 'none', fontWeight: 650 }}>
                  打开详情页 →
                </Link>
              ) : null}
            </div>
          </SurfaceCard>
        ) : (
          <EmptyState title="暂无选中行" description="选择一条记录后可查看摘要。" />
        )
      }
      bulkBarSlot={
        <SurfaceCard title="批量操作提示" description={config.bulkHint}>
          <TemplateBadge label="T2 Workbench" tone="info" />
        </SurfaceCard>
      }
    />
  );
}

export function DetailAssembly({ config, entityId }: { config: DetailAssemblyConfig; entityId: string }) {
  const detailHook = useDocumentDetail(config.docType, entityId);
  const evidenceHook = useDocumentEvidence(config.entityType, entityId);
  const liveRecord = detailHook?.data;
  const rows = liveRecord?.lines?.length
    ? liveRecord.lines.map((line) => ({
        id: line.id,
        sku: line.skuId,
        expected: line.qty,
        actual: line.qty,
        diff: '0',
        status: 'ok',
      }))
    : config.record.rows;
  const lineContexts = liveRecord?.lines?.length
    ? liveRecord.lines.map((line) => ({
        lineId: line.id,
        lineNo: line.lineNo,
        skuCode: line.skuId,
        skuName: line.skuId,
        expectedQty: line.qty,
        actualQty: line.qty,
        diffQty: '0',
      }))
    : config.record.lineEvidenceContexts;
  const [activeLineId, setActiveLineId] = useState(lineContexts[0]?.lineId ?? '');
  const lineContext = lineContexts.find((item) => item.lineId === activeLineId) ?? lineContexts[0];
  const lineEvidenceHook = useLineEvidence(config.entityType, entityId, lineContext?.lineId);
  const [actionNotice, setActionNotice] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<'confirm' | 'post' | 'cancel' | null>(null);
  const [uploadingScope, setUploadingScope] = useState<'document' | 'line' | null>(null);
  const documentEvidence = evidenceHook.data ?? config.record.documentEvidence;
  const lineEvidence =
    (lineContext ? lineEvidenceHook.data : null) ??
    (lineContext ? config.record.lineEvidence[lineContext.lineId] : null);

  useEffect(() => {
    if (lineContexts.length === 0) {
      setActiveLineId('');
      return;
    }

    setActiveLineId((previous) => {
      if (!previous) {
        return lineContexts[0]!.lineId;
      }
      return lineContexts.some((item) => item.lineId === previous)
        ? previous
        : lineContexts[0]!.lineId;
    });
  }, [lineContexts]);

  const handleAction = async (action: 'confirm' | 'post' | 'cancel') => {
    if (!config.docType) {
      setActionNotice('当前详情页未绑定 docType，无法执行动作联调。');
      return;
    }

    try {
      setActionNotice('');
      setActionLoading(action);
      const result = await submitDocumentCommand(
        config.docType,
        entityId,
        action,
        idempotencyKey(`doc-${config.docType}-${entityId}-${action}`),
      );
      setActionNotice(`动作成功：${action} -> ${result.status}`);
      detailHook?.reload();
    } catch (error) {
      setActionNotice(error instanceof Error ? error.message : `${action} 失败`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUploadEvidence = async (scope: 'document' | 'line') => {
    if (scope === 'line' && !lineContext) {
      setActionNotice('请先选中一行再上传行级凭证。');
      return;
    }

    try {
      setActionNotice('');
      setUploadingScope(scope);
      const tag = scope === 'document' ? 'packing_list' : 'damage';
      const intent = await createEvidenceUploadIntent({
        entityType: config.entityType,
        entityId,
        scope,
        lineRef: scope === 'line' ? lineContext?.lineId : undefined,
        tag,
        fileName: `${config.entityType}-${entityId}-${scope}-${Date.now()}.txt`,
        contentType: 'text/plain',
        sizeBytes: '1',
      });

      await attachEvidence({
        assetId: intent.assetId,
        entityType: config.entityType,
        entityId,
        scope,
        lineRef: scope === 'line' ? lineContext?.lineId : undefined,
        tag,
        note: 'frontend linked evidence',
      });

      if (scope === 'document') {
        evidenceHook.reload();
      } else {
        lineEvidenceHook.reload();
      }

      setActionNotice(scope === 'document' ? '单据级凭证上传成功。' : '行级凭证上传成功。');
    } catch (error) {
      setActionNotice(error instanceof Error ? error.message : '凭证上传失败');
    } finally {
      setUploadingScope(null);
    }
  };

  return (
    <DetailLayout
      contract={{
        ...config.contract,
        header: {
          ...config.contract.header,
          title: `${config.contract.header.title} · ${entityId}`,
        },
      }}
      activeTabKey="lines"
      primarySlot={
        <SurfaceCard title={config.record.title} description={detailHook?.error ? `接口不可用，展示装配数据：${detailHook.error}` : config.record.subtitle}>
          <div style={{ display: 'grid', gap: 14 }}>
            {config.record.primaryGroups.map((group) => (
              <div key={group.key}>
                <div style={{ fontSize: 14, fontWeight: 650, marginBottom: 10 }}>{group.title}</div>
                <div style={styles.fieldGrid}>
                  {group.fields.map((field) => (
                    <div key={field.key} style={styles.fieldCard}>
                      <div style={styles.fieldLabel}>{field.label}</div>
                      <div style={styles.fieldValue}>{field.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>
      }
      secondarySlot={
        <SurfaceCard title="异常与影响" description="围绕差异、过账和凭证完整度提供侧重点。">
          <div style={{ display: 'grid', gap: 14 }}>
            {config.record.secondaryGroups.map((group) => (
              <div key={group.key}>
                <div style={{ fontSize: 14, fontWeight: 650, marginBottom: 10 }}>{group.title}</div>
                <div style={styles.fieldGrid}>
                  {group.fields.map((field) => (
                    <div key={field.key} style={styles.fieldCard}>
                      <div style={styles.fieldLabel}>{field.label}</div>
                      <div style={styles.fieldValue}>{field.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>
      }
      tertiarySlot={
        <SurfaceCard title="操作提示" description="阶段 2 联调时，这里用于展示权限/审计拦截。">
          <div style={{ display: 'grid', gap: 10 }}>
            {config.record.tertiaryNotes.map((note) => (
              <div key={note} style={{ ...styles.fieldCard, fontSize: 13, lineHeight: 1.6 }}>
                {note}
              </div>
            ))}
          </div>
        </SurfaceCard>
      }
      tabContentSlot={
        <div style={{ display: 'grid', gap: 18 }}>
          <SurfaceCard title="SKU 明细" description="点击差异行可查看 line evidence。">
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>SKU</th>
                    <th style={styles.th}>期望</th>
                    <th style={styles.th}>实际</th>
                    <th style={styles.th}>差异</th>
                    <th style={styles.th}>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} onClick={() => setActiveLineId(row.id)} style={{ cursor: 'pointer' }}>
                      <td style={styles.td}>{row.sku}</td>
                      <td style={styles.td}>{row.expected}</td>
                      <td style={styles.td}>{row.actual}</td>
                      <td style={styles.td}>{row.diff}</td>
                      <td style={styles.td}>
                        <TemplateBadge label={row.status ?? '-'} tone={toTone(row.status)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SurfaceCard>

          <div style={styles.grid2}>
            <EvidencePanel
              title="单据级凭证"
              description="document evidence 面板"
              stats={documentEvidence.stats}
              tags={documentEvidence.tags}
              items={documentEvidence.items}
              activeTag="packing_list"
              uploadSlot={(
                <button
                  type="button"
                  disabled={uploadingScope === 'document'}
                  onClick={() => void handleUploadEvidence('document')}
                  style={{
                    border: '1px solid rgba(224,221,214,0.92)',
                    background: 'rgba(255,255,255,0.72)',
                    borderRadius: 10,
                    padding: '8px 10px',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 650,
                  }}
                >
                  {uploadingScope === 'document' ? '上传中...' : '上传单据凭证'}
                </button>
              )}
            />
            {lineContext ? (
              <LineEvidenceDrawer
                open
                title="差异行凭证抽屉"
                line={lineContext}
                tags={lineEvidence?.tags ?? []}
                activeTag="damage"
                items={lineEvidence?.items ?? []}
                uploadSlot={(
                  <button
                    type="button"
                    disabled={uploadingScope === 'line'}
                    onClick={() => void handleUploadEvidence('line')}
                    style={{
                      border: '1px solid rgba(224,221,214,0.92)',
                      background: 'rgba(255,255,255,0.72)',
                      borderRadius: 10,
                      padding: '8px 10px',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 650,
                    }}
                  >
                    {uploadingScope === 'line' ? '上传中...' : '上传行级凭证'}
                  </button>
                )}
              />
            ) : (
              <EmptyState title="暂无行级凭证" description="当前明细没有可展示的差异行。" />
            )}
          </div>

          <SurfaceCard title="审计轨迹" description="保留显式状态流转与操作责任人。">
            <div style={{ display: 'grid', gap: 10 }}>
              {config.record.auditTrail.map((item) => (
                <div key={item} style={styles.fieldCard}>
                  {item}
                </div>
              ))}
            </div>
          </SurfaceCard>
        </div>
      }
      quickActionsSlot={
        <SurfaceCard title="快捷动作" description="详情页右侧动作位，已接入单据动作联调。">
          <div style={{ display: 'grid', gap: 10 }}>
            <HeaderActions primaryAction={config.contract.header.primaryAction} secondaryActions={config.contract.header.secondaryActions} />
            {config.docType ? (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {(['confirm', 'post', 'cancel'] as const).map((action) => (
                  <button
                    key={action}
                    type="button"
                    disabled={Boolean(actionLoading)}
                    onClick={() => void handleAction(action)}
                    style={{
                      border: '1px solid rgba(224,221,214,0.92)',
                      background: action === 'post' ? 'rgba(192,90,60,0.10)' : 'rgba(255,255,255,0.72)',
                      borderRadius: 10,
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontWeight: 650,
                    }}
                  >
                    {actionLoading === action ? '处理中...' : action.toUpperCase()}
                  </button>
                ))}
              </div>
            ) : null}
            {actionNotice ? (
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                {actionNotice}
              </div>
            ) : null}
          </div>
        </SurfaceCard>
      }
    />
  );
}

export function WizardAssembly({ config }: { config: WizardAssemblyConfig }) {
  const [activeLineId, setActiveLineId] = useState(config.lineEvidenceContexts[0]?.lineId ?? '');
  const lineContext = config.lineEvidenceContexts.find((item) => item.lineId === activeLineId) ?? config.lineEvidenceContexts[0];
  const [submitting, setSubmitting] = useState(false);
  const [submitNotice, setSubmitNotice] = useState<string>('');

  const headerFieldMap = useMemo(() => {
    const map = new Map<string, string>();
    config.headerGroups.forEach((group) => {
      group.fields.forEach((field) => {
        if (field.value.trim().length > 0) {
          map.set(field.key, field.value.trim());
        }
      });
    });
    return map;
  }, [config.headerGroups]);

  const handleCreate = async () => {
    if (!config.docType) {
      setSubmitNotice('当前向导未绑定 docType，仅作为模板预览。');
      return;
    }

    const normalizeDecimal = (value?: string): string | undefined => {
      if (!value) {
        return undefined;
      }
      const normalized = value.replace(/,/g, '').trim();
      return normalized.length > 0 ? normalized : undefined;
    };

    const pickQty = (row: AssemblyRow): string | undefined => {
      if (config.docType === 'ADJ') {
        return normalizeDecimal(getRowValue(row, ['diff', 'actual', 'expected', 'quantity', 'qty']));
      }

      if (config.docType === 'GRN' || config.docType === 'OUT') {
        return normalizeDecimal(getRowValue(row, ['actual', 'expected', 'quantity', 'qty', 'diff']));
      }

      return normalizeDecimal(getRowValue(row, ['expected', 'quantity', 'qty', 'actual', 'diff']));
    };

    const lines = config.rows
      .map((row) => ({
        skuId: getRowValue(row, ['skuId', 'sku', 'code']),
        qty: pickQty(row),
        unitPrice: normalizeDecimal(getRowValue(row, ['unitPrice', 'price'])),
      }))
      .filter((line): line is { skuId: string; qty: string; unitPrice: string | undefined } => Boolean(line.skuId && line.qty));

    if (lines.length === 0) {
      setSubmitNotice('没有可提交的有效明细行。');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitNotice('');

      const payload: {
        docType: typeof config.docType;
        docDate: string;
        remarks: string;
        warehouseId?: string;
        supplierId?: string;
        customerId?: string;
        sourceDocId?: string;
        lines: Array<{ skuId: string; qty: string; unitPrice?: string }>;
      } = {
        docType: config.docType,
        docDate: new Date().toISOString().slice(0, 10),
        remarks: `created from wizard ${config.contract.route}`,
        lines,
      };

      const warehouse = headerFieldMap.get('warehouse');
      if (warehouse) {
        payload.warehouseId = warehouse;
      }

      if (config.docType === 'PO') {
        payload.supplierId = headerFieldMap.get('supplier') ?? headerFieldMap.get('vendor');
      }

      if (config.docType === 'SO') {
        payload.customerId = headerFieldMap.get('customer');
      }

      if (config.docType === 'GRN') {
        payload.sourceDocId = headerFieldMap.get('po') ?? headerFieldMap.get('sourceNo');
      }

      if (config.docType === 'OUT') {
        payload.sourceDocId = headerFieldMap.get('so') ?? headerFieldMap.get('sourceNo');
      }

      const result = await createDocument(
        payload,
        idempotencyKey(`doc-create-${config.docType}`),
      );

      setSubmitNotice(`创建成功：${result.docNo}，即将跳转详情。`);
      const detailBase = config.contract.route.replace(/\/new$/, '');
      window.location.href = `${detailBase}/${result.id}`;
    } catch (error) {
      setSubmitNotice(error instanceof Error ? error.message : '创建失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <WizardLayout
      contract={config.contract}
      editorSlot={
        <div style={{ display: 'grid', gap: 18 }}>
          {config.headerGroups.map((group) => (
            <SurfaceCard key={group.key} title={group.title} description={group.description}>
              <div style={styles.fieldGrid}>
                {group.fields.map((field) => (
                  <div key={field.key} style={styles.fieldCard}>
                    <div style={styles.fieldLabel}>{field.label}</div>
                    <div style={styles.fieldValue}>{field.value}</div>
                  </div>
                ))}
              </div>
            </SurfaceCard>
          ))}

          <SurfaceCard title="SKU 明细录入" description="当前用装配数据模拟表格；阶段 2 接真接口后保持同一模板壳。">
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {Object.keys(config.rows[0] ?? {})
                      .filter((key) => key !== 'id' && key !== 'href')
                      .map((key) => (
                        <th key={key} style={styles.th}>
                          {key}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {config.rows.map((row) => (
                    <tr key={row.id} onClick={() => setActiveLineId(row.id)} style={{ cursor: 'pointer' }}>
                      {Object.entries(row)
                        .filter(([key]) => key !== 'id' && key !== 'href')
                        .map(([key, value]) => (
                          <td key={key} style={styles.td}>
                            {key === 'status' ? <TemplateBadge label={value ?? '-'} tone={toTone(value)} /> : value}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SurfaceCard>

          <SurfaceCard title="差异与规则" description="和 `miniERP_evidence_system` 一致的差异约束。">
            <div style={{ display: 'grid', gap: 10 }}>
              {config.alerts.map((alert) => (
                <div key={alert} style={{ ...styles.fieldCard, fontSize: 13, lineHeight: 1.6 }}>
                  {alert}
                </div>
              ))}
            </div>
          </SurfaceCard>
        </div>
      }
      summarySlot={
        <div style={{ display: 'grid', gap: 18 }}>
          <SurfaceCard title="单据级凭证" description="右侧 summary 区保持 Evidence 入口可见。">
            <EvidencePanel
              title="Document Evidence"
              stats={config.documentEvidence.stats}
              tags={config.documentEvidence.tags}
              items={config.documentEvidence.items}
              activeTag="label"
              uploadSlot={<TemplateBadge label="HTTP /api/bff/evidence" tone="info" />}
            />
          </SurfaceCard>

          {lineContext ? (
            <LineEvidenceDrawer
              open
              title="行级差异凭证"
              line={lineContext}
              tags={config.lineEvidence[lineContext.lineId]?.tags ?? []}
              activeTag="damage"
              items={config.lineEvidence[lineContext.lineId]?.items ?? []}
              uploadSlot={<TemplateBadge label="Line Evidence" tone="warning" />}
            />
          ) : null}

          <SurfaceCard title="提交说明" description="阶段 1 完成后用于 FE-F-READY 收口。">
            <div style={{ display: 'grid', gap: 10 }}>
              {config.summaryNotes.map((note) => (
                <div key={note} style={{ ...styles.fieldCard, fontSize: 13, lineHeight: 1.6 }}>
                  {note}
                </div>
              ))}
              <button
                type="button"
                disabled={submitting}
                onClick={() => void handleCreate()}
                style={{
                  border: '1px solid var(--color-terracotta)',
                  background: 'var(--color-terracotta)',
                  color: '#fff',
                  borderRadius: 10,
                  padding: '10px 12px',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                {submitting ? '提交中...' : config.docType ? '创建单据并进入详情' : '模板页（未绑定 docType）'}
              </button>
              {submitNotice ? (
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  {submitNotice}
                </div>
              ) : null}
            </div>
          </SurfaceCard>
        </div>
      }
    />
  );
}
