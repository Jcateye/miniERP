import {
  buildInventoryCountDetailSections,
  buildInventoryCountDetailSummary,
  INVENTORY_COUNT_DETAIL_PAGE_PRESENTATION,
} from './inventory-count-detail-page';
import { InventoryCountDetailPageScaffold } from './inventory-count-detail-page-view';

export default async function InventoryCountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <InventoryCountDetailPageScaffold
      title={INVENTORY_COUNT_DETAIL_PAGE_PRESENTATION.title}
      summary={INVENTORY_COUNT_DETAIL_PAGE_PRESENTATION.summary}
      backLabel={INVENTORY_COUNT_DETAIL_PAGE_PRESENTATION.backLabel}
      backHref={INVENTORY_COUNT_DETAIL_PAGE_PRESENTATION.backHref}
      primaryActionLabel={INVENTORY_COUNT_DETAIL_PAGE_PRESENTATION.primaryActionLabel}
      summaryItems={buildInventoryCountDetailSummary(id)}
      sections={buildInventoryCountDetailSections()}
    />
  );
}
