'use client';

import * as React from 'react';

import type { DocumentStatusCode } from '@minierp/shared';

import { FormDialog } from '@/components/shared/form-dialog';
import { RemoteEntitySelect } from '@/components/shared/remote-entity-select';

const PURCHASE_ORDER_STATUS_OPTIONS = [
  { label: '草稿', value: 'draft' },
  { label: '待审批', value: 'validating' },
  { label: '待收货', value: 'confirmed' },
  { label: '已完成', value: 'closed' },
] as const;

export interface PurchaseOrderFormData {
  amount: string;
  lines: PurchaseOrderLineFormData[];
  orderDate: string;
  orderNo: string;
  status: Extract<DocumentStatusCode, 'draft' | 'validating' | 'confirmed' | 'closed'>;
  supplierId: string;
  supplierLabel?: string;
}

export interface PurchaseOrderLineFormData {
  itemId: string;
  itemLabel?: string;
  qty: string;
  unitPrice: string;
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
  lines: [{ itemId: '', qty: '', unitPrice: '' }],
  orderDate: '',
  orderNo: '',
  status: 'draft',
  supplierId: '',
  supplierLabel: '',
};

function calculateTotalAmount(lines: readonly PurchaseOrderLineFormData[]): string {
  const total = lines.reduce((sum, line) => {
    const qty = Number(line.qty);
    const unitPrice = Number(line.unitPrice);

    if (!Number.isFinite(qty) || !Number.isFinite(unitPrice)) {
      return sum;
    }

    return sum + qty * unitPrice;
  }, 0);

  return total ? total.toFixed(2).replace(/\.00$/, '') : '';
}

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

  React.useEffect(() => {
    setFormData((current) => {
      const nextAmount = calculateTotalAmount(current.lines);
      if (current.amount === nextAmount) {
        return current;
      }

      return {
        ...current,
        amount: nextAmount,
      };
    });
  }, [formData.lines]);

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

    if (formData.lines.length === 0) {
      return '至少需要一个订单行';
    }

    for (const [index, line] of formData.lines.entries()) {
      if (!line.itemId.trim()) {
        return `第 ${index + 1} 行物料为必填项`;
      }

      const qty = Number(line.qty);
      if (!Number.isFinite(qty) || qty <= 0) {
        return `第 ${index + 1} 行数量必须大于 0`;
      }

      const unitPrice = Number(line.unitPrice);
      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        return `第 ${index + 1} 行单价必须为有效数字`;
      }
    }

    if (!formData.amount.trim()) {
      return '订单金额必须大于 0';
    }

    return '';
  }, [formData.amount, formData.lines, formData.orderDate, formData.orderNo, formData.supplierId]);

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
        lines: formData.lines.map((line) => ({
          itemId: line.itemId.trim(),
          itemLabel: line.itemLabel?.trim() ?? '',
          qty: line.qty.trim(),
          unitPrice: line.unitPrice.trim(),
        })),
        orderDate: formData.orderDate.trim(),
        orderNo: formData.orderNo.trim(),
        status: formData.status,
        supplierId: formData.supplierId.trim(),
        supplierLabel: formData.supplierLabel?.trim() ?? '',
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

        <Field label="供应商" required>
          <RemoteEntitySelect
            currentFallbackLabel={initialData?.supplierLabel ?? initialData?.supplierId}
            emptyLabel="请选择供应商"
            endpoint="/suppliers"
            onChange={(value, label) =>
              setFormData((current) => ({
                ...current,
                supplierId: value,
                supplierLabel: label ?? current.supplierLabel,
              }))
            }
            open={open}
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
            className="h-10 w-full border border-border bg-[#F7F7F5] px-3 text-sm outline-none"
            disabled
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

      <div className="space-y-3 border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">订单行</h3>
          <button
            className="border border-border bg-white px-3 py-1 text-xs transition-colors hover:bg-gray-50"
            onClick={() =>
              setFormData((current) => ({
                ...current,
                lines: [...current.lines, { itemId: '', qty: '', unitPrice: '' }],
              }))
            }
            type="button"
          >
            添加行
          </button>
        </div>

        {formData.lines.map((line, index) => {
          const lineAmount =
            Number.isFinite(Number(line.qty)) && Number.isFinite(Number(line.unitPrice))
              ? (Number(line.qty) * Number(line.unitPrice)).toFixed(2).replace(/\.00$/, '')
              : '';

          return (
            <div
              className="grid gap-3 rounded-sm border border-border bg-[#FCFCFA] p-3 md:grid-cols-[minmax(0,2fr)_120px_120px_120px_auto]"
              key={`${line.itemId}-${index}`}
            >
              <Field label={`物料 ${index + 1}`} required>
                <RemoteEntitySelect
                  currentFallbackLabel={line.itemLabel}
                  emptyLabel="请选择物料"
                  endpoint="/items"
                  onChange={(value, label) =>
                    setFormData((current) => ({
                      ...current,
                      lines: current.lines.map((currentLine, currentIndex) =>
                        currentIndex === index
                          ? {
                              ...currentLine,
                              itemId: value,
                              itemLabel: label ?? currentLine.itemLabel,
                            }
                          : currentLine,
                      ),
                    }))
                  }
                  open={open}
                  value={line.itemId}
                />
              </Field>

              <Field label="数量" required>
                <input
                  className="h-10 w-full border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary"
                  inputMode="decimal"
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      lines: current.lines.map((currentLine, currentIndex) =>
                        currentIndex === index
                          ? { ...currentLine, qty: event.target.value }
                          : currentLine,
                      ),
                    }))
                  }
                  placeholder="0"
                  value={line.qty}
                />
              </Field>

              <Field label="单价" required>
                <input
                  className="h-10 w-full border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary"
                  inputMode="decimal"
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      lines: current.lines.map((currentLine, currentIndex) =>
                        currentIndex === index
                          ? { ...currentLine, unitPrice: event.target.value }
                          : currentLine,
                      ),
                    }))
                  }
                  placeholder="0.00"
                  value={line.unitPrice}
                />
              </Field>

              <Field label="金额">
                <input
                  className="h-10 w-full border border-border bg-[#F7F7F5] px-3 text-sm outline-none"
                  disabled
                  value={lineAmount}
                />
              </Field>

              <div className="flex items-end">
                <button
                  className="h-10 border border-border bg-white px-3 text-xs transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={formData.lines.length === 1}
                  onClick={() =>
                    setFormData((current) => ({
                      ...current,
                      lines: current.lines.filter((_, currentIndex) => currentIndex !== index),
                    }))
                  }
                  type="button"
                >
                  删除
                </button>
              </div>
            </div>
          );
        })}
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
