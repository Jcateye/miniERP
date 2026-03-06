import { ActionButton, FormInput, FormSelect } from '@/components/ui';

import type { MasterDataFilters, TabConfig } from './master-data-config';
import { sharedFilters } from './master-data-config';

interface MasterDataToolbarProps {
  currentConfig: TabConfig;
  deleting: boolean;
  disableEdit: boolean;
  disableReset: boolean;
  disableDelete: boolean;
  filters: MasterDataFilters;
  onCodeChange: (value: string) => void;
  onDelete: () => void;
  onEdit: () => void;
  onResetFilters: () => void;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function MasterDataToolbar({
  currentConfig,
  deleting,
  disableDelete,
  disableEdit,
  disableReset,
  filters,
  onCodeChange,
  onDelete,
  onEdit,
  onResetFilters,
  onSearchChange,
  onStatusChange,
}: MasterDataToolbarProps) {
  return (
    <div
      style={{
        display: 'grid',
        gap: 12,
        padding: '16px 18px',
        background: '#FFFFFF',
        border: '1px solid #E0DDD8',
        borderRadius: 8,
      }}
    >
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <FormInput
          label="按名称筛选"
          placeholder={currentConfig.searchPlaceholder}
          value={filters.name}
          onChange={onSearchChange}
        />
        <FormInput
          label="按编码筛选"
          placeholder={`输入${currentConfig.label}编码`}
          value={filters.code}
          onChange={onCodeChange}
        />
        <FormSelect
          label="状态"
          placeholder="全部状态"
          options={sharedFilters[0]!.options}
          value={filters.isActive}
          onChange={onStatusChange}
        />
      </div>

      <div
        style={{
          display: 'flex',
          gap: 8,
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ fontSize: 12, color: '#666666', lineHeight: 1.5 }}>
          先在表格中选择一条记录，再执行编辑或删除。
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <ActionButton
            label="重置筛选"
            tone="ghost"
            onClick={disableReset ? undefined : onResetFilters}
            disabled={disableReset}
          />
          <ActionButton
            label="编辑选中项"
            tone="secondary"
            onClick={disableEdit ? undefined : onEdit}
            disabled={disableEdit}
          />
          <ActionButton
            label={deleting ? '删除中...' : '删除选中项'}
            tone="secondary"
            onClick={disableDelete ? undefined : onDelete}
            disabled={disableDelete}
          />
        </div>
      </div>
    </div>
  );
}
