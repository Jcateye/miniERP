'use client';

import * as React from 'react';

import type { InventoryBalanceListItem } from '@/lib/mocks/erp-list-fixtures';
import { inventoryBalanceListFixtures } from '@/lib/mocks/erp-list-fixtures';

type NoticeTone = 'error' | 'success';

type SubmitPayload = {
  balanceAfter: number;
  balanceBefore: number;
  operation: 'INBOUND' | 'OUTBOUND';
};

type Feedback = {
  message: string;
  tone: NoticeTone;
};

const WAREHOUSE_OPTIONS = [
  { label: '仓库 A / 深圳 A 仓', value: '深圳 A 仓' },
  { label: '仓库 B / 青岛 B 仓', value: '青岛 B 仓' },
  { label: '仓库 C / 苏州 周转仓', value: '苏州 周转仓' },
] as const;

const DEFAULT_WAREHOUSE = '深圳 A 仓';
const DEFAULT_SKU = 'CAB-HDMI-2M';

interface InoutDemoPanelProps {
  onNotice: (message: string, tone: NoticeTone) => void;
  onReload: () => void;
  rows: readonly InventoryBalanceListItem[];
}

export function InoutDemoPanel({
  onNotice,
  onReload,
  rows,
}: InoutDemoPanelProps) {
  const [feedback, setFeedback] = React.useState<Feedback | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const [submitting, setSubmitting] = React.useState(false);
  const [quantity, setQuantity] = React.useState('100');
  const [selectedSku, setSelectedSku] = React.useState(DEFAULT_SKU);
  const [selectedWarehouse, setSelectedWarehouse] =
    React.useState(DEFAULT_WAREHOUSE);
  const [submitSnapshot, setSubmitSnapshot] =
    React.useState<SubmitPayload | null>(null);

  const skuOptions = React.useMemo(
    () =>
      inventoryBalanceListFixtures.filter(
        (item) => item.warehouse === selectedWarehouse,
      ),
    [selectedWarehouse],
  );

  React.useEffect(() => {
    if (skuOptions.some((item) => item.sku === selectedSku)) {
      return;
    }

    setSelectedSku(skuOptions[0]?.sku ?? '');
  }, [selectedSku, skuOptions]);

  const currentRow =
    rows.find(
      (item) =>
        item.sku === selectedSku && item.warehouse === selectedWarehouse,
    ) ??
    inventoryBalanceListFixtures.find(
      (item) =>
        item.sku === selectedSku && item.warehouse === selectedWarehouse,
    ) ??
    null;

  const handleSubmit = async (operation: 'INBOUND' | 'OUTBOUND') => {
    const parsedQuantity = Number(quantity);

    if (!selectedWarehouse || !selectedSku) {
      const message = '请选择仓库和 SKU';
      setFeedback({ message, tone: 'error' });
      onNotice(message, 'error');
      return;
    }

    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      const message = '数量必须大于 0';
      setFeedback({ message, tone: 'error' });
      onNotice(message, 'error');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/bff/inventory/inout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key':
            globalThis.crypto?.randomUUID?.() ??
            `inventory-demo-${Date.now()}`,
        },
        body: JSON.stringify({
          operation,
          quantity: parsedQuantity,
          skuId: selectedSku,
          warehouseId: selectedWarehouse,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        const message =
          payload?.error?.message ?? '库存操作失败，请稍后重试';
        setFeedback({ message, tone: 'error' });
        setSubmitSnapshot(null);
        onNotice(message, 'error');
        return;
      }

      const message =
        payload?.message ??
        (operation === 'INBOUND' ? '入库成功' : '出库成功');

      setFeedback({ message, tone: 'success' });
      setSubmitSnapshot(payload.data as SubmitPayload);
      onNotice(message, 'success');
      startTransition(() => {
        onReload();
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="grid gap-5 border border-border bg-[#FDFCFB] p-5 shadow-sm lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
            Demo · 入库 / 出库
          </div>
          <h2 className="font-['var(--font-space-grotesk)'] text-xl font-bold text-foreground">
            本地演示表单
          </h2>
          <p className="text-sm text-muted">
            演示脚本：先选仓库 A 与 `CAB-HDMI-2M` 入库 100，再出库 30；若超出现有库存会直接拦截。
          </p>
        </div>

        {feedback ? (
          <div
            className={`rounded-sm border px-4 py-3 text-sm ${
              feedback.tone === 'success'
                ? 'border-[#B6D7BD] bg-[#F2FBF4] text-[#2E7D32]'
                : 'border-[#E7B9B9] bg-[#FFF5F5] text-[#B54A4A]'
            }`}
          >
            {feedback.message}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="仓库" required>
            <select
              className="h-11 w-full border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary"
              onChange={(event) => setSelectedWarehouse(event.target.value)}
              value={selectedWarehouse}
            >
              {WAREHOUSE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="SKU" required>
            <select
              className="h-11 w-full border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary"
              onChange={(event) => setSelectedSku(event.target.value)}
              value={selectedSku}
            >
              {skuOptions.map((item) => (
                <option key={`${item.sku}-${item.warehouse}`} value={item.sku}>
                  {item.sku} · {item.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="数量" required>
            <input
              className="h-11 w-full border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary"
              inputMode="numeric"
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="请输入数量"
              value={quantity}
            />
          </Field>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            className="inline-flex h-11 items-center justify-center bg-[#2E7D32] px-5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={submitting || isPending}
            onClick={() => handleSubmit('INBOUND')}
            type="button"
          >
            {submitting || isPending ? '提交中...' : '提交入库'}
          </button>
          <button
            className="inline-flex h-11 items-center justify-center bg-primary px-5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={submitting || isPending}
            onClick={() => handleSubmit('OUTBOUND')}
            type="button"
          >
            {submitting || isPending ? '提交中...' : '提交出库'}
          </button>
        </div>
      </div>

      <aside className="flex flex-col gap-4 bg-[#1a1a1a] p-5 text-white">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-white/55">
              当前库存快照
            </div>
            <div className="mt-2 font-['var(--font-space-grotesk)'] text-lg font-bold">
              {selectedSku || '未选择 SKU'}
            </div>
          </div>
          <div className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70">
            {selectedWarehouse}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <StatCard label="当前余额" value={String(currentRow?.balance ?? 0)} />
          <StatCard label="可用数量" value={String(currentRow?.available ?? 0)} />
          <StatCard label="预留数量" value={String(currentRow?.reserved ?? 0)} />
          <StatCard label="安全库存" value={String(currentRow?.safe ?? 0)} />
        </div>

        <div className="rounded-sm border border-white/10 bg-white/5 p-4 text-sm text-white/80">
          {submitSnapshot ? (
            <>
              最近一次提交：{submitSnapshot.operation === 'INBOUND' ? '入库' : '出库'}，
              余额 {submitSnapshot.balanceBefore} → {submitSnapshot.balanceAfter}
            </>
          ) : (
            '提交后这里会显示最近一次入库/出库对余额的影响。'
          )}
        </div>
      </aside>
    </section>
  );
}

function Field({
  children,
  label,
  required = false,
}: {
  children: React.ReactNode;
  label: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-medium text-foreground">
        {label}
        {required ? <span className="ml-1 text-[#B54A4A]">*</span> : null}
      </span>
      {children}
    </label>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 bg-white/5 p-3">
      <div className="text-xs uppercase tracking-[0.18em] text-white/55">
        {label}
      </div>
      <div className="mt-2 font-['var(--font-space-grotesk)'] text-xl font-bold">
        {value}
      </div>
    </div>
  );
}
