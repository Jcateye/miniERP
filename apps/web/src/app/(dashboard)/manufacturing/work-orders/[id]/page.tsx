import {
  buildWorkOrderDetailSections,
  buildWorkOrderDetailSummary,
  WORK_ORDER_DETAIL_PAGE_PRESENTATION,
} from './work-order-detail-page';
import { WorkOrderDetailPageScaffold } from './work-order-detail-page-view';

export default async function WorkOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <WorkOrderDetailPageScaffold
      title={id}
      summary={WORK_ORDER_DETAIL_PAGE_PRESENTATION.summary}
      backLabel={WORK_ORDER_DETAIL_PAGE_PRESENTATION.backLabel}
      backHref={WORK_ORDER_DETAIL_PAGE_PRESENTATION.backHref}
      summaryItems={buildWorkOrderDetailSummary(id)}
      sections={buildWorkOrderDetailSections()}
    />
  );
}
