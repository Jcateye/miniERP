'use client';

import * as React from 'react';

import { FormDialog } from '@/components/shared/form-dialog';

const BASE_UNIT_OPTIONS = ['PCS', 'SET', 'KG', 'M', 'BOX'] as const;
const CATEGORY_SUGGESTIONS = ['线材', '连接器', '转换器', '电源', '扩展坞'] as const;
const STATUS_OPTIONS = [
  { label: '正常', value: 'normal' },
  { label: '预警', value: 'warning' },
  { label: '停用', value: 'disabled' },
] as const;

export interface SkuFormData {
  code: string;
  name: string;
  specification?: string;
  baseUnit: string;
  category?: string;
  barcode?: string;
  batchManaged: boolean;
  serialManaged: boolean;
  minStockQty?: string;
  maxStockQty?: string;
  leadTimeDays?: number | null;
  status: 'normal' | 'warning' | 'disabled';
}

interface SkuFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: SkuFormData;
  onSubmit: (data: SkuFormData) => Promise<void>;
  mode: 'create' | 'edit';
}

const EMPTY_FORM: SkuFormData = {
  code: '',
  name: '',
  specification: '',
  baseUnit: 'PCS',
  category: '',
  barcode: '',
  batchManaged: false,
  serialManaged: false,
  minStockQty: '',
  maxStockQty: '',
  leadTimeDays: null,
  status: 'normal',
};

export function SkuForm({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  mode,
}: SkuFormProps) {
  const [loading, setLoading] = React.useState(false);
  const [submitError, setSubmitError] = React.useState('');
  const [formData, setFormData] = React.useState<SkuFormData>(initialData ?? EMPTY_FORM);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    setSubmitError('');
    setFormData(initialData ? { ...initialData } : { ...EMPTY_FORM });
  }, [initialData, open]);

  const validationMessage = React.useMemo(() => {
    if (!formData.code.trim()) {
      return 'SKU 编码为必填项';
    }

    if (!formData.name.trim()) {
      return 'SKU 名称为必填项';
    }

    if (!formData.baseUnit.trim()) {
      return '基本单位为必填项';
    }

    if (formData.minStockQty?.trim() && Number.isNaN(Number(formData.minStockQty))) {
      return '最小库存必须为数字';
    }

    if (formData.maxStockQty?.trim() && Number.isNaN(Number(formData.maxStockQty))) {
      return '最大库存必须为数字';
    }

    if (
      formData.leadTimeDays !== null &&
      formData.leadTimeDays !== undefined &&
      (!Number.isInteger(formData.leadTimeDays) || formData.leadTimeDays < 0)
    ) {
      return '采购提前期必须为大于等于 0 的整数';
    }

    return '';
  }, [
    formData.baseUnit,
    formData.code,
    formData.leadTimeDays,
    formData.maxStockQty,
    formData.minStockQty,
    formData.name,
  ]);

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
        ...formData,
        barcode: formData.barcode?.trim() ?? '',
        leadTimeDays: formData.leadTimeDays ?? null,
        category: formData.category?.trim() ?? '',
        code: formData.code.trim(),
        maxStockQty: formData.maxStockQty?.trim() ?? '',
        minStockQty: formData.minStockQty?.trim() ?? '',
        name: formData.name.trim(),
        specification: formData.specification?.trim() ?? '',
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '保存失败');
    } finally {
      setLoading(false);
    }
  };

  const title = mode === 'create' ? '新增 SKU' : `编辑 SKU${initialData?.code ? ` · ${initialData.code}` : ''}`;

  return (
    <FormDialog
      loading={loading}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      open={open}
      submitLabel={mode === 'create' ? '新增' : '保存'}
      title={title}
    >
      {submitError ? (
        <div className="border border-[#E7B9B9] bg-[#FFF5F5] px-3 py-2 text-sm text-[#B54A4A]">
          {submitError}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="SKU 编码" required>
          <input
            className="h-10 w-full border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary disabled:bg-gray-50 disabled:text-muted"
            disabled={mode === 'edit'}
            onChange={(event) => setFormData((current) => ({ ...current, code: event.target.value }))}
            placeholder="例如 CAB-HDMI-2M"
            value={formData.code}
          />
          {mode === 'edit' ? (
            <p className="mt-1 text-xs text-muted">当前后端更新契约不支持修改编码，编辑态仅允许查看。</p>
          ) : null}
        </Field>

        <Field label="SKU 名称" required>
          <input
            className="h-10 w-full border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary"
            onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
            placeholder="请输入名称"
            value={formData.name}
          />
        </Field>

        <Field label="规格">
          <input
            className="h-10 w-full border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary"
            onChange={(event) =>
              setFormData((current) => ({ ...current, specification: event.target.value }))
            }
            placeholder="可选"
            value={formData.specification ?? ''}
          />
        </Field>

        <Field label="基本单位" required>
          <select
            className="h-10 w-full border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary"
            onChange={(event) => setFormData((current) => ({ ...current, baseUnit: event.target.value }))}
            value={formData.baseUnit}
          >
            {BASE_UNIT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>

        <Field label="类目">
          <input
            className="h-10 w-full border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary"
            list="sku-category-options"
            onChange={(event) => setFormData((current) => ({ ...current, category: event.target.value }))}
            placeholder="例如 线材"
            value={formData.category ?? ''}
          />
          <datalist id="sku-category-options">
            {CATEGORY_SUGGESTIONS.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </Field>

        <Field label="条码">
          <input
            className="h-10 w-full border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary"
            onChange={(event) => setFormData((current) => ({ ...current, barcode: event.target.value }))}
            placeholder="可选"
            value={formData.barcode ?? ''}
          />
        </Field>

        <Field label="最小库存">
          <input
            className="h-10 w-full border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary"
            inputMode="decimal"
            onChange={(event) =>
              setFormData((current) => ({ ...current, minStockQty: event.target.value }))
            }
            placeholder="可选"
            value={formData.minStockQty ?? ''}
          />
        </Field>

        <Field label="最大库存">
          <input
            className="h-10 w-full border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary"
            inputMode="decimal"
            onChange={(event) =>
              setFormData((current) => ({ ...current, maxStockQty: event.target.value }))
            }
            placeholder="可选"
            value={formData.maxStockQty ?? ''}
          />
        </Field>

        <Field label="采购提前期(天)">
          <input
            className="h-10 w-full border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary"
            inputMode="numeric"
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                leadTimeDays: event.target.value.trim() === '' ? null : Number(event.target.value),
              }))
            }
            placeholder="可选"
            value={formData.leadTimeDays ?? ''}
          />
        </Field>

        <Field label="状态" required>
          <select
            className="h-10 w-full border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary"
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                status: event.target.value as SkuFormData['status'],
              }))
            }
            value={formData.status}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted">
            预警态为列表层派生状态，提交时会按启用状态保存，是否预警仍由库存阈值决定。
          </p>
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="批次管理">
          <label className="flex h-10 items-center gap-2 border border-border bg-white px-3 text-sm">
            <input
              checked={formData.batchManaged}
              onChange={(event) =>
                setFormData((current) => ({ ...current, batchManaged: event.target.checked }))
              }
              type="checkbox"
            />
            启用批次管理
          </label>
        </Field>

        <Field label="序列号管理">
          <label className="flex h-10 items-center gap-2 border border-border bg-white px-3 text-sm">
            <input
              checked={formData.serialManaged}
              onChange={(event) =>
                setFormData((current) => ({ ...current, serialManaged: event.target.checked }))
              }
              type="checkbox"
            />
            启用序列号管理
          </label>
        </Field>
      </div>

      <p className="text-xs text-muted">
        条码、批次/序列、库存阈值、采购提前期已纳入 canonical item 表单字段；是否被上游完整持久化取决于当前 backend 能力。
      </p>
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
