import { describe, expect, it, mock } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

mock.module('next/navigation', () => ({
  usePathname: () => '/inventory/balances',
  useRouter: () => ({
    replace: () => undefined,
  }),
  useSearchParams: () => new URLSearchParams(''),
}));

import InventoryBalancesPage from './page';
import {
  buildInventoryBalanceListRows,
  buildInventoryBalanceSearchQuery,
  filterInventoryBalanceListItems,
  getNextInventoryBalanceFilter,
  INVENTORY_BALANCE_FILTER_OPTIONS,
  INVENTORY_BALANCE_LIST_COLUMNS,
  INVENTORY_BALANCE_PAGE_PRESENTATION,
  parseInventoryBalanceSearchParams,
  type InventoryBalanceFilter,
  type InventoryBalanceListItem,
} from './balances-page';
import { InventoryBalancesPageScaffold } from './balances-page-view';

describe('inventory balances page contract', () => {
  it('uses inventory-balance-specific T2 page presentation', () => {
    expect(INVENTORY_BALANCE_PAGE_PRESENTATION).toMatchObject({
      family: 'T2',
      variant: 'search-list',
      title: '库存余额',
      summary: '实时库存余额查询 · 多维度筛选',
      primaryActionLabel: '导出',
      searchPlaceholder: '搜索物料编号, 名称, 仓库...',
      apiBasePath: '/api/bff/inventory/balances',
    });
  });

  it('uses design-aligned balance filter chips and columns', () => {
    expect(INVENTORY_BALANCE_FILTER_OPTIONS.map((option) => option.label)).toEqual(['全部仓库', '低于安全库存', '零库存']);

    expect(INVENTORY_BALANCE_LIST_COLUMNS.map((column) => column.label)).toEqual([
      '物料编号',
      '物料名称',
      '仓库',
      '在库数量',
      '可用数量',
      '预留数量',
      '安全库存',
      '状态',
    ]);
  });

  it('maps seeded items into design-shaped balance rows', () => {
    const rows = buildInventoryBalanceListRows([
      {
        id: 'bal_001',
        itemCode: 'ADP-USB-C-HUB',
        itemName: 'USB-C扩展坞',
        warehouseName: '深圳总仓',
        onHandLabel: '112',
        availableLabel: '106',
        reservedLabel: '6',
        safetyStockLabel: '50',
        statusLabel: '正常',
        filter: 'all',
      } satisfies InventoryBalanceListItem,
    ]);

    expect(rows).toEqual([
      {
        id: 'bal_001',
        itemCode: 'ADP-USB-C-HUB',
        itemName: 'USB-C扩展坞',
        warehouseName: '深圳总仓',
        onHand: '112',
        available: '106',
        reserved: '6',
        safetyStock: '50',
        status: '正常',
        detailHref: undefined,
      },
    ]);
  });

  it('parses and rebuilds balance search params with filter and keyword', () => {
    const filters = parseInventoryBalanceSearchParams(new URLSearchParams('keyword=%20USB%20&filter=low-stock'));

    expect(filters).toEqual({
      keyword: 'USB',
      filter: 'low-stock',
    });

    expect(buildInventoryBalanceSearchQuery(filters)).toBe('keyword=USB&filter=low-stock');
  });

  it('filters balance list items by keyword and filter', () => {
    const items: InventoryBalanceListItem[] = [
      {
        id: 'bal_001',
        itemCode: 'ADP-USB-C-HUB',
        itemName: 'USB-C扩展坞',
        warehouseName: '深圳总仓',
        onHandLabel: '112',
        availableLabel: '106',
        reservedLabel: '6',
        safetyStockLabel: '50',
        statusLabel: '正常',
        filter: 'all',
      },
      {
        id: 'bal_002',
        itemCode: 'CAB-HDMI-2M',
        itemName: 'HDMI线材',
        warehouseName: '深圳总仓',
        onHandLabel: '2',
        availableLabel: '2',
        reservedLabel: '0',
        safetyStockLabel: '10',
        statusLabel: '低库存',
        filter: 'low-stock',
      },
    ];

    expect(filterInventoryBalanceListItems(items, { keyword: 'USB', filter: 'all' })).toHaveLength(1);
    expect(filterInventoryBalanceListItems(items, { keyword: '', filter: 'low-stock' })).toHaveLength(1);
    expect(filterInventoryBalanceListItems(items, { keyword: 'USB', filter: 'low-stock' })).toHaveLength(0);
  });

  it('toggles balance filter selection like the design chips', () => {
    expect(getNextInventoryBalanceFilter('low-stock', 'low-stock')).toBe('all');
    expect(getNextInventoryBalanceFilter('zero-stock', 'low-stock')).toBe('zero-stock');
  });

  it('renders design scaffold regions for the inventory balances page', () => {
    const markup = renderToStaticMarkup(
      <InventoryBalancesPageScaffold
        title={INVENTORY_BALANCE_PAGE_PRESENTATION.title}
        summary={INVENTORY_BALANCE_PAGE_PRESENTATION.summary}
        primaryActionLabel={INVENTORY_BALANCE_PAGE_PRESENTATION.primaryActionLabel}
        searchPlaceholder={INVENTORY_BALANCE_PAGE_PRESENTATION.searchPlaceholder}
        keyword=""
        onKeywordChange={() => undefined}
        activeFilter="all"
        onFilterChange={() => undefined}
        table={<div>table-body</div>}
      />,
    );

    expect(markup).toContain('data-testid="inventory-balances-topbar"');
    expect(markup).toContain('data-testid="inventory-balances-search"');
    expect(markup).toContain('data-testid="inventory-balances-filters"');
    expect(markup).toContain('data-testid="inventory-balances-table"');
    expect(markup).toContain('库存余额');
    expect(markup).toContain('实时库存余额查询 · 多维度筛选');
    expect(markup).toContain('导出');
    expect(markup).toContain('搜索物料编号, 名称, 仓库...');
    expect(markup).toContain('全部仓库');
    expect(markup).toContain('低于安全库存');
    expect(markup).toContain('零库存');
    expect(markup).toContain('共 1,247 条 · 显示 1-50');
  });

  it('renders the real page instead of inventory workbench output', () => {
    const markup = renderToStaticMarkup(<InventoryBalancesPage />);

    expect(markup).toContain('库存余额');
    expect(markup).toContain('物料编号');
    expect(markup).toContain('物料名称');
    expect(markup).toContain('仓库');
    expect(markup).toContain('在库数量');
    expect(markup).toContain('可用数量');
    expect(markup).toContain('预留数量');
    expect(markup).toContain('安全库存');
    expect(markup).toContain('状态');
    expect(markup).toContain('ADP-USB-C-HUB');
    expect(markup).toContain('导出');
    expect(markup).not.toContain('WorkbenchAssembly');
    expect(markup).not.toContain('库存工作台');
  });
});
