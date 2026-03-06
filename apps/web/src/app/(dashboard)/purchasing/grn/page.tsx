import { Suspense } from 'react';

import { WorkbenchAssembly } from '@/components/business/erp-page-assemblies';
import { grnWorkbenchConfig } from '@/components/business/erp-page-config';

export default function GrnWorkbenchPage() {
  return (
    <Suspense fallback={null}>
      <WorkbenchAssembly config={grnWorkbenchConfig} />
    </Suspense>
  );
}
