import { WizardAssembly } from '@/components/business/erp-page-assemblies';
import { quotationWizardConfig } from '@/components/business/erp-page-config';

export default function QuotationNewPage() {
  return <WizardAssembly config={quotationWizardConfig} />;
}
