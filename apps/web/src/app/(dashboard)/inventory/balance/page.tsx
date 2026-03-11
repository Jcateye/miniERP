import { Suspense } from 'react';

import View from '@/components/views/erp/integrated/inventory/balance/view';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <View />
    </Suspense>
  );
}
