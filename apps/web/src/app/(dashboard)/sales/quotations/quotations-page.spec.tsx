import { describe, expect, it, mock } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

mock.module('next/navigation', () => ({
  usePathname: () => '/sales/quotations',
  useRouter: () => ({
    replace: () => undefined,
  }),
  useSearchParams: () => new URLSearchParams(''),
}));

import SalesQuotationsPage from './page';
import {
  buildQuotationListRows,
  buildQuotationSearchQuery,
  filterQuotationListItems,
  getNextQuotationFilter,
  parseQuotationSearchParams,
  QUOTATION_FILTER_OPTIONS,
  QUOTATION_LIST_COLUMNS,
  QUOTATION_PAGE_PRESENTATION,
  type QuotationFilter,
  type QuotationListItem,
} from './quotations-page';
import { SalesQuotationsPageScaffold } from './quotations-page-view';

describe('sales quotations page contract', () => {
  it('uses quotation-specific T2 page presentation', () => {
    expect(QUOTATION_PAGE_PRESENTATION).toMatchObject({
      family: 'T2',
      variant: 'search-list',
      title: '报价管理',
      summary: '报价单 · 管理工作台',
      primaryActionLabel: '新建报价',
      searchPlaceholder: '搜索报价编号, 客户...',
      apiBasePath: '/api/bff/sales/quotations',
    });
  });

  it('uses design-aligned quotation filter chips and columns', () => {
    expect(QUOTATION_FILTER_OPTIONS.map((option) => option.label)).toEqual(['全部', '草稿', '已发送', '已接受']);

    expect(QUOTATION_LIST_COLUMNS.map((column) => column.label)).toEqual([
      '报价编号',
      '客户',
      '报价日期',
      '有效期至',
      '金额',
      '版本',
      '状态',
    ]);
  });

  it('maps seeded items into design-shaped quotation rows', () => {
    const rows = buildQuotationListRows([
      {
        id: 'quo_001',
        quoteNumber: 'Q-20260305-018',
        customerName: '大疆创新',
        createdAtLabel: '2026-03-05',
        validUntilLabel: '2026-03-10',
        amountLabel: '¥95,400',
        versionLabel: 'V2',
        statusLabel: '已发送',
        filter: 'sent',
      } satisfies QuotationListItem,
    ]);

    expect(rows).toEqual([
      {
        id: 'quo_001',
        quoteNumber: 'Q-20260305-018',
        customerName: '大疆创新',
        createdAt: '2026-03-05',
        validUntil: '2026-03-10',
        amount: '¥95,400',
        version: 'V2',
        status: '已发送',
        detailHref: undefined,
      },
    ]);
  });

  it('parses and rebuilds quotation search params with filter and keyword', () => {
    const filters = parseQuotationSearchParams(new URLSearchParams('keyword=%20Apple%20&filter=sent'));

    expect(filters).toEqual({
      keyword: 'Apple',
      filter: 'sent',
    });

    expect(buildQuotationSearchQuery(filters)).toBe('keyword=Apple&filter=sent');
  });

  it('filters quotation list items by keyword and filter', () => {
    const items: QuotationListItem[] = [
      {
        id: 'quo_001',
        quoteNumber: 'Q-20260305-018',
        customerName: '大疆创新',
        createdAtLabel: '2026-03-05',
        validUntilLabel: '2026-03-10',
        amountLabel: '¥95,400',
        versionLabel: 'V2',
        statusLabel: '已发送',
        filter: 'sent',
      },
      {
        id: 'quo_002',
        quoteNumber: 'Q-20260301-006',
        customerName: 'Apple采购组',
        createdAtLabel: '2026-03-01',
        validUntilLabel: '2026-03-08',
        amountLabel: '¥76,000',
        versionLabel: 'V1',
        statusLabel: '草稿',
        filter: 'draft',
      },
    ];

    expect(filterQuotationListItems(items, { keyword: 'Apple', filter: 'all' })).toHaveLength(1);
    expect(filterQuotationListItems(items, { keyword: '', filter: 'sent' })).toHaveLength(1);
    expect(filterQuotationListItems(items, { keyword: 'Apple', filter: 'sent' })).toHaveLength(0);
  });

  it('toggles quotation filter selection like the design chips', () => {
    expect(getNextQuotationFilter('draft', 'draft')).toBe('all');
    expect(getNextQuotationFilter('sent', 'draft')).toBe('sent');
  });

  it('renders design scaffold regions for the quotations page', () => {
    const markup = renderToStaticMarkup(
      <SalesQuotationsPageScaffold
        title={QUOTATION_PAGE_PRESENTATION.title}
        summary={QUOTATION_PAGE_PRESENTATION.summary}
        primaryActionLabel={QUOTATION_PAGE_PRESENTATION.primaryActionLabel}
        searchPlaceholder={QUOTATION_PAGE_PRESENTATION.searchPlaceholder}
        keyword=""
        onKeywordChange={() => undefined}
        activeFilter="all"
        onFilterChange={() => undefined}
        table={<div>table-body</div>}
      />,
    );

    expect(markup).toContain('data-testid="sales-quotations-topbar"');
    expect(markup).toContain('data-testid="sales-quotations-search"');
    expect(markup).toContain('data-testid="sales-quotations-filters"');
    expect(markup).toContain('data-testid="sales-quotations-table"');
    expect(markup).toContain('报价管理');
    expect(markup).toContain('报价单 · 管理工作台');
    expect(markup).toContain('新建报价');
    expect(markup).toContain('搜索报价编号, 客户...');
    expect(markup).toContain('全部');
    expect(markup).toContain('草稿');
    expect(markup).toContain('已发送');
    expect(markup).toContain('已接受');
    expect(markup).toContain('共 56 个报价');
  });

  it('renders the real page instead of legacy assembly output', () => {
    const markup = renderToStaticMarkup(<SalesQuotationsPage />);

    expect(markup).toContain('报价管理');
    expect(markup).toContain('报价编号');
    expect(markup).toContain('客户');
    expect(markup).toContain('报价日期');
    expect(markup).toContain('有效期至');
    expect(markup).toContain('金额');
    expect(markup).toContain('版本');
    expect(markup).toContain('状态');
    expect(markup).toContain('Q-20260305-018');
    expect(markup).toContain('新建报价');
    expect(markup).not.toContain('WorkbenchAssembly');
    expect(markup).not.toContain('报价工作台');
  });
});
