import { renderToStaticMarkup } from 'react-dom/server';

import {
  buildCustomerListRows,
  buildCustomerSearchQuery,
  CUSTOMER_LIST_COLUMNS,
  CUSTOMER_PAGE_PRESENTATION,
  filterCustomerListItems,
  parseCustomerListPayload,
  parseCustomerSearchParams,
  type CustomerListItem,
} from './customers-page';
import { CustomersPageScaffold } from './customers-page-view';

describe('customers page contract', () => {
  it('uses customer-specific T2 page presentation', () => {
    expect(CUSTOMER_PAGE_PRESENTATION).toMatchObject({
      family: 'T2',
      variant: 'search-list',
      title: '客户管理',
      summary: '客户 · 主数据管理',
      primaryActionLabel: '新建客户',
      createHref: '/mdm/customers/new',
      searchPlaceholder: '搜索客户名称, 联系人, 编号...',
      detailHrefBase: '/mdm/customers',
      apiBasePath: '/api/bff/customers',
    });
  });

  it('uses design-aligned customer table columns', () => {
    expect(CUSTOMER_LIST_COLUMNS.map((column) => column.label)).toEqual([
      '编号',
      '客户名称',
      '联系人',
      '电话',
      '信用额度',
      '状态',
    ]);
  });

  it('maps api items into design-shaped list rows', () => {
    const rows = buildCustomerListRows([
      {
        id: 'c1',
        tenantId: 't1',
        code: 'C-001',
        name: '中兴通讯股份有限公司',
        contactPerson: '王经理',
        contactPhone: '138-0000-1234',
        email: 'wang@example.com',
        address: '深圳',
        isActive: true,
        creditLimitLabel: '¥500,000',
        createdAt: '2026-03-06T08:00:00.000Z',
        updatedAt: '2026-03-06T10:00:00.000Z',
      } satisfies CustomerListItem,
    ]);

    expect(rows).toEqual([
      {
        id: 'c1',
        code: 'C-001',
        name: '中兴通讯股份有限公司',
        contactPerson: '王经理',
        contactPhone: '138-0000-1234',
        creditLimit: '¥500,000',
        status: '活跃',
        detailHref: '/mdm/customers/c1',
      },
    ]);
  });

  it('falls back missing fields to design-safe placeholders', () => {
    const rows = buildCustomerListRows([
      {
        id: 'c2',
        tenantId: 't1',
        code: 'C-002',
        name: '比亚迪电子有限公司',
        contactPerson: null,
        contactPhone: null,
        email: null,
        address: null,
        isActive: false,
        createdAt: '2026-03-06T08:00:00.000Z',
        updatedAt: '2026-03-06T10:00:00.000Z',
      } satisfies CustomerListItem,
    ]);

    expect(rows[0]).toMatchObject({
      contactPerson: '—',
      contactPhone: '—',
      creditLimit: '—',
      status: '停用',
      detailHref: '/mdm/customers/c2',
    });
  });

  it('encodes detail href ids safely', () => {
    const rows = buildCustomerListRows([
      {
        id: 'customer/with-slash',
        tenantId: 't1',
        code: 'C-003',
        name: '带特殊ID客户',
        contactPerson: null,
        contactPhone: null,
        email: null,
        address: null,
        isActive: true,
        createdAt: '2026-03-06T08:00:00.000Z',
        updatedAt: '2026-03-06T10:00:00.000Z',
      } satisfies CustomerListItem,
    ]);

    expect(rows[0]?.detailHref).toBe('/mdm/customers/customer%2Fwith-slash');
  });

  it('throws when customer list payload is malformed', () => {
    expect(() => parseCustomerListPayload({})).toThrow('客户列表响应格式无效');
  });

  it('parses and rebuilds customer search params with trimmed values', () => {
    const filters = parseCustomerSearchParams(
      new URLSearchParams('keyword=%20Alice%20&status=active'),
    );

    expect(filters).toEqual({
      keyword: 'Alice',
      status: 'active',
    });

    expect(buildCustomerSearchQuery(filters)).toBe('keyword=Alice&status=active');
  });

  it('filters customer list items by keyword and status', () => {
    const items: CustomerListItem[] = [
      {
        id: 'c1',
        tenantId: 't1',
        code: 'C-001',
        name: '中兴通讯股份有限公司',
        contactPerson: '王经理',
        contactPhone: '138-0000-1234',
        email: 'wang@example.com',
        address: '深圳',
        isActive: true,
        createdAt: '2026-03-06T08:00:00.000Z',
        updatedAt: '2026-03-06T10:00:00.000Z',
      },
      {
        id: 'c2',
        tenantId: 't1',
        code: 'C-002',
        name: '比亚迪电子有限公司',
        contactPerson: '李经理',
        contactPhone: '139-0000-5678',
        email: 'li@example.com',
        address: '深圳',
        isActive: false,
        createdAt: '2026-03-06T08:00:00.000Z',
        updatedAt: '2026-03-06T10:00:00.000Z',
      },
    ];

    expect(filterCustomerListItems(items, { keyword: '王经理', status: '' })).toHaveLength(1);
    expect(filterCustomerListItems(items, { keyword: 'C-002', status: 'inactive' })).toHaveLength(1);
    expect(filterCustomerListItems(items, { keyword: '比亚迪', status: 'active' })).toHaveLength(0);
  });

  it('renders design scaffold regions for the customer page', () => {
    const markup = renderToStaticMarkup(
      <CustomersPageScaffold
        title={CUSTOMER_PAGE_PRESENTATION.title}
        summary={CUSTOMER_PAGE_PRESENTATION.summary}
        primaryActionLabel={CUSTOMER_PAGE_PRESENTATION.primaryActionLabel}
        primaryActionHref={CUSTOMER_PAGE_PRESENTATION.createHref}
        searchPlaceholder={CUSTOMER_PAGE_PRESENTATION.searchPlaceholder}
        table={<div>table-body</div>}
      />,
    );

    expect(markup).toContain('data-testid="customers-topbar"');
    expect(markup).toContain('data-testid="customers-search"');
    expect(markup).not.toContain('data-testid="customers-filter-chips"');
    expect(markup).toContain('data-testid="customers-table"');
    expect(markup).toContain('客户管理');
    expect(markup).toContain('客户 · 主数据管理');
    expect(markup).toContain('新建客户');
    expect(markup).toContain('/mdm/customers/new');
    expect(markup).toContain('搜索客户名称, 联系人, 编号...');
  });
});
