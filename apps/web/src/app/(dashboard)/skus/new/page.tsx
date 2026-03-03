import { WizardAssembly } from '@/components/business/erp-page-assemblies';
import { skuWizardConfig } from '@/components/business/erp-page-config';

export default function SkuNewPage() {
  return <WizardAssembly config={skuWizardConfig} />;
}
