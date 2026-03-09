import { describe, expect, it, mock } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

mock.module('next/navigation', () => ({
  usePathname: () => '/procure/purchase-orders',
  useRouter: () => ({
    replace: () => undefined,
  }),
  useSearchParams: () => new URLSearchParams(''),
}));

import ProcurePurchaseOrdersPage from './page';
import {
  buildPurchaseOrderListRows,
  buildPurchaseOrderSearchQuery,
  filterPurchaseOrderListItems,
  getNextPurchaseOrderFilter,
  parsePurchaseOrderSearchParams,
  PURCHASE_ORDER_FILTER_OPTIONS,
  PURCHASE_ORDER_LIST_COLUMNS,
  PURCHASE_ORDER_PAGE_PRESENTATION,
  type PurchaseOrderFilter,
  type PurchaseOrderListItem,
} from './purchase-orders-page';
import { ProcurePurchaseOrdersPageScaffold } from './purchase-orders-page-view';

describe('procure purchase orders page contract', () => {
  it('uses purchase-order-specific T2 page presentation', () => {
    expect(PURCHASE_ORDER_PAGE_PRESENTATION).toMatchObject({
      family: 'T2',
      variant: 'search-list',
      title: '采购单管理',
      summary: '采购单 · 管理工作台',
      primaryActionLabel: '新建采购单',
      searchPlaceholder: '搜索 PO编号, 供应商, 物料...',
      apiBasePath: '/api/bff/procure/purchase-orders',
    });
  });

  it('uses design-aligned purchase order filter chips and columns', () => {
    expect(PURCHASE_ORDER_FILTER_OPTIONS.map((option) => option.label)).toEqual([
      '全部',
      '草稿',
      '待审批',
      '已批准',
      '已完成',
    ]);

    expect(PURCHASE_ORDER_LIST_COLUMNS.map((column) => column.label)).toEqual([
      'PO 编号',
      '供应商',
      '下单日期',
      '金额',
      '行数',
      '状态',
      '操作',
    ]);
  });

  it('maps seeded items into design-shaped purchase order rows', () => {
    const rows = buildPurchaseOrderListRows([
      {
        id: 'po_001',
        orderNumber: 'PO-20260308-001',
        supplierName: '华为技术有限公司',
        createdAtLabel: '2026-03-08',
        amountLabel: '¥128,000',
        lineCountLabel: '12',
        statusLabel: '待审批',
        filter: 'pending-approval',
      } satisfies PurchaseOrderListItem,
    ]);

    expect(rows).toEqual([
      {
        id: 'po_001',
        orderNumber: 'PO-20260308-001',
        supplierName: '华为技术有限公司',
        orderedAt: '2026-03-08',
        amount: '¥128,000',
        lineCount: '12',
        status: '待审批',
        actions: 'view',
        detailHref: undefined,
      },
    ]);
  });

  it('parses and rebuilds purchase order search params with filter and keyword', () => {
    const filters = parsePurchaseOrderSearchParams(new URLSearchParams('keyword=%20PO-001%20&filter=approved'));

    expect(filters).toEqual({
      keyword: 'PO-001',
      filter: 'approved',
    });

    expect(buildPurchaseOrderSearchQuery(filters)).toBe('keyword=PO-001&filter=approved');
  });

  it('filters purchase order list items by keyword and filter', () => {
    const items: PurchaseOrderListItem[] = [
      {
        id: 'po_001',
        orderNumber: 'PO-20260308-001',
        supplierName: '华为技术有限公司',
        createdAtLabel: '2026-03-08',
        amountLabel: '¥128,000',
        lineCountLabel: '12',
        statusLabel: '待审批',
        filter: 'pending-approval',
      },
      {
        id: 'po_002',
        orderNumber: 'PO-20260305-003',
        supplierName: '比亚迪供应链有限公司',
        createdAtLabel: '2026-03-05',
        amountLabel: '¥86,000',
        lineCountLabel: '8',
        statusLabel: '已批准',
        filter: 'approved',
      },
    ];

    expect(filterPurchaseOrderListItems(items, { keyword: '华为', filter: 'all' })).toHaveLength(1);
    expect(filterPurchaseOrderListItems(items, { keyword: '', filter: 'approved' })).toHaveLength(1);
    expect(filterPurchaseOrderListItems(items, { keyword: '华为', filter: 'approved' })).toHaveLength(0);
  });

  it('toggles purchase order filter selection like the design chips', () => {
    expect(getNextPurchaseOrderFilter('pending-approval', 'pending-approval')).toBe('all');
    expect(getNextPurchaseOrderFilter('approved', 'pending-approval')).toBe('approved');
  });

  it('renders design scaffold regions for the purchase orders page', () => {
    const markup = renderToStaticMarkup(
      <ProcurePurchaseOrdersPageScaffold
        title={PURCHASE_ORDER_PAGE_PRESENTATION.title}
        summary={PURCHASE_ORDER_PAGE_PRESENTATION.summary}
        primaryActionLabel={PURCHASE_ORDER_PAGE_PRESENTATION.primaryActionLabel}
        searchPlaceholder={PURCHASE_ORDER_PAGE_PRESENTATION.searchPlaceholder}
        keyword=""
        onKeywordChange={() => undefined}
        activeFilter="all"
        onFilterChange={() => undefined}
        table={<div>table-body</div>}
      />,
    );

    expect(markup).toContain('data-testid="procure-po-topbar"');
    expect(markup).toContain('data-testid="procure-po-search"');
    expect(markup).toContain('data-testid="procure-po-filters"');
    expect(markup).toContain('data-testid="procure-po-table"');
    expect(markup).toContain('采购单管理');
    expect(markup).toContain('采购单 · 管理工作台');
    expect(markup).toContain('新建采购单');
    expect(markup).toContain('搜索 PO编号, 供应商, 物料...');
    expect(markup).toContain('全部');
    expect(markup).toContain('草稿');
    expect(markup).toContain('待审批');
    expect(markup).toContain('已批准');
    expect(markup).toContain('已完成');
    expect(markup).toContain('共 134 个 PO · 显示 1-20');
  });

  it('renders the real page instead of legacy purchasing po output', () => {
    const markup = renderToStaticMarkup(<ProcurePurchaseOrdersPage />);

    expect(markup).toContain('采购单管理');
    expect(markup).toContain('PO 编号');
    expect(markup).toContain('供应商');
    expect(markup).toContain('下单日期');
    expect(markup).toContain('金额');
    expect(markup).toContain('行数');
    expect(markup).toContain('状态');
    expect(markup).toContain('操作');
    expect(markup).toContain('PO-20260308-001');
    expect(markup).toContain('新建采购单');
    expect(markup).not.toContain('WorkbenchAssembly');
    expect(markup).not.toContain('采购工作台');
  });
});
