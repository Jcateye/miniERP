'use client';

import * as React from 'react';

import { FormDialog } from '@/components/shared/form-dialog';

export interface LedgerFormData {
  quantity: string;
  reason?: string;
  skuId: string;
  type: '入库' | '出库' | '调整';
  warehouseId: string;
}

interface LedgerFormProps {
  initialData?: LedgerFormData;
  mode: 'create' | 'edit';
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: LedgerFormData) => Promise<void>;
  open: boolean;
}

const EMPTY_FORM: LedgerFormData = {
  quantity: '',
  reason: '',
  skuId: '',
  type: '入库',
  warehouseId: '',
};

export function LedgerForm({
  initialData,
  mode,
  onOpenChange,
  onSubmit,
  open,
}: LedgerFormProps) {
  const [formData, setFormData] = React.useState<LedgerFormData>(
    initialData ?? EMPTY_FORM,
  );
  const [loading, setLoading] = React.useState(false);
  const [submitError, setSubmitError] = React.useState('');

  React.useEffect(() => {
    if (!open) {
      return;
    }

    setSubmitError('');
    setFormData(initialData ? { ...initialData } : { ...EMPTY_FORM });
  }, [initialData, open]);

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
        quantity: formData.quantity.trim(),
        reason: formData.reason?.trim() ?? '',
        skuId: formData.skuId.trim(),
        type: formData.type,
        warehouseId: formData.warehouseId.trim(),
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormDialog
      loading={loading}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      open={open}
      submitLabel={mode === 'create' ? '新增' : '保存'}
      title={mode === 'create' ? '新增库存流水' : '编辑库存流水'}
    >
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

        <Field label="仓库 ID" required>
          <input
            className="h-10 w-full border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary"
            onChange={(event) =>
              setFormData((current) => ({ ...current, warehouseId: event.target.value }))
            }
            placeholder="例如 深圳总仓 / WH-001"
            value={formData.warehouseId}
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
          placeholder="可选"
          value={formData.reason ?? ''}
        />
      </Field>
    </FormDialog>
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
