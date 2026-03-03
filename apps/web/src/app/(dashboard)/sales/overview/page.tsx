import { OverviewAssembly } from '@/components/business/erp-page-assemblies';
import { salesOverviewConfig } from '@/components/business/erp-page-config';

export default function SalesOverviewPage() {
  return <OverviewAssembly config={salesOverviewConfig} />;
}
