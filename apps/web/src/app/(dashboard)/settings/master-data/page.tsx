'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { ActionButton, DataTable, PageHeader } from '@/components/ui';

import {
  buildApiPath,
  buildQueryString,
  emptyFormValues,
  MASTER_DATA_TABS,
  parseFilters,
  parseTab,
  type MasterDataEntity,
  type MasterDataFilters,
  type MasterDataFormValues,
  type MasterDataListResponse,
  type MasterDataOperation,
  type MasterDataTab,
  tabConfigs,
} from './master-data-config';
import { MasterDataFormCard } from './master-data-form-card';
import { hasActiveFilters, requestJson, validateForm } from './master-data-page-utils';
import { MasterDataToolbar } from './master-data-toolbar';

function inferTabFromPathname(pathname: string): MasterDataTab | null {
  if (pathname.endsWith('/mdm/customers')) {
    return 'customers';
  }

  if (pathname.endsWith('/mdm/suppliers')) {
    return 'suppliers';
  }

  if (pathname.endsWith('/mdm/warehouses')) {
    return 'warehouses';
  }

  return null;
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div
      style={{
        display: 'grid',
        gap: 8,
        padding: '28px 24px',
        borderRadius: 8,
        background: '#FFFFFF',
        border: '1px solid #E0DDD8',
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A' }}>{title}</div>
      <div style={{ fontSize: 13, color: '#666666', lineHeight: 1.6 }}>{description}</div>
    </div>
  );
}

function NoticeBanner({ message }: { message: string }) {
  return (
    <div
      style={{
        padding: '10px 14px',
        borderRadius: 8,
        background: 'rgba(92,124,138,0.08)',
        color: '#35515B',
        fontSize: 13,
        lineHeight: 1.5,
      }}
    >
      {message}
    </div>
  );
}

function MasterDataPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inferredTab = useMemo(() => inferTabFromPathname(pathname), [pathname]);

  const activeTab = useMemo<MasterDataTab>(
    () => inferredTab ?? parseTab(searchParams.get('tab')),
    [inferredTab, searchParams],
  );
  const filters = useMemo<MasterDataFilters>(() => parseFilters(searchParams), [searchParams]);
  const currentConfig = tabConfigs[activeTab];

  const [items, setItems] = useState<MasterDataEntity[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [notice, setNotice] = useState<string>('');
  const [operation, setOperation] = useState<MasterDataOperation | null>(null);
  const [draft, setDraft] = useState<MasterDataFormValues>(emptyFormValues());
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string>('');

  const rows = useMemo(() => currentConfig.toRows(items), [currentConfig, items]);
  const selectedEntity = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );
  const isMutating = submitting || Boolean(deletingId);
  const filterDirty = useMemo(
    () => hasActiveFilters(filters.code, filters.name, filters.isActive),
    [filters.code, filters.name, filters.isActive],
  );

  const closeForm = useCallback(() => {
    setOperation(null);
    setDraft(emptyFormValues());
  }, []);

  const syncUrl = useCallback(
    (nextTab: MasterDataTab, nextFilters: MasterDataFilters) => {
      const query = buildQueryString(nextTab, nextFilters);
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router],
  );

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const path = buildApiPath(currentConfig.endpoint, filters);
      const result = await requestJson<MasterDataListResponse>(path, {
        method: 'GET',
      });
      setItems(result.data);
    } catch (requestError) {
      setItems([]);
      setError(
        requestError instanceof Error ? requestError.message : '主数据加载失败',
      );
    } finally {
      setLoading(false);
    }
  }, [currentConfig.endpoint, filters]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

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

  const handleTabChange = (tab: MasterDataTab) => {
    if (tab === activeTab) {
      return;
    }

    closeForm();
    setSelectedId('');
    setNotice('');
    syncUrl(tab, { code: '', name: '', isActive: '' });
  };

  const handleSearchChange = (value: string) => {
    syncUrl(activeTab, { ...filters, name: value });
  };

  const handleCodeChange = (value: string) => {
    syncUrl(activeTab, { ...filters, code: value });
  };

  const handleStatusChange = (value: string) => {
    const nextValue = value === 'true' || value === 'false' ? value : '';
    syncUrl(activeTab, { ...filters, isActive: nextValue });
  };

  const handleResetFilters = () => {
    syncUrl(activeTab, { code: '', name: '', isActive: '' });
  };

  const openCreate = () => {
    if (isMutating) {
      return;
    }

    setOperation('create');
    setDraft(emptyFormValues());
    setNotice('');
  };

  const openEdit = () => {
    if (isMutating) {
      return;
    }

    if (!selectedEntity) {
      setNotice('请先选中一条记录再编辑。');
      return;
    }

    setOperation('edit');
    setDraft(currentConfig.toFormValues(selectedEntity));
    setNotice('');
  };

  const handleDraftChange = <K extends keyof MasterDataFormValues>(
    key: K,
    value: MasterDataFormValues[K],
  ) => {
    setDraft((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!operation) {
      return;
    }

    const validationError = validateForm(draft, operation);
    if (validationError) {
      setNotice(validationError);
      return;
    }

    setSubmitting(true);
    setNotice('');

    try {
      if (operation === 'create') {
        await requestJson(currentConfig.endpoint, {
          method: 'POST',
          body: JSON.stringify(currentConfig.buildCreatePayload(draft)),
        });
        setNotice(`${currentConfig.label}创建成功。`);
      }

      if (operation === 'edit' && selectedEntity) {
        await requestJson(`${currentConfig.endpoint}/${selectedEntity.id}`, {
          method: 'PATCH',
          body: JSON.stringify(currentConfig.buildUpdatePayload(draft)),
        });
        setNotice(`${currentConfig.label}更新成功。`);
      }

      closeForm();
      await loadItems();
    } catch (requestError) {
      setNotice(
        requestError instanceof Error ? requestError.message : '保存失败',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEntity) {
      setNotice('请先选中一条记录再删除。');
      return;
    }

    if (deletingId) {
      return;
    }

    const confirmed = window.confirm(
      `确认删除${currentConfig.label}「${selectedEntity.name}」吗？该操作可能不可恢复。`,
    );
    if (!confirmed) {
      return;
    }

    setDeletingId(selectedEntity.id);
    setNotice('');

    try {
      await requestJson(`${currentConfig.endpoint}/${selectedEntity.id}`, {
        method: 'DELETE',
      });
      setNotice(`${currentConfig.label}删除成功。`);
      await loadItems();
    } catch (requestError) {
      setNotice(
        requestError instanceof Error ? requestError.message : '删除失败',
      );
    } finally {
      setDeletingId('');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100%' }}>
      <div
        style={{
          width: 220,
          background: '#FFFFFF',
          borderRight: '1px solid #D1CCC4',
          padding: '24px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <h3
          style={{
            margin: '0 0 16px',
            padding: '0 24px',
            fontSize: 16,
            fontWeight: 700,
            fontFamily: 'var(--font-display-family), sans-serif',
          }}
        >
          主数据工作台
        </h3>
        {MASTER_DATA_TABS.map((tab) => {
          const config = tabConfigs[tab];
          const active = tab === activeTab;

          return (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              disabled={isMutating}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 24px',
                width: '100%',
                background: active ? '#F5F3EF' : 'transparent',
                borderLeft: active ? '3px solid #C05A3C' : '3px solid transparent',
                border: 'none',
                borderRight: 'none',
                borderTop: 'none',
                borderBottom: 'none',
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                color: active ? '#1a1a1a' : '#666666',
                cursor: isMutating ? 'not-allowed' : 'pointer',
                opacity: isMutating ? 0.6 : 1,
                fontFamily: 'inherit',
                textAlign: 'left',
              }}
            >
              {config.label}
            </button>
          );
        })}
      </div>

      <div
        style={{
          flex: 1,
          padding: '32px 40px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          minHeight: '100%',
        }}
      >
        <PageHeader
          title={currentConfig.title}
          subtitle={currentConfig.subtitle}
          actions={
            <ActionButton
              label={operation === 'create' ? '正在新建...' : currentConfig.createLabel}
              tone="primary"
              onClick={openCreate}
              disabled={isMutating || operation === 'create'}
            />
          }
        />

        <MasterDataToolbar
          currentConfig={currentConfig}
          deleting={Boolean(deletingId)}
          disableDelete={!selectedEntity || isMutating}
          disableEdit={!selectedEntity || isMutating || operation === 'edit'}
          disableReset={!filterDirty}
          filters={filters}
          onCodeChange={handleCodeChange}
          onDelete={handleDelete}
          onEdit={openEdit}
          onResetFilters={handleResetFilters}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
        />

        {notice ? <NoticeBanner message={notice} /> : null}

        {operation ? (
          <MasterDataFormCard
            activeTab={activeTab}
            currentConfig={currentConfig}
            draft={draft}
            operation={operation}
            submitting={submitting}
            onClose={closeForm}
            onDraftChange={handleDraftChange}
            onSubmit={handleSubmit}
          />
        ) : null}

        {loading ? (
          <EmptyState title="加载中" description="正在加载真实主数据..." />
        ) : error ? (
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
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A' }}>加载失败</div>
            <div style={{ fontSize: 13, color: '#666666', lineHeight: 1.6 }}>{error}</div>
            <div>
              <ActionButton
                label="重试"
                tone="secondary"
                onClick={() => void loadItems()}
                disabled={loading}
              />
            </div>
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            title={currentConfig.emptyTitle}
            description={currentConfig.emptyDescription}
          />
        ) : (
          <DataTable
            columns={currentConfig.columns}
            rows={rows}
            totalPages={1}
            totalItems={rows.length}
            onRowClick={(row) => setSelectedId(row.id ?? '')}
            selectedRowId={selectedId}
          />
        )}
      </div>
    </div>
  );
}

export default function MasterDataPage() {
  return (
    <Suspense fallback={null}>
      <MasterDataPageContent />
    </Suspense>
  );
}
