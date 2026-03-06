import { Suspense } from 'react';

import { WorkbenchAssembly } from '@/components/business/erp-page-assemblies';
import { inventoryLedgerConfig } from '@/components/business/erp-page-config';

export default function InventoryLedgerPage() {
  return (
    <Suspense fallback={null}>
      <WorkbenchAssembly config={inventoryLedgerConfig} />
    </Suspense>
  );
}
