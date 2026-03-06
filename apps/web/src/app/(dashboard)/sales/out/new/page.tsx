import { WizardAssembly } from '@/components/business/erp-page-assemblies';
import { outWizardConfig } from '@/components/business/erp-page-config';

export default function OutNewPage() {
  return <WizardAssembly config={outWizardConfig} />;
}
