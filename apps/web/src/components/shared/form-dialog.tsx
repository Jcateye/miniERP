'use client';

import * as React from 'react';

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  submitLabel?: string;
  loading?: boolean;
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  children,
  onSubmit,
  submitLabel = '保存',
  loading = false,
}: FormDialogProps) {
  React.useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loading) {
        onOpenChange(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading, onOpenChange, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6"
      onClick={() => {
        if (!loading) {
          onOpenChange(false);
        }
      }}
      role="presentation"
    >
      <div
        className="w-full max-w-xl rounded-sm border border-border bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold">{title}</h2>
        </div>

        <form className="flex flex-col gap-6 p-6" onSubmit={onSubmit}>
          <div className="space-y-4">{children}</div>

          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <button
              className="h-10 min-w-24 border border-border bg-white px-4 text-sm font-medium transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loading}
              onClick={() => onOpenChange(false)}
              type="button"
            >
              取消
            </button>
            <button
              className="h-10 min-w-24 bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
              type="submit"
            >
              {loading ? '保存中...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
