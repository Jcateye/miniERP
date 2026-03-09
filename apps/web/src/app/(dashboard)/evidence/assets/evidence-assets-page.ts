export type EvidenceAssetFilter = 'document-record' | 'manufacturing-asset' | 'event-log' | 'all';

export type EvidenceAssetListItem = {
  id: string;
  fileName: string;
  relatedDocument: string;
  uploadedAtLabel: string;
  sizeLabel: string;
  actions: 'download-delete' | 'download-only';
  filter: EvidenceAssetFilter;
};

export type EvidenceAssetListRow = {
  id: string;
  fileName: string;
  relatedDocument: string;
  uploadedAt: string;
  size: string;
  actions: 'download-delete' | 'download-only';
  detailHref?: string;
};

export type EvidenceAssetColumn = {
  key: keyof EvidenceAssetListRow;
  label: string;
};

export const EVIDENCE_ASSET_PAGE_PRESENTATION = {
  family: 'T2',
  variant: 'search-list',
  title: '附件管理',
  summary: '文档记录 · 制造资产 · 事件日志',
  searchPlaceholder: '搜索文件名, 单据号...',
  apiBasePath: '/api/bff/evidence/assets',
} as const;

export const EVIDENCE_ASSET_FILTER_OPTIONS: ReadonlyArray<{ value: EvidenceAssetFilter; label: string }> = [
  { value: 'document-record', label: '文档记录' },
  { value: 'manufacturing-asset', label: '制造资产' },
  { value: 'event-log', label: '事件日志' },
];

export const EVIDENCE_ASSET_LIST_COLUMNS: readonly EvidenceAssetColumn[] = [
  { key: 'fileName', label: '文件名' },
  { key: 'relatedDocument', label: '所属单据' },
  { key: 'uploadedAt', label: '上传时间' },
  { key: 'size', label: '大小' },
  { key: 'actions', label: '操作' },
];

export function getSeedEvidenceAssetListItems(): EvidenceAssetListItem[] {
  return [
    {
      id: 'asset_001',
      fileName: 'invoice-20260342.pdf',
      relatedDocument: 'GRN-2026-026-001',
      uploadedAtLabel: '2026-02-28',
      sizeLabel: '1.2 MB',
      actions: 'download-delete',
      filter: 'document-record',
    } satisfies EvidenceAssetListItem,
    {
      id: 'asset_002',
      fileName: 'event-ops-logs.zip',
      relatedDocument: 'EVT-2026-019',
      uploadedAtLabel: '2026-02-27',
      sizeLabel: '780 KB',
      actions: 'download-only',
      filter: 'event-log',
    } satisfies EvidenceAssetListItem,
  ].map((item) => ({ ...item }));
}

function includesKeyword(value: string | null | undefined, keyword: string): boolean {
  return (value ?? '').toLowerCase().includes(keyword.toLowerCase());
}

export function buildEvidenceAssetRows(items: readonly EvidenceAssetListItem[]): EvidenceAssetListRow[] {
  return items.map((item) => ({
    id: item.id,
    fileName: item.fileName,
    relatedDocument: item.relatedDocument,
    uploadedAt: item.uploadedAtLabel,
    size: item.sizeLabel,
    actions: item.actions,
    detailHref: undefined,
  }));
}

export function parseEvidenceAssetSearchParams(searchParams: URLSearchParams): {
  keyword: string;
  filter: EvidenceAssetFilter;
} {
  const keyword = searchParams.get('keyword')?.trim() ?? '';
  const filterParam = searchParams.get('filter');
  const filter = EVIDENCE_ASSET_FILTER_OPTIONS.some((option) => option.value === filterParam)
    ? (filterParam as EvidenceAssetFilter)
    : 'document-record';

  return { keyword, filter };
}

export function buildEvidenceAssetSearchQuery(filters: {
  keyword: string;
  filter: EvidenceAssetFilter;
}): string {
  const params = new URLSearchParams();

  if (filters.keyword.trim()) {
    params.set('keyword', filters.keyword.trim());
  }

  if (filters.filter !== 'document-record') {
    params.set('filter', filters.filter);
  }

  return params.toString();
}

export function filterEvidenceAssetListItems(
  items: readonly EvidenceAssetListItem[],
  filters: { keyword: string; filter: EvidenceAssetFilter },
): EvidenceAssetListItem[] {
  const keyword = filters.keyword.trim();

  return items.filter((item) => {
    const matchesKeyword =
      !keyword || includesKeyword(item.fileName, keyword) || includesKeyword(item.relatedDocument, keyword);
    const matchesFilter = filters.filter === 'all' || item.filter === filters.filter;

    return matchesKeyword && matchesFilter;
  });
}

export function getNextEvidenceAssetFilter(
  nextFilter: EvidenceAssetFilter,
  activeFilter: EvidenceAssetFilter,
): EvidenceAssetFilter {
  return nextFilter === activeFilter ? 'all' : nextFilter;
}
