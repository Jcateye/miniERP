import { Suspense } from 'react';

import { WorkbenchAssembly } from '@/components/business/erp-page-assemblies';
import { inventoryReorderConfig } from '@/components/business/erp-page-config';

export default function InventoryReorderPage() {
  return (
    <Suspense fallback={null}>
      <WorkbenchAssembly config={inventoryReorderConfig} />
    </Suspense>
  );
}
