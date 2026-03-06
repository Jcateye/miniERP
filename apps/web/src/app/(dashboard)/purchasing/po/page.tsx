import { Suspense } from 'react';

import { WorkbenchAssembly } from '@/components/business/erp-page-assemblies';
import { poWorkbenchConfig } from '@/components/business/erp-page-config';

export default function PurchaseOrderWorkbenchPage() {
  return (
    <Suspense fallback={null}>
      <WorkbenchAssembly config={poWorkbenchConfig} />
    </Suspense>
  );
}
