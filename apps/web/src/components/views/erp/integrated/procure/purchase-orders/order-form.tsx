'use client';

import * as React from 'react';

import type { DocumentStatusCode } from '@minierp/shared';

import { FormDialog } from '@/components/shared/form-dialog';

const PURCHASE_ORDER_STATUS_OPTIONS = [
  { label: '草稿', value: 'draft' },
  { label: '待审批', value: 'validating' },
  { label: '待收货', value: 'confirmed' },
  { label: '已完成', value: 'closed' },
] as const;

export interface PurchaseOrderFormData {
  amount: string;
  orderDate: string;
  orderNo: string;
  status: Extract<DocumentStatusCode, 'draft' | 'validating' | 'confirmed' | 'closed'>;
  supplierId: string;
}

interface PurchaseOrderFormProps {
  initialData?: PurchaseOrderFormData;
  mode: 'create' | 'edit';
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PurchaseOrderFormData) => Promise<void>;
  open: boolean;
}

const EMPTY_FORM: PurchaseOrderFormData = {
  amount: '',
  orderDate: '',
  orderNo: '',
  status: 'draft',
  supplierId: '',
};

export function PurchaseOrderForm({
  initialData,
  mode,
  onOpenChange,
  onSubmit,
  open,
}: PurchaseOrderFormProps) {
  const [formData, setFormData] = React.useState<PurchaseOrderFormData>(
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
    if (!formData.orderNo.trim()) {
      return '订单号为必填项';
    }

    if (!formData.supplierId.trim()) {
      return '供应商 ID 为必填项';
    }

    if (!formData.orderDate.trim()) {
      return '订单日期为必填项';
    }

    if (!formData.amount.trim()) {
      return '订单金额为必填项';
    }

    if (Number.isNaN(Number(formData.amount))) {
      return '订单金额必须为数字';
    }

    return '';
  }, [formData.amount, formData.orderDate, formData.orderNo, formData.supplierId]);

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
        amount: formData.amount.trim(),
        orderDate: formData.orderDate.trim(),
        orderNo: formData.orderNo.trim(),
        status: formData.status,
        supplierId: formData.supplierId.trim(),
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
      title={mode === 'create' ? '新增采购订单' : '编辑采购订单'}
    >
      {submitError ? (
        <div className="border border-[#E7B9B9] bg-[#FFF5F5] px-3 py-2 text-sm text-[#B54A4A]">
          {submitError}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="订单号" required>
          <input
            className="h-10 w-full border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary disabled:bg-gray-50 disabled:text-muted"
            disabled={mode === 'edit'}
            onChange={(event) =>
              setFormData((current) => ({ ...current, orderNo: event.target.value }))
            }
            placeholder="例如 PO-20260311-001"
            value={formData.orderNo}
          />
        </Field>

        <Field label="供应商 ID" required>
          <input
            className="h-10 w-full border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary"
            onChange={(event) =>
              setFormData((current) => ({ ...current, supplierId: event.target.value }))
            }
            placeholder="例如 V-001"
            value={formData.supplierId}
          />
        </Field>

        <Field label="订单日期" required>
          <input
            className="h-10 w-full border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary"
            onChange={(event) =>
              setFormData((current) => ({ ...current, orderDate: event.target.value }))
            }
            type="date"
            value={formData.orderDate}
          />
        </Field>

        <Field label="订单金额" required>
          <input
            className="h-10 w-full border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary"
            inputMode="decimal"
            onChange={(event) =>
              setFormData((current) => ({ ...current, amount: event.target.value }))
            }
            placeholder="请输入金额"
            value={formData.amount}
          />
        </Field>

        <Field label="订单状态" required>
          <select
            className="h-10 w-full border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary"
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                status: event.target.value as PurchaseOrderFormData['status'],
              }))
            }
            value={formData.status}
          >
            {PURCHASE_ORDER_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
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
