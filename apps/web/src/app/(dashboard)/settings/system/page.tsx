import { WorkbenchAssembly } from '@/components/business/erp-page-assemblies';
import { systemSettingsConfig } from '@/components/business/erp-page-config';

export default function SystemSettingsPage() {
  return <WorkbenchAssembly config={systemSettingsConfig} />;
}
