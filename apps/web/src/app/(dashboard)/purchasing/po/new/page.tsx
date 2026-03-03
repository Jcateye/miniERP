import { WizardAssembly } from '@/components/business/erp-page-assemblies';
import { poWizardConfig } from '@/components/business/erp-page-config';

export default function PurchaseOrderNewPage() {
  return <WizardAssembly config={poWizardConfig} />;
}
