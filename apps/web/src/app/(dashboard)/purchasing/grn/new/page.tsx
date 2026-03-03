import { WizardAssembly } from '@/components/business/erp-page-assemblies';
import { grnWizardConfig } from '@/components/business/erp-page-config';

export default function GrnNewPage() {
  return <WizardAssembly config={grnWizardConfig} />;
}
