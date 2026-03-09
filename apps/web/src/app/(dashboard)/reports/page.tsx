import {
  REPORTS_CENTER_ENTRY_GROUPS,
  REPORTS_CENTER_KPIS,
  REPORTS_PAGE_PRESENTATION,
} from './reports-page';
import { ReportsPageScaffold } from './reports-page-view';

export default function ReportsPage() {
  return (
    <ReportsPageScaffold
      title={REPORTS_PAGE_PRESENTATION.title}
      summary={REPORTS_PAGE_PRESENTATION.summary}
      kpis={REPORTS_CENTER_KPIS}
      groups={REPORTS_CENTER_ENTRY_GROUPS}
    />
  );
}
