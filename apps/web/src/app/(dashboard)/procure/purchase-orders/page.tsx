import { Suspense } from 'react';

import View from '@/components/views/erp/integrated/procure/purchase-orders/view';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <View />
    </Suspense>
  );
}
