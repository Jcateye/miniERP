import { describe, expect, it, mock } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

mock.module('next/navigation', () => ({
  usePathname: () => '/mdm/suppliers',
  useRouter: () => ({
    replace: () => undefined,
  }),
  useSearchParams: () => new URLSearchParams(''),
}));

import SuppliersPage from './page';
import {
  buildSupplierListRows,
  buildSupplierSearchQuery,
  filterSupplierListItems,
  parseSupplierSearchParams,
  SUPPLIER_LIST_COLUMNS,
  SUPPLIER_PAGE_PRESENTATION,
  type SupplierListItem,
} from './suppliers-page';
import { SuppliersPageScaffold } from './suppliers-page-view';

describe('suppliers page contract', () => {
  it('uses supplier-specific T2 page presentation', () => {
    expect(SUPPLIER_PAGE_PRESENTATION).toMatchObject({
      family: 'T2',
      variant: 'search-list',
      title: '供应商管理',
      summary: '供应商 · 主数据管理',
      primaryActionLabel: '新建供应商',
      searchPlaceholder: '搜索供应商名称, 联系人...',
      detailHrefBase: '/mdm/suppliers',
      apiBasePath: '/api/bff/suppliers',
    });
  });

  it('uses design-aligned supplier table columns', () => {
    expect(SUPPLIER_LIST_COLUMNS.map((column) => column.label)).toEqual([
      '编号',
      '供应商名称',
      '联系人',
      '资质到期',
      '合作订单',
      '状态',
    ]);
  });

  it('maps supplier items into design-shaped list rows', () => {
    const rows = buildSupplierListRows([
      {
        id: 'supplier_001',
        code: 'V-001',
        name: '华为技术有限公司',
        contactPerson: '赵经理',
        qualificationExpiryLabel: '2026-06-15',
        cooperativeOrdersLabel: '42',
        statusLabel: '合格',
      } satisfies SupplierListItem,
    ]);

    expect(rows).toEqual([
      {
        id: 'supplier_001',
        code: 'V-001',
        name: '华为技术有限公司',
        contactPerson: '赵经理',
        qualificationExpiry: '2026-06-15',
        cooperativeOrders: '42',
        status: '合格',
        detailHref: '/mdm/suppliers/supplier_001',
      },
    ]);
  });

  it('falls back missing display fields to design-safe placeholders', () => {
    const rows = buildSupplierListRows([
      {
        id: 'supplier_002',
        code: 'V-002',
        name: '立讯精密工业股份有限公司',
        contactPerson: null,
        qualificationExpiryLabel: null,
        cooperativeOrdersLabel: null,
        statusLabel: null,
      } satisfies SupplierListItem,
    ]);

    expect(rows[0]).toMatchObject({
      contactPerson: '—',
      qualificationExpiry: '—',
      cooperativeOrders: '—',
      status: '—',
      detailHref: '/mdm/suppliers/supplier_002',
    });
  });

  it('encodes detail href ids safely', () => {
    const rows = buildSupplierListRows([
      {
        id: 'supplier/with-slash',
        code: 'V-003',
        name: '带特殊ID供应商',
        contactPerson: '周经理',
        qualificationExpiryLabel: '2026-09-01',
        cooperativeOrdersLabel: '8',
        statusLabel: '观察',
      } satisfies SupplierListItem,
    ]);

    expect(rows[0]?.detailHref).toBe('/mdm/suppliers/supplier%2Fwith-slash');
  });

  it('parses and rebuilds supplier search params with trimmed values', () => {
    const filters = parseSupplierSearchParams(new URLSearchParams('keyword=%20华为%20'));

    expect(filters).toEqual({
      keyword: '华为',
    });

    expect(buildSupplierSearchQuery(filters)).toBe('keyword=%E5%8D%8E%E4%B8%BA');
  });

  it('filters supplier list items by keyword', () => {
    const items: SupplierListItem[] = [
      {
        id: 'supplier_001',
        code: 'V-001',
        name: '华为技术有限公司',
        contactPerson: '赵经理',
        qualificationExpiryLabel: '2026-06-15',
        cooperativeOrdersLabel: '42',
        statusLabel: '合格',
      },
      {
        id: 'supplier_002',
        code: 'V-002',
        name: '比亚迪供应链有限公司',
        contactPerson: '李经理',
        qualificationExpiryLabel: '2026-08-20',
        cooperativeOrdersLabel: '19',
        statusLabel: '合格',
      },
    ];

    expect(filterSupplierListItems(items, { keyword: '华为' })).toHaveLength(1);
    expect(filterSupplierListItems(items, { keyword: '赵经理' })).toHaveLength(1);
    expect(filterSupplierListItems(items, { keyword: 'V-002' })).toHaveLength(1);
    expect(filterSupplierListItems(items, { keyword: '不存在' })).toHaveLength(0);
  });

  it('renders design scaffold regions for the suppliers page', () => {
    const markup = renderToStaticMarkup(
      <SuppliersPageScaffold
        title={SUPPLIER_PAGE_PRESENTATION.title}
        summary={SUPPLIER_PAGE_PRESENTATION.summary}
        primaryActionLabel={SUPPLIER_PAGE_PRESENTATION.primaryActionLabel}
        searchPlaceholder={SUPPLIER_PAGE_PRESENTATION.searchPlaceholder}
        table={<div>table-body</div>}
      />,
    );

    expect(markup).toContain('data-testid="suppliers-topbar"');
    expect(markup).toContain('data-testid="suppliers-search"');
    expect(markup).not.toContain('data-testid="suppliers-filter-chips"');
    expect(markup).toContain('data-testid="suppliers-table"');
    expect(markup).toContain('供应商管理');
    expect(markup).toContain('供应商 · 主数据管理');
    expect(markup).toContain('新建供应商');
    expect(markup).toContain('搜索供应商名称, 联系人...');
  });

  it('renders the real page instead of the settings master-data workbench', () => {
    const markup = renderToStaticMarkup(<SuppliersPage />);

    expect(markup).toContain('供应商管理');
    expect(markup).toContain('供应商 · 主数据管理');
    expect(markup).toContain('编号');
    expect(markup).toContain('供应商名称');
    expect(markup).toContain('联系人');
    expect(markup).toContain('资质到期');
    expect(markup).toContain('合作订单');
    expect(markup).toContain('状态');
    expect(markup).toContain('搜索供应商名称, 联系人...');
    expect(markup).not.toContain('主数据工作台');
    expect(markup).not.toContain('新增供应商');
    expect(markup).not.toContain('基础信息');
  });

  it('applies supplier search state from query filters to visible rows', () => {
    const filters = parseSupplierSearchParams(new URLSearchParams('keyword=%E5%8D%8E%E4%B8%BA'));
    const visibleRows = buildSupplierListRows(
      filterSupplierListItems(
        [
          {
            id: 'supplier_001',
            code: 'V-001',
            name: '华为技术有限公司',
            contactPerson: '赵经理',
            qualificationExpiryLabel: '2026-06-15',
            cooperativeOrdersLabel: '42',
            statusLabel: '合格',
          },
          {
            id: 'supplier_002',
            code: 'V-002',
            name: '比亚迪供应链有限公司',
            contactPerson: '李经理',
            qualificationExpiryLabel: '2026-08-20',
            cooperativeOrdersLabel: '19',
            statusLabel: '合格',
          },
        ],
        filters,
      ),
    );

    expect(filters).toEqual({ keyword: '华为' });
    expect(visibleRows).toHaveLength(1);
    expect(visibleRows[0]?.name).toBe('华为技术有限公司');
  });
});
