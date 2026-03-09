import { describe, expect, it, mock } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

mock.module('next/navigation', () => ({
  usePathname: () => '/evidence/assets',
  useRouter: () => ({ replace: () => undefined }),
  useSearchParams: () => new URLSearchParams(''),
}));

import EvidenceAssetsPage from './page';
import {
  buildEvidenceAssetRows,
  buildEvidenceAssetSearchQuery,
  EVIDENCE_ASSET_FILTER_OPTIONS,
  EVIDENCE_ASSET_LIST_COLUMNS,
  EVIDENCE_ASSET_PAGE_PRESENTATION,
  filterEvidenceAssetListItems,
  getNextEvidenceAssetFilter,
  parseEvidenceAssetSearchParams,
  type EvidenceAssetFilter,
  type EvidenceAssetListItem,
} from './evidence-assets-page';
import { EvidenceAssetsPageScaffold } from './evidence-assets-page-view';

describe('evidence assets page contract', () => {
  it('uses evidence-asset-specific T2 page presentation', () => {
    expect(EVIDENCE_ASSET_PAGE_PRESENTATION).toMatchObject({
      family: 'T2',
      variant: 'search-list',
      title: '附件管理',
      summary: '文档记录 · 制造资产 · 事件日志',
      searchPlaceholder: '搜索文件名, 单据号...',
      apiBasePath: '/api/bff/evidence/assets',
    });
  });

  it('uses design-aligned evidence asset chips and columns', () => {
    expect(EVIDENCE_ASSET_FILTER_OPTIONS.map((option) => option.label)).toEqual(['文档记录', '制造资产', '事件日志']);

    expect(EVIDENCE_ASSET_LIST_COLUMNS.map((column) => column.label)).toEqual([
      '文件名',
      '所属单据',
      '上传时间',
      '大小',
      '操作',
    ]);
  });

  it('maps seeded items into design-shaped evidence asset rows', () => {
    const rows = buildEvidenceAssetRows([
      {
        id: 'asset_001',
        fileName: 'invoice-20260342.pdf',
        relatedDocument: 'GRN-2026-026-001',
        uploadedAtLabel: '2026-02-28',
        sizeLabel: '1.2 MB',
        actions: 'download-delete',
        filter: 'document-record',
      } satisfies EvidenceAssetListItem,
    ]);

    expect(rows).toEqual([
      {
        id: 'asset_001',
        fileName: 'invoice-20260342.pdf',
        relatedDocument: 'GRN-2026-026-001',
        uploadedAt: '2026-02-28',
        size: '1.2 MB',
        actions: 'download-delete',
        detailHref: undefined,
      },
    ]);
  });

  it('parses and rebuilds evidence asset search params with filter and keyword', () => {
    const filters = parseEvidenceAssetSearchParams(new URLSearchParams('keyword=%20invoice%20&filter=event-log'));

    expect(filters).toEqual({
      keyword: 'invoice',
      filter: 'event-log',
    });

    expect(buildEvidenceAssetSearchQuery(filters)).toBe('keyword=invoice&filter=event-log');
  });

  it('filters evidence asset list items by keyword and filter', () => {
    const items: EvidenceAssetListItem[] = [
      {
        id: 'asset_001',
        fileName: 'invoice-20260342.pdf',
        relatedDocument: 'GRN-2026-026-001',
        uploadedAtLabel: '2026-02-28',
        sizeLabel: '1.2 MB',
        actions: 'download-delete',
        filter: 'document-record',
      },
      {
        id: 'asset_002',
        fileName: 'event-ops-logs.zip',
        relatedDocument: 'EVT-2026-019',
        uploadedAtLabel: '2026-02-27',
        sizeLabel: '780 KB',
        actions: 'download-only',
        filter: 'event-log',
      },
    ];

    expect(filterEvidenceAssetListItems(items, { keyword: 'invoice', filter: 'all' })).toHaveLength(1);
    expect(filterEvidenceAssetListItems(items, { keyword: '', filter: 'event-log' })).toHaveLength(1);
    expect(filterEvidenceAssetListItems(items, { keyword: 'invoice', filter: 'event-log' })).toHaveLength(0);
  });

  it('toggles evidence asset filter selection like the design chips', () => {
    expect(getNextEvidenceAssetFilter('document-record', 'document-record')).toBe('all');
    expect(getNextEvidenceAssetFilter('event-log', 'document-record')).toBe('event-log');
  });

  it('renders design scaffold regions for the evidence assets page', () => {
    const markup = renderToStaticMarkup(
      <EvidenceAssetsPageScaffold
        title={EVIDENCE_ASSET_PAGE_PRESENTATION.title}
        summary={EVIDENCE_ASSET_PAGE_PRESENTATION.summary}
        searchPlaceholder={EVIDENCE_ASSET_PAGE_PRESENTATION.searchPlaceholder}
        keyword=""
        onKeywordChange={() => undefined}
        activeFilter="document-record"
        onFilterChange={() => undefined}
        table={<div>table-body</div>}
      />,
    );

    expect(markup).toContain('data-testid="evidence-assets-topbar"');
    expect(markup).toContain('data-testid="evidence-assets-search"');
    expect(markup).toContain('data-testid="evidence-assets-filters"');
    expect(markup).toContain('data-testid="evidence-assets-table"');
    expect(markup).toContain('附件管理');
    expect(markup).toContain('文档记录 · 制造资产 · 事件日志');
    expect(markup).toContain('文档记录');
    expect(markup).toContain('制造资产');
    expect(markup).toContain('事件日志');
    expect(markup).toContain('搜索文件名, 单据号...');
  });

  it('renders the real page instead of old attachments export', () => {
    const markup = renderToStaticMarkup(<EvidenceAssetsPage />);

    expect(markup).toContain('附件管理');
    expect(markup).toContain('文件名');
    expect(markup).toContain('所属单据');
    expect(markup).toContain('上传时间');
    expect(markup).toContain('大小');
    expect(markup).toContain('操作');
    expect(markup).toContain('invoice-20260342.pdf');
    expect(markup).not.toContain('attachments/page');
  });
});
