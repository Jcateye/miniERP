import { WizardAssembly } from '@/components/business/erp-page-assemblies';
import { soWizardConfig } from '@/components/business/erp-page-config';

export default function SalesOrderNewPage() {
  return <WizardAssembly config={soWizardConfig} />;
}
