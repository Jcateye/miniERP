import { describe, expect, it, mock } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

mock.module('next/navigation', () => ({
  usePathname: () => '/quality/records',
  useRouter: () => ({
    replace: () => undefined,
  }),
  useSearchParams: () => new URLSearchParams(''),
}));

import QualityRecordsPage from './page';
import {
  buildQualityRecordListRows,
  buildQualityRecordSearchQuery,
  filterQualityRecordListItems,
  parseQualityRecordSearchParams,
  QUALITY_RECORD_LIST_COLUMNS,
  QUALITY_RECORD_PAGE_PRESENTATION,
  type QualityRecordListItem,
} from './records-page';
import { getNextQualityRecordScope, QualityRecordsPageScaffold } from './records-page-view';

describe('quality records page contract', () => {
  it('uses quality-record-specific T2 page presentation', () => {
    expect(QUALITY_RECORD_PAGE_PRESENTATION).toMatchObject({
      family: 'T2',
      variant: 'search-list',
      title: '质检记录工作台',
      summary: '来料检验 · 过程检验 · 出货检验',
      searchPlaceholder: '搜索记录编号, 批次, 物料, 质检员...',
      apiBasePath: '/api/bff/quality/records',
    });
  });

  it('uses design-aligned quality record table columns', () => {
    expect(QUALITY_RECORD_LIST_COLUMNS.map((column) => column.label)).toEqual([
      '记录编号',
      '检验类型',
      '批次 / 单据',
      '物料 / 订单',
      '质检员',
      '结论',
      '操作',
    ]);
  });

  it('maps quality record items into design-shaped list rows', () => {
    const rows = buildQualityRecordListRows([
      {
        id: 'qc_001',
        recordNumber: 'QC-20260308-001',
        inspectionTypeLabel: '来料检验',
        sourceNumber: 'DOC-PO-20260305-008',
        subjectLabel: '网络交换机批次 A01',
        inspectorName: '王五',
        conclusionLabel: '待检',
        status: 'pending',
      } satisfies QualityRecordListItem,
    ]);

    expect(rows).toEqual([
      {
        id: 'qc_001',
        recordNumber: 'QC-20260308-001',
        inspectionType: '来料检验',
        sourceNumber: 'DOC-PO-20260305-008',
        subject: '网络交换机批次 A01',
        inspectorName: '王五',
        conclusion: '待检',
        actions: 'inspect-review',
      },
    ]);
  });

  it('falls back missing display fields to design-safe placeholders', () => {
    const rows = buildQualityRecordListRows([
      {
        id: 'qc_002',
        recordNumber: 'QC-20260308-002',
        inspectionTypeLabel: null,
        sourceNumber: null,
        subjectLabel: null,
        inspectorName: null,
        conclusionLabel: null,
        status: 'closed',
      } satisfies QualityRecordListItem,
    ]);

    expect(rows[0]).toMatchObject({
      inspectionType: '—',
      sourceNumber: '—',
      subject: '—',
      inspectorName: '—',
      conclusion: '—',
      actions: 'view-only',
    });
  });

  it('parses and rebuilds quality record search params with trimmed values', () => {
    const filters = parseQualityRecordSearchParams(
      new URLSearchParams('keyword=%20王五%20&scope=mine-pending'),
    );

    expect(filters).toEqual({
      keyword: '王五',
      scope: 'mine-pending',
    });

    expect(buildQualityRecordSearchQuery(filters)).toBe(
      'keyword=%E7%8E%8B%E4%BA%94&scope=mine-pending',
    );
  });

  it('filters quality record list items by keyword and scope', () => {
    const items: QualityRecordListItem[] = [
      {
        id: 'qc_001',
        recordNumber: 'QC-20260308-001',
        inspectionTypeLabel: '来料检验',
        sourceNumber: 'DOC-PO-20260305-008',
        subjectLabel: '网络交换机批次 A01',
        inspectorName: '王五',
        conclusionLabel: '待检',
        status: 'pending',
      },
      {
        id: 'qc_002',
        recordNumber: 'QC-20260308-002',
        inspectionTypeLabel: '出货检验',
        sourceNumber: 'DOC-SHP-20260308-003',
        subjectLabel: '客户订单 SO-91',
        inspectorName: '赵六',
        conclusionLabel: '合格',
        status: 'passed',
      },
    ];

    expect(filterQualityRecordListItems(items, { keyword: '王五', scope: 'mine-pending' })).toHaveLength(1);
    expect(filterQualityRecordListItems(items, { keyword: 'QC-20260308-002', scope: 'mine-closed' })).toHaveLength(1);
    expect(filterQualityRecordListItems(items, { keyword: '网络交换机', scope: 'mine-closed' })).toHaveLength(0);
  });

  it('renders design scaffold regions for the quality records page', () => {
    const markup = renderToStaticMarkup(
      <QualityRecordsPageScaffold
        title={QUALITY_RECORD_PAGE_PRESENTATION.title}
        summary={QUALITY_RECORD_PAGE_PRESENTATION.summary}
        searchPlaceholder={QUALITY_RECORD_PAGE_PRESENTATION.searchPlaceholder}
        activeScope="mine-pending"
        onScopeChange={() => undefined}
        table={<div>table-body</div>}
      />,
    );

    expect(markup).toContain('data-testid="quality-records-topbar"');
    expect(markup).toContain('data-testid="quality-records-search"');
    expect(markup).toContain('data-testid="quality-records-filter-chips"');
    expect(markup).toContain('data-testid="quality-records-table"');
    expect(markup).toContain('质检记录工作台');
    expect(markup).toContain('来料检验 · 过程检验 · 出货检验');
    expect(markup).toContain('搜索记录编号, 批次, 物料, 质检员...');
    expect(markup).toContain('待我处理');
    expect(markup).toContain('已判定');
    expect(markup).toContain('我记录的');
  });

  it('lets users clear an active scope filter back to all quality records', () => {
    expect(getNextQualityRecordScope('mine-pending', 'mine-pending')).toBe('');
    expect(getNextQualityRecordScope('mine-closed', 'mine-pending')).toBe('mine-closed');
  });

  it('renders quality record action buttons as disabled placeholders before BFF wiring', () => {
    const markup = renderToStaticMarkup(<QualityRecordsPage />);

    expect(markup).toContain('>检验</button>');
    expect(markup).toContain('>复核</button>');
    expect(markup).toContain('>查看</button>');
    expect(markup).toContain('disabled=""');
  });

  it('renders the real page instead of the quality placeholder', () => {
    const markup = renderToStaticMarkup(<QualityRecordsPage />);

    expect(markup).toContain('质检记录工作台');
    expect(markup).toContain('来料检验 · 过程检验 · 出货检验');
    expect(markup).toContain('记录编号');
    expect(markup).toContain('检验类型');
    expect(markup).toContain('批次 / 单据');
    expect(markup).toContain('物料 / 订单');
    expect(markup).toContain('质检员');
    expect(markup).toContain('结论');
    expect(markup).toContain('操作');
    expect(markup).toContain('待我处理');
    expect(markup).toContain('已判定');
    expect(markup).toContain('我记录的');
    expect(markup).toContain('QC-20260308-001');
    expect(markup).toContain('QC-20260308-002');
    expect(markup).toContain('检验');
    expect(markup).toContain('复核');
    expect(markup).not.toContain('承接来料、过程、出货质检与不合格处置');
    expect(markup).not.toContain('制造总览');
  });
});
