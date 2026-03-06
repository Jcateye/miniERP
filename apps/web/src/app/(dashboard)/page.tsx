import { OverviewAssembly } from '@/components/business/erp-page-assemblies';
import { dashboardOverviewConfig } from '@/components/business/erp-page-config';

export default function DashboardHomePage() {
  return <OverviewAssembly config={dashboardOverviewConfig} />;
}
