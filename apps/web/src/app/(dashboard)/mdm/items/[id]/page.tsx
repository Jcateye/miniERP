'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { EvidencePanel } from '@/components/evidence/evidence-panel';
import { ActionButton, PageHeader, StatusBadge, TabPanel, type Tab } from '@/components/ui';
import { formatDateTime } from '@/app/(dashboard)/skus/sku-page-utils';

type ItemDetailDto = {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  specification: string | null;
  baseUnit: string;
  categoryId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type ItemDetailResponse =
  | ItemDetailDto
  | {
      data: ItemDetailDto;
      message?: string;
    };

function getTone(isActive: boolean) {
  return isActive ? 'success' : 'danger';
}

function getStatusLabel(isActive: boolean) {
  return isActive ? '启用' : '停用';
}

function normalizePayload(payload: ItemDetailResponse): {
  item: ItemDetailDto;
  message?: string;
} {
  if ('data' in payload) {
    return { item: payload.data, message: payload.message };
  }

  return { item: payload };
}

export default function ItemDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const itemId = typeof params.id === 'string' ? params.id : '';

  const [item, setItem] = useState<ItemDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!itemId) {
      setError('缺少物料标识');
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadItem() {
      setLoading(true);
      setError('');
      setNotice('');

      try {
        const response = await fetch(`/api/bff/mdm/items/${itemId}`, {
          method: 'GET',
          cache: 'no-store',
          headers: {
            'content-type': 'application/json',
          },
        });

        const payload = (await response.json()) as ItemDetailResponse;
        if (!response.ok) {
          const message =
            typeof payload === 'object' &&
            payload !== null &&
            'error' in payload &&
            typeof payload.error === 'object' &&
            payload.error !== null &&
            'message' in payload.error &&
            typeof payload.error.message === 'string'
              ? payload.error.message
              : '物料详情加载失败';
          throw new Error(message);
        }

        if (cancelled) {
          return;
        }

        const normalized = normalizePayload(payload);
        setItem(normalized.item);
        if (normalized.message === 'fixture') {
          setNotice('当前详情来自 BFF fixture 回退数据，后端恢复后会自动切回真实数据。');
        }
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setError(
          requestError instanceof Error ? requestError.message : '物料详情加载失败',
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadItem();

    return () => {
      cancelled = true;
    };
  }, [itemId]);

  const tabs = useMemo<Tab[]>(() => {
    if (!item) {
      return [];
    }

    return [
      {
        key: 'overview',
        label: '概览',
        content: (
          <div style={{ display: 'grid', gap: 12 }}>
            {[
              { label: '物料编码', value: item.code },
              { label: '物料名称', value: item.name },
              { label: '规格', value: item.specification ?? '—' },
              { label: '基础单位', value: item.baseUnit },
              { label: '分类', value: item.categoryId ?? '未分类' },
              { label: '租户', value: item.tenantId },
            ].map((field) => (
              <div
                key={field.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 16,
                  padding: '12px 16px',
                  border: '1px solid #EAE4DC',
                  borderRadius: 8,
                  background: '#FFFFFF',
                }}
              >
                <span style={{ fontSize: 13, color: '#666666' }}>{field.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>
                  {field.value}
                </span>
              </div>
            ))}
          </div>
        ),
      },
      {
        key: 'evidence',
        label: 'Evidence',
        content: (
          <EvidencePanel
            title="物料凭证"
            description="物料主图、规格书与标签模板会统一挂在物料实体下，后续替换为真实上传链路。"
            stats={[
              { key: 'all', label: '总数', value: notice ? '1' : '0', tone: 'info' },
              { key: 'required', label: '必填缺口', value: '2', tone: 'warning' },
            ]}
            tags={[
              { key: 'item-image', label: '主图', required: true, tone: 'info' },
              { key: 'spec-sheet', label: '规格书', required: true, tone: 'warning' },
            ]}
            items={[]}
            emptySlot={
              <div style={{ fontSize: 13, color: '#666666', lineHeight: 1.6 }}>
                当前还没有挂载物料凭证；后续会复用现有 Evidence 上传意图与关联接口。
              </div>
            }
          />
        ),
      },
      {
        key: 'audit',
        label: 'Audit',
        content: (
          <div
            style={{
              display: 'grid',
              gap: 10,
              padding: 16,
              borderRadius: 8,
              background: '#FFFFFF',
              border: '1px solid #EAE4DC',
            }}
          >
            <div style={{ fontSize: 13, color: '#1A1A1A', fontWeight: 600 }}>
              创建时间：{formatDateTime(item.createdAt)}
            </div>
            <div style={{ fontSize: 13, color: '#1A1A1A', fontWeight: 600 }}>
              更新时间：{formatDateTime(item.updatedAt)}
            </div>
            <div style={{ fontSize: 13, color: '#666666', lineHeight: 1.6 }}>
              审计明细后续会接入统一 `audit_log / state_transition_log` 查询接口。
            </div>
          </div>
        ),
      },
    ];
  }, [item, notice]);

  return (
    <div
      style={{
        padding: '32px 40px',
        display: 'grid',
        gap: 24,
        minHeight: '100%',
      }}
    >
      <PageHeader
        title={item?.name ?? '物料详情'}
        subtitle={item ? `${item.code} · ${item.categoryId ?? '未分类'}` : '按新域模型查看物料主数据'}
        actions={
          <>
            <ActionButton
              label="返回物料列表"
              tone="secondary"
              onClick={() => router.push('/mdm/items')}
            />
            <ActionButton label="编辑物料" tone="primary" disabled />
          </>
        }
      />

      {notice ? (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            background: 'rgba(192,90,60,0.08)',
            color: '#8A3D27',
            border: '1px solid rgba(192,90,60,0.18)',
            fontSize: 13,
          }}
        >
          {notice}
        </div>
      ) : null}

      {loading ? (
        <div style={{ fontSize: 14, color: '#666666' }}>正在加载物料详情…</div>
      ) : error ? (
        <div
          style={{
            display: 'grid',
            gap: 12,
            padding: 20,
            borderRadius: 8,
            background: '#FFFFFF',
            border: '1px solid #EAE4DC',
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A' }}>
            物料详情加载失败
          </div>
          <div style={{ fontSize: 13, color: '#666666', lineHeight: 1.6 }}>{error}</div>
        </div>
      ) : item ? (
        <>
          <div
            style={{
              display: 'grid',
              gap: 16,
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            }}
          >
            {[
              { label: '状态', value: <StatusBadge label={getStatusLabel(item.isActive)} tone={getTone(item.isActive)} /> },
              { label: '基础单位', value: item.baseUnit },
              { label: '分类', value: item.categoryId ?? '未分类' },
              { label: '更新时间', value: formatDateTime(item.updatedAt) },
            ].map((card) => (
              <div
                key={card.label}
                style={{
                  padding: '16px 18px',
                  borderRadius: 8,
                  border: '1px solid #EAE4DC',
                  background: '#FFFFFF',
                  display: 'grid',
                  gap: 8,
                }}
              >
                <div style={{ fontSize: 12, color: '#888888' }}>{card.label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>
                  {card.value}
                </div>
              </div>
            ))}
          </div>

          <TabPanel tabs={tabs} />
        </>
      ) : null}
    </div>
  );
}
