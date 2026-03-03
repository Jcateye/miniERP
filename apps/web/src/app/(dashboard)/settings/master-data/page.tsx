import { WorkbenchAssembly } from '@/components/business/erp-page-assemblies';
import { masterDataConfig } from '@/components/business/erp-page-config';

export default function MasterDataPage() {
  return <WorkbenchAssembly config={masterDataConfig} />;
}
