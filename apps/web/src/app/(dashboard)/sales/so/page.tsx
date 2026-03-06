import { Suspense } from 'react';

import { WorkbenchAssembly } from '@/components/business/erp-page-assemblies';
import { soWorkbenchConfig } from '@/components/business/erp-page-config';

export default function SalesOrderWorkbenchPage() {
  return (
    <Suspense fallback={null}>
      <WorkbenchAssembly config={soWorkbenchConfig} />
    </Suspense>
  );
}
