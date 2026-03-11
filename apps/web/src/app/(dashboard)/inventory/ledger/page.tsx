import { Suspense } from 'react';

import View from '@/components/views/erp/integrated/inventory/ledger/view';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <View />
    </Suspense>
  );
}
