'use client';

import * as React from 'react';

import { RemoteEntitySelect } from '@/components/shared/remote-entity-select';
import { inventoryBalanceListFixtures, type InventoryBalanceListItem } from '@/lib/mocks/erp-list-fixtures';

export interface LedgerFormData {
  binId?: string;
  binLabel?: string;
  quantity: string;
  reason?: string;
  skuId: string;
  type: '入库' | '出库' | '调整';
  warehouseId: string;
  warehouseLabel?: string;
}

interface LedgerFormProps {
  initialData?: LedgerFormData;
  mode: 'create' | 'edit';
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: LedgerFormData) => Promise<void>;
  open: boolean;
  rows?: readonly InventoryBalanceListItem[];
}

const EMPTY_FORM: LedgerFormData = {
  binId: '',
  binLabel: '',
  quantity: '',
  reason: '',
  skuId: '',
  type: '入库',
  warehouseId: '',
  warehouseLabel: '',
};

export function LedgerForm({
  initialData,
  mode,
  onOpenChange,
  onSubmit,
  open,
  rows = [],
}: LedgerFormProps) {
  const [formData, setFormData] = React.useState<LedgerFormData>(
    initialData ?? EMPTY_FORM,
  );
  const [loading, setLoading] = React.useState(false);
  const [submitError, setSubmitError] = React.useState('');

  const currentRow = React.useMemo(() => {
    if (!formData.skuId || !formData.warehouseId) return null;
    return (
      rows.find(
        (r) =>
          r.sku === formData.skuId &&
          r.warehouseId === formData.warehouseId &&
          (r.binId ?? '') === (formData.binId ?? ''),
      ) ||
      inventoryBalanceListFixtures.find(
        (r) =>
          r.sku === formData.skuId &&
          r.warehouseId === formData.warehouseId &&
          (r.binId ?? '') === (formData.binId ?? ''),
      ) ||
      null
    );
  }, [formData.binId, formData.skuId, formData.warehouseId, rows]);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    setSubmitError('');
    setFormData(initialData ? { ...initialData } : { ...EMPTY_FORM });
  }, [initialData, open]);

  React.useEffect(() => {
    if (!formData.warehouseId) {
      setFormData((current) => ({
        ...current,
        binId: '',
        binLabel: '',
      }));
    }
  }, [formData.warehouseId]);

  const validationMessage = React.useMemo(() => {
    if (!formData.skuId.trim()) {
      return 'SKU ID 为必填项';
    }

    if (!formData.warehouseId.trim()) {
      return '仓库 ID 为必填项';
    }

    if (!formData.quantity.trim()) {
      return '变动数量为必填项';
    }

    if (Number.isNaN(Number(formData.quantity))) {
      return '变动数量必须为数字';
    }

    return '';
  }, [formData.quantity, formData.skuId, formData.warehouseId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (validationMessage) {
      setSubmitError(validationMessage);
      return;
    }

    setLoading(true);
    setSubmitError('');

    try {
      await onSubmit({
        binId: formData.binId?.trim() ?? '',
        binLabel: formData.binLabel?.trim() ?? '',
        quantity: formData.quantity.trim(),
        reason: formData.reason?.trim() ?? '',
        skuId: formData.skuId.trim(),
        type: formData.type,
        warehouseId: formData.warehouseId.trim(),
        warehouseLabel: formData.warehouseLabel?.trim() ?? '',
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6 ${!open ? 'hidden' : ''}`}
      onClick={() => !loading && onOpenChange(false)}
    >
      <div
        className="w-full max-w-4xl rounded-sm border border-border bg-white shadow-2xl relative overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-border px-6 py-4 flex justify-between items-center bg-white">
          <h2 className="text-lg font-bold">{mode === 'create' ? '新增库存流水' : '编辑库存流水'}</h2>
          <button onClick={() => onOpenChange(false)} className="text-muted hover:text-foreground">✕</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px]">
          <form className="flex flex-col gap-6 p-6" onSubmit={handleSubmit}>
            {submitError ? (
              <div className="border border-[#E7B9B9] bg-[#FFF5F5] px-3 py-2 text-sm text-[#B54A4A]">
                {submitError}
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
        <Field label="SKU ID" required>
          <input
            className="h-10 w-full border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary"
            onChange={(event) =>
              setFormData((current) => ({ ...current, skuId: event.target.value }))
            }
            placeholder="例如 CAB-HDMI-2M"
            value={formData.skuId}
          />
        </Field>

        <Field label="仓库" required>
          <RemoteEntitySelect
            currentFallbackLabel={formData.warehouseLabel}
            emptyLabel="请选择仓库"
            endpoint="/warehouses"
            onChange={(value, label) =>
              setFormData((current) => ({
                ...current,
                warehouseId: value,
                warehouseLabel: label ?? '',
                binId: '',
                binLabel: '',
              }))
            }
            open={open}
            value={formData.warehouseId}
          />
        </Field>

        <Field label="仓位">
          <RemoteEntitySelect
            currentFallbackLabel={formData.binLabel}
            disabled={!formData.warehouseId}
            emptyLabel={formData.warehouseId ? '请选择仓位' : '请先选择仓库'}
            endpoint={`/warehouse-bins?warehouseId=${encodeURIComponent(formData.warehouseId)}`}
            onChange={(value, label) =>
              setFormData((current) => ({
                ...current,
                binId: value,
                binLabel: label ?? '',
              }))
            }
            open={open}
            value={formData.binId ?? ''}
          />
        </Field>

        <Field label="变动类型" required>
          <select
            className="h-10 w-full border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary"
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                type: event.target.value as LedgerFormData['type'],
              }))
            }
            value={formData.type}
          >
            <option value="入库">入库</option>
            <option value="出库">出库</option>
            <option value="调整">调整</option>
          </select>
        </Field>

        <Field label="变动数量" required>
          <input
            className="h-10 w-full border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary"
            inputMode="decimal"
            onChange={(event) =>
              setFormData((current) => ({ ...current, quantity: event.target.value }))
            }
            placeholder="请输入数量"
            value={formData.quantity}
          />
        </Field>
      </div>

            <Field label="变动原因">
              <textarea
                className="min-h-24 w-full resize-y border border-border bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
                onChange={(event) =>
                  setFormData((current) => ({ ...current, reason: event.target.value }))
                }
                placeholder="可选输入备注信息..."
                value={formData.reason ?? ''}
              />
            </Field>

            <div className="flex justify-end gap-3 border-t border-border pt-6">
              <button
                className="h-10 min-w-24 border border-border bg-white px-4 text-sm font-medium transition-colors hover:bg-gray-50 focus:outline-none"
                onClick={() => onOpenChange(false)}
                type="button"
              >
                取消
              </button>
              <button
                className="h-10 min-w-24 bg-primary px-4 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading}
                type="submit"
              >
                {loading ? '提交中...' : '提交操作'}
              </button>
            </div>
          </form>

          {/* Snapshot Area */}
          <div className="bg-[#1a1a1a] text-white p-6 flex flex-col gap-6">
            <div className="border-b border-white/10 pb-4">
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/50 mb-1">
                当前库存快照 (实时查询)
              </div>
              <div className="font-['var(--font-space-grotesk)'] text-[20px] font-bold">
                {formData.skuId || '未入选择 SKU'}
              </div>
              <div className="mt-2 inline-flex rounded-full border border-white/15 px-3 py-0.5 text-[10px] text-white/70">
                {formData.warehouseLabel || formData.warehouseId || '未选择仓库'}
              </div>
              <div className="mt-2 inline-flex rounded-full border border-white/15 px-3 py-0.5 text-[10px] text-white/70">
                {formData.binLabel || formData.binId || '未选择仓位'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/5 p-4">
                <div className="text-[10px] text-white/50 uppercase tracking-widest mb-1">当前余额</div>
                <div className="text-[24px] font-bold font-['var(--font-space-grotesk)']">{currentRow?.balance ?? '--'}</div>
              </div>
              <div className="bg-white/5 border border-white/5 p-4">
                <div className="text-[10px] text-white/50 uppercase tracking-widest mb-1">可用数量</div>
                <div className="text-[24px] font-bold font-['var(--font-space-grotesk)']">{currentRow?.available ?? '--'}</div>
              </div>
              <div className="bg-white/5 border border-white/5 p-4">
                <div className="text-[10px] text-white/50 uppercase tracking-widest mb-1">预留数量</div>
                <div className="text-[24px] font-bold font-['var(--font-space-grotesk)']">{currentRow?.reserved ?? '--'}</div>
              </div>
              <div className="bg-white/5 border border-white/5 p-4">
                <div className="text-[10px] text-white/50 uppercase tracking-widest mb-1">安全库存</div>
                <div className="text-[24px] font-bold font-['var(--font-space-grotesk)']">{currentRow?.safe ?? '--'}</div>
              </div>
            </div>

            <div className="mt-auto bg-white/5 border border-white/5 p-4 text-[12px] text-white/60 leading-relaxed italic">
              提示：提交入库或出库后，库存余额将实时同步更新。如果变动后低于安全库存，系统将触发红色预警。
            </div>
          </div>
        </div>
      </div>
    </div>
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
      <span className="font-medium">
        {label}
        {required ? <span className="ml-1 text-[#B54A4A]">*</span> : null}
      </span>
      {children}
    </label>
  );
}
