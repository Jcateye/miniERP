import { WorkbenchAssembly } from '@/components/business/erp-page-assemblies';
import { grnWorkbenchConfig } from '@/components/business/erp-page-config';

export default function GrnWorkbenchPage() {
  return <WorkbenchAssembly config={grnWorkbenchConfig} />;
}
