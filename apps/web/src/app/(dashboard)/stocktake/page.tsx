import { WorkbenchAssembly } from '@/components/business/erp-page-assemblies';
import { stocktakeWorkbenchConfig } from '@/components/business/erp-page-config';

export default function StocktakeWorkbenchPage() {
  return <WorkbenchAssembly config={stocktakeWorkbenchConfig} />;
}
