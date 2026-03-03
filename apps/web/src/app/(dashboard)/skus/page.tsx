import { WorkbenchAssembly } from '@/components/business/erp-page-assemblies';
import { skuWorkbenchConfig } from '@/components/business/erp-page-config';

export default function SkuPage() {
  return <WorkbenchAssembly config={skuWorkbenchConfig} />;
}
