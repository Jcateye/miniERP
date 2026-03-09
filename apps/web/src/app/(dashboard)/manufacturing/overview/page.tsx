import {
  MANUFACTURING_OVERVIEW_METRICS,
  MANUFACTURING_OVERVIEW_PAGE_PRESENTATION,
  MANUFACTURING_OVERVIEW_QUICK_LINKS,
} from './manufacturing-overview-page';
import { ManufacturingOverviewPageScaffold } from './manufacturing-overview-page-view';

export default function ManufacturingOverviewPage() {
  return (
    <ManufacturingOverviewPageScaffold
      title={MANUFACTURING_OVERVIEW_PAGE_PRESENTATION.title}
      summary={MANUFACTURING_OVERVIEW_PAGE_PRESENTATION.summary}
      metrics={MANUFACTURING_OVERVIEW_METRICS}
      quickLinks={MANUFACTURING_OVERVIEW_QUICK_LINKS}
    />
  );
}
