import { renderToStaticMarkup } from 'react-dom/server';

import {
  buildWarehouseListRows,
  buildWarehouseSearchQuery,
  parseWarehouseListPayload,
  parseWarehouseSearchParams,
  WAREHOUSE_LIST_COLUMNS,
  WAREHOUSE_PAGE_PRESENTATION,
  filterWarehouseListItems,
  type WarehouseListItem,
} from './warehouses-page';
import { WarehousesPageScaffold } from './warehouses-page-view';

describe('warehouses page contract', () => {
  it('uses warehouse-specific T2 page presentation', () => {
    expect(WAREHOUSE_PAGE_PRESENTATION).toMatchObject({
      family: 'T2',
      variant: 'search-list',
      title: '仓库管理',
      summary: '仓库 · 主数据管理',
      primaryActionLabel: '新建仓库',
      searchPlaceholder: '搜索仓库编号, 名称...',
      apiBasePath: '/api/bff/warehouses',
    });
  });

  it('uses design-aligned warehouse table columns', () => {
    expect(WAREHOUSE_LIST_COLUMNS.map((column) => column.label)).toEqual([
      '仓库编号',
      '仓库名称',
      '类型',
      '地址',
      '联系人',
      '库位管理',
      '状态',
    ]);
  });

  it('maps api items into design-shaped list rows', () => {
    const rows = buildWarehouseListRows([
      {
        id: 'w1',
        tenantId: 't1',
        code: 'WH-001',
        name: '深圳成品仓',
        address: '深圳市宝安区',
        contactPerson: '赵主管',
        contactPhone: '138-0000-1234',
        warehouseTypeLabel: '成品仓',
        locationManagedLabel: '启用',
        isActive: true,
        createdAt: '2026-03-06T08:00:00.000Z',
        updatedAt: '2026-03-06T10:00:00.000Z',
      } satisfies WarehouseListItem,
    ]);

    expect(rows).toEqual([
      {
        id: 'w1',
        code: 'WH-001',
        name: '深圳成品仓',
        warehouseType: '成品仓',
        address: '深圳市宝安区',
        contactPerson: '赵主管',
        locationManaged: '启用',
        status: '启用',
      },
    ]);
  });

  it('falls back missing fields to design-safe placeholders', () => {
    const rows = buildWarehouseListRows([
      {
        id: 'w2',
        tenantId: 't1',
        code: 'WH-002',
        name: '上海备件仓',
        address: null,
        contactPerson: null,
        contactPhone: null,
        isActive: false,
        createdAt: '2026-03-06T08:00:00.000Z',
        updatedAt: '2026-03-06T10:00:00.000Z',
      } satisfies WarehouseListItem,
    ]);

    expect(rows[0]).toMatchObject({
      warehouseType: '—',
      address: '—',
      contactPerson: '—',
      locationManaged: '—',
      status: '停用',
    });
  });

  it('throws when warehouse list payload is malformed', () => {
    expect(() => parseWarehouseListPayload({})).toThrow('仓库列表响应格式无效');
  });

  it('parses and rebuilds warehouse search params with trimmed keyword values', () => {
    const filters = parseWarehouseSearchParams(new URLSearchParams('keyword=%20WH-001%20'));

    expect(filters).toEqual({
      keyword: 'WH-001',
    });

    expect(buildWarehouseSearchQuery(filters)).toBe('keyword=WH-001');
  });

  it('filters warehouse list items by keyword only', () => {
    const items: WarehouseListItem[] = [
      {
        id: 'w1',
        tenantId: 't1',
        code: 'WH-001',
        name: '深圳成品仓',
        address: '深圳市宝安区',
        contactPerson: '赵主管',
        contactPhone: '138-0000-1234',
        isActive: true,
        createdAt: '2026-03-06T08:00:00.000Z',
        updatedAt: '2026-03-06T10:00:00.000Z',
      },
      {
        id: 'w2',
        tenantId: 't1',
        code: 'WH-002',
        name: '上海备件仓',
        address: '上海市浦东新区',
        contactPerson: '钱主管',
        contactPhone: '139-0000-5678',
        isActive: false,
        createdAt: '2026-03-06T08:00:00.000Z',
        updatedAt: '2026-03-06T10:00:00.000Z',
      },
    ];

    expect(filterWarehouseListItems(items, { keyword: '深圳' })).toHaveLength(1);
    expect(filterWarehouseListItems(items, { keyword: 'WH-002' })).toHaveLength(1);
    expect(filterWarehouseListItems(items, { keyword: '苏州' })).toHaveLength(0);
  });

  it('renders design scaffold regions for the warehouse page', () => {
    const markup = renderToStaticMarkup(
      <WarehousesPageScaffold
        title={WAREHOUSE_PAGE_PRESENTATION.title}
        summary={WAREHOUSE_PAGE_PRESENTATION.summary}
        primaryActionLabel={WAREHOUSE_PAGE_PRESENTATION.primaryActionLabel}
        searchPlaceholder={WAREHOUSE_PAGE_PRESENTATION.searchPlaceholder}
        table={<div>table-body</div>}
      />,
    );

    expect(markup).toContain('data-testid="warehouses-topbar"');
    expect(markup).toContain('data-testid="warehouses-search"');
    expect(markup).toContain('data-testid="warehouses-table"');
    expect(markup).not.toContain('data-testid="warehouses-filter-chips"');
    expect(markup).toContain('仓库管理');
    expect(markup).toContain('仓库 · 主数据管理');
    expect(markup).toContain('新建仓库');
    expect(markup).toContain('disabled');
    expect(markup).toContain('搜索仓库编号, 名称...');
  });
});
