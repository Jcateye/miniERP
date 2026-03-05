'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { PageFrame, SurfaceCard, TemplateBadge, styles } from '@/components/layouts';

type EntityKey = 'sku' | 'warehouse' | 'supplier' | 'customer';

type Sku = {
  id: string;
  code: string;
  name: string;
  specification: string | null;
  baseUnit: string;
  isActive: boolean;
};

type Warehouse = {
  id: string;
  code: string;
  name: string;
  address: string | null;
  contactPerson: string | null;
  contactPhone: string | null;
  isActive: boolean;
};

type Supplier = {
  id: string;
  code: string;
  name: string;
  contactPerson: string | null;
  contactPhone: string | null;
  email: string | null;
  address: string | null;
  isActive: boolean;
};

type Customer = {
  id: string;
  code: string;
  name: string;
  contactPerson: string | null;
  contactPhone: string | null;
  email: string | null;
  address: string | null;
  isActive: boolean;
};

type FormState = {
  code: string;
  name: string;
  extra: string;
};

function randomKey(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      payload?.error?.message ||
      payload?.message ||
      `Request failed (${response.status})`;
    throw new Error(message);
  }

  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data as T;
  }

  return payload as T;
}

function EntitySwitch({
  active,
  onChange,
}: {
  active: EntityKey;
  onChange: (value: EntityKey) => void;
}) {
  const items: Array<{ key: EntityKey; label: string }> = [
    { key: 'sku', label: 'SKU' },
    { key: 'warehouse', label: '仓库' },
    { key: 'supplier', label: '供应商' },
    { key: 'customer', label: '客户' },
  ];

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onChange(item.key)}
          style={{
            border: active === item.key ? '1px solid rgba(192,90,60,0.42)' : '1px solid rgba(224,221,214,0.92)',
            background: active === item.key ? 'rgba(255,248,244,0.9)' : 'rgba(255,255,255,0.72)',
            color: 'var(--color-text-primary)',
            borderRadius: 12,
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: active === item.key ? 700 : 600,
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export default function MasterDataPage() {
  const [active, setActive] = useState<EntityKey>('sku');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string>('');

  const [skus, setSkus] = useState<Sku[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [forms, setForms] = useState<Record<EntityKey, FormState>>({
    sku: { code: '', name: '', extra: '' },
    warehouse: { code: '', name: '', extra: '' },
    supplier: { code: '', name: '', extra: '' },
    customer: { code: '', name: '', extra: '' },
  });

  const updateForm = (entity: EntityKey, patch: Partial<FormState>) => {
    setForms((previous) => ({
      ...previous,
      [entity]: {
        ...previous[entity],
        ...patch,
      },
    }));
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    setNotice('');
    try {
      const [skuData, warehouseData, supplierData, customerData] = await Promise.all([
        requestJson<Sku[]>('/api/bff/skus'),
        requestJson<Warehouse[]>('/api/bff/warehouses'),
        requestJson<Supplier[]>('/api/bff/suppliers'),
        requestJson<Customer[]>('/api/bff/customers'),
      ]);

      setSkus(skuData ?? []);
      setWarehouses(warehouseData ?? []);
      setSuppliers(supplierData ?? []);
      setCustomers(customerData ?? []);
      setNotice('主数据已刷新。');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  const activeCount = useMemo(() => {
    if (active === 'sku') return skus.length;
    if (active === 'warehouse') return warehouses.length;
    if (active === 'supplier') return suppliers.length;
    return customers.length;
  }, [active, customers.length, skus.length, suppliers.length, warehouses.length]);

  const createRecord = useCallback(async () => {
    const form = forms[active];
    if (!form.code.trim() || !form.name.trim()) {
      setNotice('code 和 name 为必填项。');
      return;
    }

    try {
      setLoading(true);

      if (active === 'sku') {
        await requestJson('/api/bff/skus', {
          method: 'POST',
          headers: { 'Idempotency-Key': randomKey('sku-create') },
          body: JSON.stringify({
            code: form.code.trim(),
            name: form.name.trim(),
            specification: form.extra.trim() || null,
            baseUnit: 'PCS',
          }),
        });
      } else if (active === 'warehouse') {
        await requestJson('/api/bff/warehouses', {
          method: 'POST',
          body: JSON.stringify({
            code: form.code.trim(),
            name: form.name.trim(),
            address: form.extra.trim() || null,
          }),
        });
      } else if (active === 'supplier') {
        await requestJson('/api/bff/suppliers', {
          method: 'POST',
          body: JSON.stringify({
            code: form.code.trim(),
            name: form.name.trim(),
            contactPerson: form.extra.trim() || null,
          }),
        });
      } else {
        await requestJson('/api/bff/customers', {
          method: 'POST',
          body: JSON.stringify({
            code: form.code.trim(),
            name: form.name.trim(),
            contactPerson: form.extra.trim() || null,
          }),
        });
      }

      updateForm(active, { code: '', name: '', extra: '' });
      await loadAll();
      setNotice('创建成功。');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : '创建失败');
    } finally {
      setLoading(false);
    }
  }, [active, forms, loadAll]);

  const updateName = useCallback(
    async (id: string, currentName: string) => {
      const nextName = window.prompt('请输入新的名称：', currentName)?.trim();
      if (!nextName || nextName === currentName) {
        return;
      }

      try {
        setLoading(true);
        if (active === 'sku') {
          await requestJson(`/api/bff/skus/${id}`, {
            method: 'PUT',
            headers: { 'Idempotency-Key': randomKey('sku-update') },
            body: JSON.stringify({ name: nextName }),
          });
        } else if (active === 'warehouse') {
          await requestJson(`/api/bff/warehouses/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ name: nextName }),
          });
        } else if (active === 'supplier') {
          await requestJson(`/api/bff/suppliers/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ name: nextName }),
          });
        } else {
          await requestJson(`/api/bff/customers/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ name: nextName }),
          });
        }

        await loadAll();
        setNotice('更新成功。');
      } catch (error) {
        setNotice(error instanceof Error ? error.message : '更新失败');
      } finally {
        setLoading(false);
      }
    },
    [active, loadAll],
  );

  const removeRecord = useCallback(
    async (id: string) => {
      const ok = window.confirm('确认删除该记录？');
      if (!ok) {
        return;
      }

      try {
        setLoading(true);
        if (active === 'sku') {
          await requestJson(`/api/bff/skus/${id}`, { method: 'DELETE' });
        } else if (active === 'warehouse') {
          await requestJson(`/api/bff/warehouses/${id}`, { method: 'DELETE' });
        } else if (active === 'supplier') {
          await requestJson(`/api/bff/suppliers/${id}`, { method: 'DELETE' });
        } else {
          await requestJson(`/api/bff/customers/${id}`, { method: 'DELETE' });
        }

        await loadAll();
        setNotice('删除成功。');
      } catch (error) {
        setNotice(error instanceof Error ? error.message : '删除失败');
      } finally {
        setLoading(false);
      }
    },
    [active, loadAll],
  );

  const rows = useMemo(() => {
    if (active === 'sku') return skus.map((item) => ({ id: item.id, code: item.code, name: item.name, extra: item.specification ?? '-' }));
    if (active === 'warehouse') return warehouses.map((item) => ({ id: item.id, code: item.code, name: item.name, extra: item.address ?? '-' }));
    if (active === 'supplier') return suppliers.map((item) => ({ id: item.id, code: item.code, name: item.name, extra: item.contactPerson ?? '-' }));
    return customers.map((item) => ({ id: item.id, code: item.code, name: item.name, extra: item.contactPerson ?? '-' }));
  }, [active, customers, skus, suppliers, warehouses]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  return (
    <PageFrame>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>主数据配置（CRUD）</h1>
          <p style={styles.description}>
            这里打通了 SKU / 仓库 / 供应商 / 客户的创建、更新、删除链路，直接走 BFF 与后端接口。
          </p>
          <div style={styles.metaRow}>
            <TemplateBadge label={`当前模块：${active.toUpperCase()}`} tone="info" />
            <TemplateBadge label={`记录数：${activeCount}`} tone="success" />
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gap: 18 }}>
        <SurfaceCard
          title="模块切换"
          description="切换后可在下方执行对应主数据模块的 CRUD。"
          actions={
            <button
              type="button"
              onClick={() => void loadAll()}
              style={{
                border: '1px solid rgba(224,221,214,0.92)',
                background: 'rgba(255,255,255,0.72)',
                borderRadius: 10,
                padding: '8px 12px',
                cursor: 'pointer',
                fontWeight: 650,
              }}
            >
              {loading ? '加载中...' : '刷新'}
            </button>
          }
        >
          <EntitySwitch active={active} onChange={setActive} />
          {notice ? (
            <div style={{ marginTop: 12, fontSize: 13, color: 'var(--color-text-secondary)' }}>
              {notice}
            </div>
          ) : null}
        </SurfaceCard>

        <SurfaceCard title="新建记录" description="最小字段：code + name。extra 字段按模块含义复用。">
          <div style={{ ...styles.fieldGrid, gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
            <input
              value={forms[active].code}
              onChange={(event) => updateForm(active, { code: event.target.value })}
              placeholder="code"
              style={{ ...styles.fieldCard, border: '1px solid rgba(224,221,214,0.92)' }}
            />
            <input
              value={forms[active].name}
              onChange={(event) => updateForm(active, { name: event.target.value })}
              placeholder="name"
              style={{ ...styles.fieldCard, border: '1px solid rgba(224,221,214,0.92)' }}
            />
            <input
              value={forms[active].extra}
              onChange={(event) => updateForm(active, { extra: event.target.value })}
              placeholder={
                active === 'sku'
                  ? 'specification'
                  : active === 'warehouse'
                    ? 'address'
                    : 'contactPerson'
              }
              style={{ ...styles.fieldCard, border: '1px solid rgba(224,221,214,0.92)' }}
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <button
              type="button"
              onClick={() => void createRecord()}
              style={{
                border: '1px solid var(--color-terracotta)',
                background: 'var(--color-terracotta)',
                color: '#fff',
                borderRadius: 10,
                padding: '8px 14px',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              创建
            </button>
          </div>
        </SurfaceCard>

        <SurfaceCard title="数据列表" description="支持更新名称与删除。">
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>CODE</th>
                  <th style={styles.th}>NAME</th>
                  <th style={styles.th}>EXTRA</th>
                  <th style={styles.th}>操作</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td style={styles.td}>{row.id}</td>
                    <td style={styles.td}>{row.code}</td>
                    <td style={styles.td}>{row.name}</td>
                    <td style={styles.td}>{row.extra}</td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => void updateName(row.id, row.name)}
                          style={{
                            border: '1px solid rgba(224,221,214,0.92)',
                            background: 'rgba(255,255,255,0.72)',
                            borderRadius: 8,
                            padding: '6px 10px',
                            cursor: 'pointer',
                          }}
                        >
                          更新
                        </button>
                        <button
                          type="button"
                          onClick={() => void removeRecord(row.id)}
                          style={{
                            border: '1px solid rgba(217,79,79,0.22)',
                            background: 'rgba(217,79,79,0.12)',
                            color: 'var(--color-error)',
                            borderRadius: 8,
                            padding: '6px 10px',
                            cursor: 'pointer',
                          }}
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td style={styles.td} colSpan={5}>
                      暂无数据，请先点击刷新或创建记录。
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </SurfaceCard>
      </div>
    </PageFrame>
  );
}
