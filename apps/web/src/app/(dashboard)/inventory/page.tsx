import { Suspense } from 'react';

import { WorkbenchAssembly } from '@/components/business/erp-page-assemblies';
import { inventoryWorkbenchConfig } from '@/components/business/erp-page-config';

export default function InventoryWorkbenchPage() {
  return (
    <Suspense fallback={null}>
      <WorkbenchAssembly config={inventoryWorkbenchConfig} />
    </Suspense>
  );
}
