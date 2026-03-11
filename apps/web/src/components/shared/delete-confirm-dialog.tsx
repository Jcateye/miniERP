'use client';

import * as React from 'react';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  loading?: boolean;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title = '确认删除',
  description = '此操作无法撤销',
  loading = false,
}: DeleteConfirmDialogProps) {
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
        className="w-full max-w-md rounded-sm border border-border bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <p className="mt-2 text-sm text-muted">{description}</p>
        </div>

        <div className="flex justify-end gap-3 p-6">
          <button
            className="h-10 min-w-24 border border-border bg-white px-4 text-sm font-medium transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loading}
            onClick={() => onOpenChange(false)}
            type="button"
          >
            取消
          </button>
          <button
            className="h-10 min-w-24 bg-[#B54A4A] px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            onClick={() => {
              void onConfirm();
            }}
            type="button"
          >
            {loading ? '删除中...' : '确认删除'}
          </button>
        </div>
      </div>
    </div>
  );
}
