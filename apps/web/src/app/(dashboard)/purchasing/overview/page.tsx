import { OverviewAssembly } from '@/components/business/erp-page-assemblies';
import { purchasingOverviewConfig } from '@/components/business/erp-page-config';

export default function PurchasingOverviewPage() {
  return <OverviewAssembly config={purchasingOverviewConfig} />;
}
