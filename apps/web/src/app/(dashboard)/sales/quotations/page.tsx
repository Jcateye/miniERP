import { WorkbenchAssembly } from '@/components/business/erp-page-assemblies';
import { quotationWorkbenchConfig } from '@/components/business/erp-page-config';

export default function QuotationWorkbenchPage() {
  return <WorkbenchAssembly config={quotationWorkbenchConfig} />;
}
