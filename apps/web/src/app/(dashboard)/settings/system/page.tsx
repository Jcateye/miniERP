import { Suspense } from 'react';

import { WorkbenchAssembly } from '@/components/business/erp-page-assemblies';
import { systemSettingsConfig } from '@/components/business/erp-page-config';

export default function SystemSettingsPage() {
  return (
    <Suspense fallback={null}>
      <WorkbenchAssembly config={systemSettingsConfig} />
    </Suspense>
  );
}
