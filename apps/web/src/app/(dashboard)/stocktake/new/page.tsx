import { WizardAssembly } from '@/components/business/erp-page-assemblies';
import { stocktakeWizardConfig } from '@/components/business/erp-page-config';

export default function StocktakeNewPage() {
  return <WizardAssembly config={stocktakeWizardConfig} />;
}
