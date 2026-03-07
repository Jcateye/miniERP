'use client';

import { Suspense, useMemo } from 'react';

import { ActionButton, DataTable, type TableColumn } from '@/components/ui';

import {
  buildQualityRecordListRows,
  QUALITY_RECORD_LIST_COLUMNS,
  QUALITY_RECORD_PAGE_PRESENTATION,
  type QualityRecordListRow,
} from './records-page';
import { QualityRecordsPageScaffold } from './records-page-view';
import { useQualityRecordsPageVm } from './use-records-page-vm';

function getQualityRecordTableColumns(): TableColumn[] {
  return QUALITY_RECORD_LIST_COLUMNS.map((column) => ({
    key: column.key,
    label: column.label,
    width:
      column.key === 'recordNumber'
        ? 160
        : column.key === 'inspectionType'
          ? 120
          : column.key === 'sourceNumber'
            ? 160
            : column.key === 'subject'
              ? 220
              : column.key === 'inspectorName'
                ? 100
                : column.key === 'conclusion'
                  ? 100
                  : 140,
    render:
      column.key === 'actions'
        ? (value) =>
            value === 'inspect-review' ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <ActionButton label="检验" tone="secondary" disabled />
                <ActionButton label="复核" tone="primary" disabled />
              </div>
            ) : (
              <ActionButton label="查看" tone="secondary" disabled />
            )
        : undefined,
  })) satisfies TableColumn[];
}

function QualityRecordsPageContent() {
  const { keywordInput, scopeInput, setKeywordInput, setScopeInput, visibleItems } = useQualityRecordsPageVm();
  const rows = useMemo<QualityRecordListRow[]>(() => buildQualityRecordListRows(visibleItems), [visibleItems]);
  const tableRows = useMemo<Record<string, string>[]>(
    () =>
      rows.map(({ id, recordNumber, inspectionType, sourceNumber, subject, inspectorName, conclusion, actions }) => ({
        id,
        recordNumber,
        inspectionType,
        sourceNumber,
        subject,
        inspectorName,
        conclusion,
        actions,
      })),
    [rows],
  );
  const columns = useMemo(() => getQualityRecordTableColumns(), []);

  return (
    <QualityRecordsPageScaffold
      title={QUALITY_RECORD_PAGE_PRESENTATION.title}
      summary={QUALITY_RECORD_PAGE_PRESENTATION.summary}
      searchPlaceholder={QUALITY_RECORD_PAGE_PRESENTATION.searchPlaceholder}
      keyword={keywordInput}
      onKeywordChange={setKeywordInput}
      activeScope={scopeInput}
      onScopeChange={setScopeInput}
      table={<DataTable columns={columns} rows={tableRows} showPagination={false} />}
    />
  );
}

export default function QualityRecordsPage() {
  return (
    <Suspense fallback={null}>
      <QualityRecordsPageContent />
    </Suspense>
  );
}
