import { describe, expect, it, mock } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

mock.module('next/navigation', () => ({
  usePathname: () => '/sales/orders',
  useRouter: () => ({
    replace: () => undefined,
  }),
  useSearchParams: () => new URLSearchParams(''),
}));

import SalesOrdersPage from './page';
import {
  buildSalesOrderListRows,
  buildSalesOrderSearchQuery,
  filterSalesOrderListItems,
  getNextSalesOrderFilter,
  parseSalesOrderSearchParams,
  SALES_ORDER_FILTER_OPTIONS,
  SALES_ORDER_LIST_COLUMNS,
  SALES_ORDER_PAGE_PRESENTATION,
  type SalesOrderFilter,
  type SalesOrderListItem,
} from './orders-page';
import { SalesOrdersPageScaffold } from './orders-page-view';

describe('sales orders page contract', () => {
  it('uses sales-order-specific T2 page presentation', () => {
    expect(SALES_ORDER_PAGE_PRESENTATION).toMatchObject({
      family: 'T2',
      variant: 'search-list',
      title: '销售订单管理',
      summary: '销售订单 · 管理工作台',
      primaryActionLabel: '新建销售订单',
      searchPlaceholder: '搜索 SO编号, 客户, 物料...',
      apiBasePath: '/api/bff/sales/orders',
    });
  });

  it('uses design-aligned sales order filter chips and columns', () => {
    expect(SALES_ORDER_FILTER_OPTIONS.map((option) => option.label)).toEqual(['全部', '待确认', '已确认', '已发运']);

    expect(SALES_ORDER_LIST_COLUMNS.map((column) => column.label)).toEqual([
      'SO 编号',
      '客户',
      '下单日期',
      '金额',
      '交期',
      '状态',
      '操作',
    ]);
  });

  it('maps seeded items into design-shaped sales order rows', () => {
    const rows = buildSalesOrderListRows([
      {
        id: 'so_001',
        orderNumber: 'SO-20260306-001',
        customerName: '京东企业购',
        orderDateLabel: '2026-03-06',
        amountLabel: '¥16,800',
        deliveryDateLabel: '03-12',
        statusLabel: '待确认',
        filter: 'pending',
      } satisfies SalesOrderListItem,
    ]);

    expect(rows).toEqual([
      {
        id: 'so_001',
        orderNumber: 'SO-20260306-001',
        customerName: '京东企业购',
        orderDate: '2026-03-06',
        amount: '¥16,800',
        deliveryDate: '03-12',
        status: '待确认',
        actions: 'view',
        detailHref: undefined,
      },
    ]);
  });

  it('parses and rebuilds sales order search params with filter and keyword', () => {
    const filters = parseSalesOrderSearchParams(new URLSearchParams('keyword=%20SO-001%20&filter=confirmed'));

    expect(filters).toEqual({
      keyword: 'SO-001',
      filter: 'confirmed',
    });

    expect(buildSalesOrderSearchQuery(filters)).toBe('keyword=SO-001&filter=confirmed');
  });

  it('filters sales order list items by keyword and filter', () => {
    const items: SalesOrderListItem[] = [
      {
        id: 'so_001',
        orderNumber: 'SO-20260306-001',
        customerName: '京东企业购',
        orderDateLabel: '2026-03-06',
        amountLabel: '¥16,800',
        deliveryDateLabel: '03-12',
        statusLabel: '待确认',
        filter: 'pending',
      },
      {
        id: 'so_002',
        orderNumber: 'SO-20260305-007',
        customerName: '企业微信采购',
        orderDateLabel: '2026-03-05',
        amountLabel: '¥32,000',
        deliveryDateLabel: '03-09',
        statusLabel: '已确认',
        filter: 'confirmed',
      },
    ];

    expect(filterSalesOrderListItems(items, { keyword: '京东', filter: 'all' })).toHaveLength(1);
    expect(filterSalesOrderListItems(items, { keyword: '', filter: 'confirmed' })).toHaveLength(1);
    expect(filterSalesOrderListItems(items, { keyword: '京东', filter: 'confirmed' })).toHaveLength(0);
  });

  it('toggles sales order filter selection like the design chips', () => {
    expect(getNextSalesOrderFilter('pending', 'pending')).toBe('all');
    expect(getNextSalesOrderFilter('confirmed', 'pending')).toBe('confirmed');
  });

  it('renders design scaffold regions for the sales orders page', () => {
    const markup = renderToStaticMarkup(
      <SalesOrdersPageScaffold
        title={SALES_ORDER_PAGE_PRESENTATION.title}
        summary={SALES_ORDER_PAGE_PRESENTATION.summary}
        primaryActionLabel={SALES_ORDER_PAGE_PRESENTATION.primaryActionLabel}
        searchPlaceholder={SALES_ORDER_PAGE_PRESENTATION.searchPlaceholder}
        keyword=""
        onKeywordChange={() => undefined}
        activeFilter="all"
        onFilterChange={() => undefined}
        table={<div>table-body</div>}
      />,
    );

    expect(markup).toContain('data-testid="sales-orders-topbar"');
    expect(markup).toContain('data-testid="sales-orders-search"');
    expect(markup).toContain('data-testid="sales-orders-filters"');
    expect(markup).toContain('data-testid="sales-orders-table"');
    expect(markup).toContain('销售订单管理');
    expect(markup).toContain('销售订单 · 管理工作台');
    expect(markup).toContain('新建销售订单');
    expect(markup).toContain('搜索 SO编号, 客户, 物料...');
    expect(markup).toContain('全部');
    expect(markup).toContain('待确认');
    expect(markup).toContain('已确认');
    expect(markup).toContain('已发运');
    expect(markup).toContain('共 89 个 SO · 显示 1-20');
  });

  it('renders the real page instead of legacy sales so output', () => {
    const markup = renderToStaticMarkup(<SalesOrdersPage />);

    expect(markup).toContain('销售订单管理');
    expect(markup).toContain('SO 编号');
    expect(markup).toContain('客户');
    expect(markup).toContain('下单日期');
    expect(markup).toContain('金额');
    expect(markup).toContain('交期');
    expect(markup).toContain('状态');
    expect(markup).toContain('操作');
    expect(markup).toContain('SO-20260306-001');
    expect(markup).toContain('新建销售订单');
    expect(markup).not.toContain('WorkbenchAssembly');
    expect(markup).not.toContain('SO 工作台');
  });
});
