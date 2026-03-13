'use client';

import * as React from 'react';

import { FormDialog } from '@/components/shared/form-dialog';

export interface WarehouseFormData {
  address?: string;
  code: string;
  contactName?: string;
  manageBin: boolean;
  name: string;
  phone?: string;
  status: 'disabled' | 'normal';
}

interface WarehouseFormProps {
  initialData?: WarehouseFormData;
  mode: 'create' | 'edit';
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: WarehouseFormData) => Promise<void>;
  open: boolean;
}

const EMPTY_FORM: WarehouseFormData = {
  address: '',
  code: '',
  contactName: '',
  manageBin: false,
  name: '',
  phone: '',
  status: 'normal',
};

export function WarehouseForm({
  initialData,
  mode,
  onOpenChange,
  onSubmit,
  open,
}: WarehouseFormProps) {
  const [formData, setFormData] = React.useState<WarehouseFormData>(
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
    if (!formData.name.trim()) {
      return '仓库名称为必填项';
    }

    if (!formData.code.trim()) {
      return '仓库编码为必填项';
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
        address: formData.address?.trim() ?? '',
        code: formData.code.trim(),
        contactName: formData.contactName?.trim() ?? '',
        manageBin: formData.manageBin,
        name: formData.name.trim(),
        phone: formData.phone?.trim() ?? '',
        status: formData.status,
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '保存失败');
    } finally {
      setLoading(false);
    }
  };

  const title =
    mode === 'create'
      ? '新增仓库'
      : `编辑仓库${initialData?.code ? ` · ${initialData.code}` : ''}`;

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
        <Field label="仓库名称" required>
          <input
            className="h-10 w-full border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary"
            onChange={(event) =>
              setFormData((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="请输入仓库名称"
            value={formData.name}
          />
        </Field>

        <Field label="仓库编码" required>
          <input
            className="h-10 w-full border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary disabled:bg-gray-50 disabled:text-muted"
            disabled={mode === 'edit'}
            onChange={(event) =>
              setFormData((current) => ({ ...current, code: event.target.value }))
            }
            placeholder="例如 WH-SZ-A"
            value={formData.code}
          />
          {mode === 'edit' ? (
            <p className="mt-1 text-xs text-muted">编辑态暂不支持修改仓库编码。</p>
          ) : null}
        </Field>

        <Field label="联系人">
          <input
            className="h-10 w-full border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary"
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                contactName: event.target.value,
              }))
            }
            placeholder="可选"
            value={formData.contactName ?? ''}
          />
        </Field>

        <Field label="联系电话">
          <input
            className="h-10 w-full border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary"
            onChange={(event) =>
              setFormData((current) => ({ ...current, phone: event.target.value }))
            }
            placeholder="可选"
            value={formData.phone ?? ''}
          />
        </Field>
      </div>

      <Field label="仓库地址">
        <textarea
          className="min-h-24 w-full resize-y border border-border bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
          onChange={(event) =>
            setFormData((current) => ({ ...current, address: event.target.value }))
          }
          placeholder="可选"
          value={formData.address ?? ''}
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="仓位管理">
          <label className="flex min-h-10 items-center gap-3 border border-border bg-white px-3 text-sm">
            <input
              checked={formData.manageBin}
              className="h-4 w-4"
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  manageBin: event.target.checked,
                }))
              }
              type="checkbox"
            />
            <span>{formData.manageBin ? '启用仓位管理' : '作为平面仓管理'}</span>
          </label>
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
