'use client';

import * as React from 'react';

import { FormDialog } from '@/components/shared/form-dialog';

export interface SupplierFormData {
  address?: string;
  code: string;
  contact?: string;
  email?: string;
  name: string;
  phone?: string;
}

interface SupplierFormProps {
  initialData?: SupplierFormData;
  mode: 'create' | 'edit';
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SupplierFormData) => Promise<void>;
  open: boolean;
}

const EMPTY_FORM: SupplierFormData = {
  address: '',
  code: '',
  contact: '',
  email: '',
  name: '',
  phone: '',
};

export function SupplierForm({
  initialData,
  mode,
  onOpenChange,
  onSubmit,
  open,
}: SupplierFormProps) {
  const [formData, setFormData] = React.useState<SupplierFormData>(
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
      return '供应商名称为必填项';
    }

    if (!formData.code.trim()) {
      return '供应商编码为必填项';
    }

    if (formData.email?.trim()) {
      const email = formData.email.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return '邮箱格式不正确';
      }
    }

    return '';
  }, [formData.code, formData.email, formData.name]);

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
        contact: formData.contact?.trim() ?? '',
        email: formData.email?.trim() ?? '',
        name: formData.name.trim(),
        phone: formData.phone?.trim() ?? '',
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '保存失败');
    } finally {
      setLoading(false);
    }
  };

  const title =
    mode === 'create'
      ? '新增供应商'
      : `编辑供应商${initialData?.code ? ` · ${initialData.code}` : ''}`;

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
        <Field label="供应商名称" required>
          <input
            className="h-10 w-full border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary"
            onChange={(event) =>
              setFormData((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="请输入供应商名称"
            value={formData.name}
          />
        </Field>

        <Field label="供应商编码" required>
          <input
            className="h-10 w-full border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary disabled:bg-gray-50 disabled:text-muted"
            disabled={mode === 'edit'}
            onChange={(event) =>
              setFormData((current) => ({ ...current, code: event.target.value }))
            }
            placeholder="例如 V-001"
            value={formData.code}
          />
          {mode === 'edit' ? (
            <p className="mt-1 text-xs text-muted">
              当前后端更新契约不支持修改供应商编码，编辑态仅允许查看。
            </p>
          ) : null}
        </Field>

        <Field label="联系人">
          <input
            className="h-10 w-full border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary"
            onChange={(event) =>
              setFormData((current) => ({ ...current, contact: event.target.value }))
            }
            placeholder="可选"
            value={formData.contact ?? ''}
          />
        </Field>

        <Field label="电话">
          <input
            className="h-10 w-full border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary"
            onChange={(event) =>
              setFormData((current) => ({ ...current, phone: event.target.value }))
            }
            placeholder="可选"
            value={formData.phone ?? ''}
          />
        </Field>

        <Field label="邮箱">
          <input
            className="h-10 w-full border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary"
            onChange={(event) =>
              setFormData((current) => ({ ...current, email: event.target.value }))
            }
            placeholder="可选"
            type="email"
            value={formData.email ?? ''}
          />
        </Field>
      </div>

      <Field label="地址">
        <textarea
          className="min-h-24 w-full resize-y border border-border bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
          onChange={(event) =>
            setFormData((current) => ({ ...current, address: event.target.value }))
          }
          placeholder="可选"
          value={formData.address ?? ''}
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
