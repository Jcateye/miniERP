import { ActionButton, FormInput, FormSelect } from '@/components/ui';

import type {
  MasterDataFormValues,
  MasterDataOperation,
  MasterDataTab,
  TabConfig,
} from './master-data-config';

interface MasterDataFormCardProps {
  activeTab: MasterDataTab;
  currentConfig: TabConfig;
  draft: MasterDataFormValues;
  operation: MasterDataOperation;
  submitting: boolean;
  onClose: () => void;
  onDraftChange: <K extends keyof MasterDataFormValues>(
    key: K,
    value: MasterDataFormValues[K],
  ) => void;
  onSubmit: () => void;
}

export function MasterDataFormCard({
  activeTab,
  currentConfig,
  draft,
  operation,
  submitting,
  onClose,
  onDraftChange,
  onSubmit,
}: MasterDataFormCardProps) {
  const isCreate = operation === 'create';
  const showEmail = activeTab === 'suppliers' || activeTab === 'customers';

  return (
    <div
      style={{
        display: 'grid',
        gap: 16,
        padding: '20px 24px',
        background: '#FFFFFF',
        border: '1px solid #E0DDD8',
        borderRadius: 8,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A' }}>
            {isCreate ? `新建${currentConfig.label}` : `编辑${currentConfig.label}`}
          </div>
          <div style={{ marginTop: 4, fontSize: 13, color: '#666666' }}>
            {isCreate
              ? '填写最小字段即可立即写入真实主数据。'
              : '编码为只读字段，保存后列表会立即刷新。'}
          </div>
        </div>
        <ActionButton label="关闭" tone="ghost" onClick={onClose} disabled={submitting} />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 12,
        }}
      >
        <FormInput
          label="编码"
          value={draft.code}
          onChange={(value) => onDraftChange('code', value)}
          required
          readOnly={!isCreate}
        />
        <FormInput
          label="名称"
          value={draft.name}
          onChange={(value) => onDraftChange('name', value)}
          required
        />
        <FormInput
          label="联系人"
          value={draft.contactPerson}
          onChange={(value) => onDraftChange('contactPerson', value)}
        />
        <FormInput
          label="联系电话"
          value={draft.contactPhone}
          onChange={(value) => onDraftChange('contactPhone', value)}
        />
        {showEmail ? (
          <FormInput
            label="邮箱"
            value={draft.email}
            onChange={(value) => onDraftChange('email', value)}
          />
        ) : null}
        <FormSelect
          label="状态"
          placeholder="选择状态"
          options={[
            { label: '启用', value: 'true' },
            { label: '停用', value: 'false' },
          ]}
          value={draft.isActive}
          onChange={(value) => onDraftChange('isActive', value)}
        />
      </div>

      <FormInput
        label="地址"
        value={draft.address}
        onChange={(value) => onDraftChange('address', value)}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
        <ActionButton label="取消" tone="ghost" onClick={onClose} disabled={submitting} />
        <ActionButton
          label={submitting ? '保存中...' : isCreate ? '创建并刷新' : '保存并刷新'}
          tone="primary"
          onClick={onSubmit}
          disabled={submitting}
        />
      </div>
    </div>
  );
}
