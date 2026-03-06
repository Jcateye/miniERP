import { Suspense } from 'react';

import { WorkbenchAssembly } from '@/components/business/erp-page-assemblies';
import { quotationWorkbenchConfig } from '@/components/business/erp-page-config';

export default function QuotationWorkbenchPage() {
  return (
    <Suspense fallback={null}>
      <WorkbenchAssembly config={quotationWorkbenchConfig} />
    </Suspense>
  );
}
