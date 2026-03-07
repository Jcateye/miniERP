'use client';

import { Suspense, useMemo } from 'react';

import { DataTable, type TableColumn } from '@/components/ui';

import {
  buildJournalListRows,
  JOURNAL_LIST_COLUMNS,
  JOURNAL_PAGE_PRESENTATION,
  type JournalListRow,
} from './journals-page';
import { JournalsPageScaffold } from './journals-page-view';
import { useJournalsPageVm } from './use-journals-page-vm';

function getJournalTableColumns(): TableColumn[] {
  return JOURNAL_LIST_COLUMNS.map((column) => ({
    key: column.key,
    label: column.label,
    width:
      column.key === 'code'
        ? 130
        : column.key === 'journalDate'
          ? 100
          : column.key === 'summary'
            ? 180
            : column.key === 'ledgerName'
              ? 120
              : column.key === 'debitAmount'
                ? 100
                : column.key === 'creditAmount'
                  ? 100
                  : undefined,
  })) satisfies TableColumn[];
}

function FinanceJournalsPageContent() {
  const { items } = useJournalsPageVm();
  const rows = useMemo<JournalListRow[]>(() => buildJournalListRows(items), [items]);
  const columns = useMemo(() => getJournalTableColumns(), []);

  return (
    <JournalsPageScaffold
      title={JOURNAL_PAGE_PRESENTATION.title}
      summary={JOURNAL_PAGE_PRESENTATION.summary}
      primaryActionLabel={JOURNAL_PAGE_PRESENTATION.primaryActionLabel}
      seedNotice={JOURNAL_PAGE_PRESENTATION.seedNotice}
      table={<DataTable columns={columns} rows={rows as unknown as Record<string, string>[]} />}
    />
  );
}

export default function FinanceJournalsPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '32px 40px', fontSize: 14, color: '#666666', background: '#F5F3EF' }}>
          正在加载凭证列表...
        </div>
      }
    >
      <FinanceJournalsPageContent />
    </Suspense>
  );
}
