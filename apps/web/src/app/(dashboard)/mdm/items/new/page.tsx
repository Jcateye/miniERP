import { WizardAssembly } from '@/components/business/erp-page-assemblies';
import {
  skuWizardConfig,
  type WizardAssemblyConfig,
} from '@/components/business/erp-page-config';

const itemWizardConfig: WizardAssemblyConfig = {
  ...skuWizardConfig,
  contract: {
    ...skuWizardConfig.contract,
    route: '/mdm/items/new',
    title: '新建物料',
    summary: '按统一物料模板创建主数据，并保留旧 SKU 字段兼容能力。',
    header: {
      ...skuWizardConfig.contract.header,
      title: '新建物料',
      description: '按统一物料模板创建主数据，并保留旧 SKU 字段兼容能力。',
      primaryAction: {
        key: 'submit-item',
        label: '提交物料',
        tone: 'primary' as const,
      },
    },
  },
  entityType: 'item' as const,
  alerts: [
    '新物料必须至少上传 1 张产品照与 1 份规格书。',
    '提交后会兼容映射到旧 SKU 能力，迁移期不丢字段。',
  ],
  summaryNotes: [
    '提交后自动创建物料主数据审计记录。',
    '建议同步维护外部料号映射、替代料与标签模板。',
  ],
};

export default function ItemNewPage() {
  return <WizardAssembly config={itemWizardConfig} />;
}
