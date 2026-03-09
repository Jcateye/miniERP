import { describe, expect, it, mock } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

mock.module('next/navigation', () => ({
  usePathname: () => '/inventory/counts',
  useRouter: () => ({
    replace: () => undefined,
  }),
  useSearchParams: () => new URLSearchParams(''),
}));

import InventoryCountsPage from './page';
import {
  buildInventoryCountListRows,
  buildInventoryCountSearchQuery,
  filterInventoryCountListItems,
  getNextInventoryCountFilter,
  INVENTORY_COUNT_FILTER_OPTIONS,
  INVENTORY_COUNT_LIST_COLUMNS,
  INVENTORY_COUNT_PAGE_PRESENTATION,
  parseInventoryCountSearchParams,
  type InventoryCountFilter,
  type InventoryCountListItem,
} from './counts-page';
import { InventoryCountsPageScaffold } from './counts-page-view';

describe('inventory counts page contract', () => {
  it('uses inventory-count-specific T2 page presentation', () => {
    expect(INVENTORY_COUNT_PAGE_PRESENTATION).toMatchObject({
      family: 'T2',
      variant: 'search-list',
      title: '盘点管理',
      summary: '盘点单 · 管理工作台',
      primaryActionLabel: '新建盘点',
      searchPlaceholder: '搜索盘点编号, 仓库...',
      apiBasePath: '/api/bff/inventory/counts',
    });
  });

  it('uses design-aligned count filter chips and columns', () => {
    expect(INVENTORY_COUNT_FILTER_OPTIONS.map((option) => option.label)).toEqual(['全部', '进行中', '已过账']);

    expect(INVENTORY_COUNT_LIST_COLUMNS.map((column) => column.label)).toEqual([
      '盘点编号',
      '仓库',
      '日期',
      '盘点行',
      '差异数',
      '负责人',
      '状态',
    ]);
  });

  it('maps seeded items into design-shaped count rows', () => {
    const rows = buildInventoryCountListRows([
      {
        id: 'count_001',
        countNumber: 'ST-20260308-001',
        warehouseName: '深圳总仓',
        dateLabel: '2026-03-08',
        lineCountLabel: '28',
        differenceCountLabel: '3',
        ownerName: '王五',
        statusLabel: '进行中',
        filter: 'in-progress',
      } satisfies InventoryCountListItem,
    ]);

    expect(rows).toEqual([
      {
        id: 'count_001',
        countNumber: 'ST-20260308-001',
        warehouseName: '深圳总仓',
        date: '2026-03-08',
        lineCount: '28',
        differenceCount: '3',
        ownerName: '王五',
        status: '进行中',
        detailHref: undefined,
      },
    ]);
  });

  it('parses and rebuilds count search params with filter and keyword', () => {
    const filters = parseInventoryCountSearchParams(new URLSearchParams('keyword=%20ST-001%20&filter=posted'));

    expect(filters).toEqual({
      keyword: 'ST-001',
      filter: 'posted',
    });

    expect(buildInventoryCountSearchQuery(filters)).toBe('keyword=ST-001&filter=posted');
  });

  it('filters count list items by keyword and filter', () => {
    const items: InventoryCountListItem[] = [
      {
        id: 'count_001',
        countNumber: 'ST-20260308-001',
        warehouseName: '深圳总仓',
        dateLabel: '2026-03-08',
        lineCountLabel: '28',
        differenceCountLabel: '3',
        ownerName: '王五',
        statusLabel: '进行中',
        filter: 'in-progress',
      },
      {
        id: 'count_002',
        countNumber: 'ST-20260305-003',
        warehouseName: '上海分仓',
        dateLabel: '2026-03-05',
        lineCountLabel: '12',
        differenceCountLabel: '0',
        ownerName: '李四',
        statusLabel: '已过账',
        filter: 'posted',
      },
    ];

    expect(filterInventoryCountListItems(items, { keyword: '深圳', filter: 'all' })).toHaveLength(1);
    expect(filterInventoryCountListItems(items, { keyword: '', filter: 'posted' })).toHaveLength(1);
    expect(filterInventoryCountListItems(items, { keyword: '深圳', filter: 'posted' })).toHaveLength(0);
  });

  it('toggles count filter selection like the design chips', () => {
    expect(getNextInventoryCountFilter('in-progress', 'in-progress')).toBe('all');
    expect(getNextInventoryCountFilter('posted', 'in-progress')).toBe('posted');
  });

  it('renders design scaffold regions for the inventory counts page', () => {
    const markup = renderToStaticMarkup(
      <InventoryCountsPageScaffold
        title={INVENTORY_COUNT_PAGE_PRESENTATION.title}
        summary={INVENTORY_COUNT_PAGE_PRESENTATION.summary}
        primaryActionLabel={INVENTORY_COUNT_PAGE_PRESENTATION.primaryActionLabel}
        searchPlaceholder={INVENTORY_COUNT_PAGE_PRESENTATION.searchPlaceholder}
        keyword=""
        onKeywordChange={() => undefined}
        activeFilter="all"
        onFilterChange={() => undefined}
        table={<div>table-body</div>}
      />,
    );

    expect(markup).toContain('data-testid="inventory-counts-topbar"');
    expect(markup).toContain('data-testid="inventory-counts-search"');
    expect(markup).toContain('data-testid="inventory-counts-filters"');
    expect(markup).toContain('data-testid="inventory-counts-table"');
    expect(markup).toContain('盘点管理');
    expect(markup).toContain('盘点单 · 管理工作台');
    expect(markup).toContain('新建盘点');
    expect(markup).toContain('搜索盘点编号, 仓库...');
    expect(markup).toContain('全部');
    expect(markup).toContain('进行中');
    expect(markup).toContain('已过账');
    expect(markup).toContain('共 23 条盘点单');
  });

  it('renders the real page instead of stocktake workbench output', () => {
    const markup = renderToStaticMarkup(<InventoryCountsPage />);

    expect(markup).toContain('盘点管理');
    expect(markup).toContain('盘点编号');
    expect(markup).toContain('仓库');
    expect(markup).toContain('日期');
    expect(markup).toContain('盘点行');
    expect(markup).toContain('差异数');
    expect(markup).toContain('负责人');
    expect(markup).toContain('状态');
    expect(markup).toContain('ST-20260308-001');
    expect(markup).not.toContain('WorkbenchAssembly');
    expect(markup).not.toContain('盘点工作台');
  });
});
