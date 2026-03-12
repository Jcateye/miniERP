'use client';

import * as React from 'react';

import { FormDialog } from '@/components/shared/form-dialog';

export interface SalesOrderFormData {
  amount: string;
  customerId: string;
  orderDate: string;
  orderNo: string;
  status: '待发货' | '已发货' | '草稿';
}

interface SalesOrderFormProps {
  initialData?: SalesOrderFormData;
  mode: 'create' | 'edit';
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SalesOrderFormData) => Promise<void>;
  open: boolean;
}

const EMPTY_FORM: SalesOrderFormData = {
  amount: '',
  customerId: '',
  orderDate: '',
  orderNo: '',
  status: '草稿',
};

export function SalesOrderForm({
  initialData,
  mode,
  onOpenChange,
  onSubmit,
  open,
}: SalesOrderFormProps) {
  const [formData, setFormData] = React.useState<SalesOrderFormData>(
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

    if (!formData.customerId.trim()) {
      return '客户 ID 为必填项';
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
  }, [formData.amount, formData.customerId, formData.orderDate, formData.orderNo]);

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
        customerId: formData.customerId.trim(),
        orderDate: formData.orderDate.trim(),
        orderNo: formData.orderNo.trim(),
        status: formData.status,
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
      title={mode === 'create' ? '新增销售订单' : '编辑销售订单'}
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
            placeholder="例如 SO-20260311-001"
            value={formData.orderNo}
          />
        </Field>

        <Field label="客户 ID" required>
          <input
            className="h-10 w-full border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary"
            onChange={(event) =>
              setFormData((current) => ({ ...current, customerId: event.target.value }))
            }
            placeholder="例如 C-001"
            value={formData.customerId}
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
                status: event.target.value as SalesOrderFormData['status'],
              }))
            }
            value={formData.status}
          >
            <option value="草稿">草稿</option>
            <option value="待发货">待发货</option>
            <option value="已发货">已发货</option>
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
