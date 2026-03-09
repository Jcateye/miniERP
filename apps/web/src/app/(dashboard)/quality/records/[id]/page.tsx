import {
  buildQualityRecordDetailSections,
  buildQualityRecordDetailSummary,
  QUALITY_RECORD_DETAIL_PAGE_PRESENTATION,
} from './quality-record-detail-page';
import { QualityRecordDetailPageScaffold } from './quality-record-detail-page-view';

export default async function QualityRecordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <QualityRecordDetailPageScaffold
      title={QUALITY_RECORD_DETAIL_PAGE_PRESENTATION.title}
      summary={QUALITY_RECORD_DETAIL_PAGE_PRESENTATION.summary}
      backLabel={QUALITY_RECORD_DETAIL_PAGE_PRESENTATION.backLabel}
      backHref={QUALITY_RECORD_DETAIL_PAGE_PRESENTATION.backHref}
      summaryItems={buildQualityRecordDetailSummary(id)}
      sections={buildQualityRecordDetailSections()}
    />
  );
}
