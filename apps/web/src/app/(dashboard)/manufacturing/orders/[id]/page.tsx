import {
  buildManufacturingOrderDetailSections,
  buildManufacturingOrderDetailSummary,
  MANUFACTURING_ORDER_DETAIL_PAGE_PRESENTATION,
} from './manufacturing-order-detail-page';
import { ManufacturingOrderDetailPageScaffold } from './manufacturing-order-detail-page-view';

export default async function ManufacturingOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <ManufacturingOrderDetailPageScaffold
      title={id}
      summary={MANUFACTURING_ORDER_DETAIL_PAGE_PRESENTATION.summary}
      backLabel={MANUFACTURING_ORDER_DETAIL_PAGE_PRESENTATION.backLabel}
      backHref={MANUFACTURING_ORDER_DETAIL_PAGE_PRESENTATION.backHref}
      summaryItems={buildManufacturingOrderDetailSummary(id)}
      sections={buildManufacturingOrderDetailSections()}
    />
  );
}
