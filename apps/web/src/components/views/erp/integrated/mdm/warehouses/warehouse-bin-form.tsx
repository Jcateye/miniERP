'use client';

import * as React from 'react';

import { FormDialog } from '@/components/shared/form-dialog';

export interface WarehouseBinFormData {
  binType?: string;
  code: string;
  name: string;
  status: 'disabled' | 'normal';
  zoneCode?: string;
}

interface WarehouseBinFormProps {
  initialData?: WarehouseBinFormData;
  mode: 'create' | 'edit';
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: WarehouseBinFormData) => Promise<void>;
  open: boolean;
}

const EMPTY_FORM: WarehouseBinFormData = {
  binType: '',
  code: '',
  name: '',
  status: 'normal',
  zoneCode: '',
};

const BIN_TYPE_OPTIONS = [
  { value: '', label: '未分类' },
  { value: 'pick', label: '拣货位' },
  { value: 'reserve', label: '储备位' },
  { value: 'staging', label: '暂存位' },
  { value: 'qc', label: '质检位' },
  { value: 'return', label: '退货位' },
] as const;

export function WarehouseBinForm({
  initialData,
  mode,
  onOpenChange,
  onSubmit,
  open,
}: WarehouseBinFormProps) {
  const [formData, setFormData] = React.useState<WarehouseBinFormData>(
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
    if (!formData.code.trim()) {
      return '仓位编码为必填项';
    }

    if (!formData.name.trim()) {
      return '仓位名称为必填项';
    }

    return '';
  }, [formData.code, formData.name]);

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
        binType: formData.binType?.trim() ?? '',
        code: formData.code.trim(),
        name: formData.name.trim(),
        status: formData.status,
        zoneCode: formData.zoneCode?.trim() ?? '',
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '保存失败');
    } finally {
      setLoading(false);
    }
  };

  const title =
    mode === 'create'
      ? '新增仓位'
      : `编辑仓位${initialData?.code ? ` · ${initialData.code}` : ''}`;

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
        <Field label="仓位名称" required>
          <input
            className="h-10 w-full border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary"
            onChange={(event) =>
              setFormData((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="例如 成品货架 A-01-01"
            value={formData.name}
          />
        </Field>

        <Field label="仓位编码" required>
          <input
            className="h-10 w-full border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary disabled:bg-gray-50 disabled:text-muted"
            disabled={mode === 'edit'}
            onChange={(event) =>
              setFormData((current) => ({ ...current, code: event.target.value }))
            }
            placeholder="例如 A-01-01"
            value={formData.code}
          />
          {mode === 'edit' ? (
            <p className="mt-1 text-xs text-muted">编辑态暂不支持修改仓位编码。</p>
          ) : null}
        </Field>

        <Field label="区域代码">
          <input
            className="h-10 w-full border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary"
            onChange={(event) =>
              setFormData((current) => ({ ...current, zoneCode: event.target.value }))
            }
            placeholder="例如 FG-A"
            value={formData.zoneCode ?? ''}
          />
        </Field>

        <Field label="仓位类型">
          <select
            className="h-10 w-full border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary"
            onChange={(event) =>
              setFormData((current) => ({ ...current, binType: event.target.value }))
            }
            value={formData.binType ?? ''}
          >
            {BIN_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="状态">
          <select
            className="h-10 w-full border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary"
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                status: event.target.value === 'disabled' ? 'disabled' : 'normal',
              }))
            }
            value={formData.status}
          >
            <option value="normal">启用</option>
            <option value="disabled">停用</option>
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
