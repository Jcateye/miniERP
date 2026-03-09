'use client';

import { Suspense, useMemo } from 'react';

import { ActionButton, DataTable, type TableColumn } from '@/components/ui';

import {
  buildEvidenceAssetRows,
  EVIDENCE_ASSET_LIST_COLUMNS,
  EVIDENCE_ASSET_PAGE_PRESENTATION,
} from './evidence-assets-page';
import { EvidenceAssetsPageScaffold } from './evidence-assets-page-view';
import { useEvidenceAssetsPageVm } from './use-evidence-assets-page-vm';

function getEvidenceAssetTableColumns(): TableColumn[] {
  return EVIDENCE_ASSET_LIST_COLUMNS.map((column) => ({
    key: column.key,
    label: column.label,
    width:
      column.key === 'fileName'
        ? 220
        : column.key === 'relatedDocument'
          ? 180
          : column.key === 'uploadedAt'
            ? 120
            : column.key === 'size'
              ? 90
              : 120,
    render:
      column.key === 'actions'
        ? (value) =>
            value === 'download-delete' ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <ActionButton label="下载" tone="secondary" disabled />
                <ActionButton label="删除" tone="primary" disabled />
              </div>
            ) : (
              <ActionButton label="下载" tone="secondary" disabled />
            )
        : undefined,
  })) satisfies TableColumn[];
}

function EvidenceAssetsPageContent() {
  const { keywordInput, setKeywordInput, filterInput, setFilterInput, visibleItems } = useEvidenceAssetsPageVm();
  const rows = useMemo(() => buildEvidenceAssetRows(visibleItems), [visibleItems]);
  const tableRows = useMemo<Record<string, string>[]>(
    () =>
      rows.map(({ id, fileName, relatedDocument, uploadedAt, size, actions }) => ({
        id,
        fileName,
        relatedDocument,
        uploadedAt,
        size,
        actions,
      })),
    [rows],
  );
  const columns = useMemo(() => getEvidenceAssetTableColumns(), []);

  return (
    <EvidenceAssetsPageScaffold
      title={EVIDENCE_ASSET_PAGE_PRESENTATION.title}
      summary={EVIDENCE_ASSET_PAGE_PRESENTATION.summary}
      searchPlaceholder={EVIDENCE_ASSET_PAGE_PRESENTATION.searchPlaceholder}
      keyword={keywordInput}
      onKeywordChange={setKeywordInput}
      activeFilter={filterInput}
      onFilterChange={setFilterInput}
      table={<DataTable columns={columns} rows={tableRows} showPagination={false} />}
    />
  );
}

export default function EvidenceAssetsPage() {
  return (
    <Suspense fallback={null}>
      <EvidenceAssetsPageContent />
    </Suspense>
  );
}
