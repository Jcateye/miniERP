import { Suspense } from 'react';

import { WorkbenchAssembly } from '@/components/business/erp-page-assemblies';
import { stocktakeWorkbenchConfig } from '@/components/business/erp-page-config';

export default function StocktakeWorkbenchPage() {
  return (
    <Suspense fallback={null}>
      <WorkbenchAssembly config={stocktakeWorkbenchConfig} />
    </Suspense>
  );
}
