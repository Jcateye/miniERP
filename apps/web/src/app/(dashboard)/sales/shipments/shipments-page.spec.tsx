import { describe, expect, it, mock } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

mock.module('next/navigation', () => ({
  usePathname: () => '/sales/shipments',
  useRouter: () => ({
    replace: () => undefined,
  }),
  useSearchParams: () => new URLSearchParams(''),
}));

import SalesShipmentsPage from './page';
import {
  buildSalesShipmentListRows,
  buildSalesShipmentSearchQuery,
  filterSalesShipmentListItems,
  getNextSalesShipmentFilter,
  parseSalesShipmentSearchParams,
  SALES_SHIPMENT_FILTER_OPTIONS,
  SALES_SHIPMENT_LIST_COLUMNS,
  SALES_SHIPMENT_PAGE_PRESENTATION,
  type SalesShipmentFilter,
  type SalesShipmentListItem,
} from './shipments-page';
import { SalesShipmentsPageScaffold } from './shipments-page-view';

describe('sales shipments page contract', () => {
  it('uses sales-shipment-specific T2 page presentation', () => {
    expect(SALES_SHIPMENT_PAGE_PRESENTATION).toMatchObject({
      family: 'T2',
      variant: 'search-list',
      title: '发运管理',
      summary: '发运单 · 管理工作台',
      primaryActionLabel: '新建发运',
      searchPlaceholder: '搜索发运编号, 客户, 物流单号...',
      apiBasePath: '/api/bff/sales/shipments',
    });
  });

  it('uses design-aligned shipment filter chips and columns', () => {
    expect(SALES_SHIPMENT_FILTER_OPTIONS.map((option) => option.label)).toEqual(['全部', '待拣货', '已拣货', '已发出']);

    expect(SALES_SHIPMENT_LIST_COLUMNS.map((column) => column.label)).toEqual([
      '发运编号',
      '客户',
      '关联SO',
      '数量',
      '物流单号',
      '状态',
      '操作',
    ]);
  });

  it('maps seeded items into design-shaped shipment rows', () => {
    const rows = buildSalesShipmentListRows([
      {
        id: 'ship_001',
        shipmentNumber: 'OUT-20260308-001',
        customerName: '京东企业购',
        relatedSalesOrderNumber: 'SO-20260306-001',
        quantityLabel: '12',
        trackingNumber: 'SF12345678',
        statusLabel: '待拣货',
        filter: 'picking',
      } satisfies SalesShipmentListItem,
    ]);

    expect(rows).toEqual([
      {
        id: 'ship_001',
        shipmentNumber: 'OUT-20260308-001',
        customerName: '京东企业购',
        relatedSalesOrderNumber: 'SO-20260306-001',
        quantity: '12',
        trackingNumber: 'SF12345678',
        status: '待拣货',
        actions: 'view',
        detailHref: undefined,
      },
    ]);
  });

  it('parses and rebuilds shipment search params with filter and keyword', () => {
    const filters = parseSalesShipmentSearchParams(new URLSearchParams('keyword=%20OUT-001%20&filter=dispatched'));

    expect(filters).toEqual({
      keyword: 'OUT-001',
      filter: 'dispatched',
    });

    expect(buildSalesShipmentSearchQuery(filters)).toBe('keyword=OUT-001&filter=dispatched');
  });

  it('filters shipment list items by keyword and filter', () => {
    const items: SalesShipmentListItem[] = [
      {
        id: 'ship_001',
        shipmentNumber: 'OUT-20260308-001',
        customerName: '京东企业购',
        relatedSalesOrderNumber: 'SO-20260306-001',
        quantityLabel: '12',
        trackingNumber: 'SF12345678',
        statusLabel: '待拣货',
        filter: 'picking',
      },
      {
        id: 'ship_002',
        shipmentNumber: 'OUT-20260305-003',
        customerName: '企业微信采购',
        relatedSalesOrderNumber: 'SO-20260305-007',
        quantityLabel: '24',
        trackingNumber: 'JD998877',
        statusLabel: '已发出',
        filter: 'dispatched',
      },
    ];

    expect(filterSalesShipmentListItems(items, { keyword: '京东', filter: 'all' })).toHaveLength(1);
    expect(filterSalesShipmentListItems(items, { keyword: '', filter: 'dispatched' })).toHaveLength(1);
    expect(filterSalesShipmentListItems(items, { keyword: '京东', filter: 'dispatched' })).toHaveLength(0);
  });

  it('toggles shipment filter selection like the design chips', () => {
    expect(getNextSalesShipmentFilter('picking', 'picking')).toBe('all');
    expect(getNextSalesShipmentFilter('picked', 'picking')).toBe('picked');
  });

  it('renders design scaffold regions for the shipments page', () => {
    const markup = renderToStaticMarkup(
      <SalesShipmentsPageScaffold
        title={SALES_SHIPMENT_PAGE_PRESENTATION.title}
        summary={SALES_SHIPMENT_PAGE_PRESENTATION.summary}
        primaryActionLabel={SALES_SHIPMENT_PAGE_PRESENTATION.primaryActionLabel}
        searchPlaceholder={SALES_SHIPMENT_PAGE_PRESENTATION.searchPlaceholder}
        keyword=""
        onKeywordChange={() => undefined}
        activeFilter="all"
        onFilterChange={() => undefined}
        table={<div>table-body</div>}
      />,
    );

    expect(markup).toContain('data-testid="sales-shipments-topbar"');
    expect(markup).toContain('data-testid="sales-shipments-search"');
    expect(markup).toContain('data-testid="sales-shipments-filters"');
    expect(markup).toContain('data-testid="sales-shipments-table"');
    expect(markup).toContain('发运管理');
    expect(markup).toContain('发运单 · 管理工作台');
    expect(markup).toContain('新建发运');
    expect(markup).toContain('搜索发运编号, 客户, 物流单号...');
    expect(markup).toContain('全部');
    expect(markup).toContain('待拣货');
    expect(markup).toContain('已拣货');
    expect(markup).toContain('已发出');
    expect(markup).toContain('共 67 条发运单');
  });

  it('renders the real page instead of legacy sales out output', () => {
    const markup = renderToStaticMarkup(<SalesShipmentsPage />);

    expect(markup).toContain('发运管理');
    expect(markup).toContain('发运编号');
    expect(markup).toContain('客户');
    expect(markup).toContain('关联SO');
    expect(markup).toContain('数量');
    expect(markup).toContain('物流单号');
    expect(markup).toContain('状态');
    expect(markup).toContain('操作');
    expect(markup).toContain('OUT-20260308-001');
    expect(markup).toContain('新建发运');
    expect(markup).not.toContain('WorkbenchAssembly');
    expect(markup).not.toContain('OUT 工作台');
  });
});
