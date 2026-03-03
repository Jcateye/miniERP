import { WorkbenchAssembly } from '@/components/business/erp-page-assemblies';
import { outWorkbenchConfig } from '@/components/business/erp-page-config';

export default function OutWorkbenchPage() {
  return <WorkbenchAssembly config={outWorkbenchConfig} />;
}
