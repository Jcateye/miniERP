import { renderToStaticMarkup } from 'react-dom/server';

import RolesPage from './page';
import {
  buildRoleListRows,
  ROLE_LIST_COLUMNS,
  ROLE_PAGE_PRESENTATION,
  type RoleListItem,
} from './roles-page';
import { RolesPageScaffold } from './roles-page-view';

describe('roles page contract', () => {
  it('uses role-specific T2 page presentation', () => {
    expect(ROLE_PAGE_PRESENTATION).toMatchObject({
      family: 'T2',
      variant: 'simple-list',
      title: '角色权限',
      summary: '角色 · 权限配置',
      primaryActionLabel: '新建角色',
      detailHrefBase: '/mdm/roles',
    });
  });

  it('uses design-aligned role table columns', () => {
    expect(ROLE_LIST_COLUMNS.map((column) => column.label)).toEqual([
      '角色名称',
      '描述',
      '权限数',
      '用户数',
      '状态',
    ]);
  });

  it('maps seeded items into design-shaped role rows', () => {
    const rows = buildRoleListRows([
      {
        id: 'role_001',
        name: '系统管理员',
        description: '拥有所有系统权限',
        permissionCountLabel: '全部',
        userCountLabel: '2',
        statusLabel: '启用',
      } satisfies RoleListItem,
    ]);

    expect(rows).toEqual([
      {
        id: 'role_001',
        name: '系统管理员',
        description: '拥有所有系统权限',
        permissionCount: '全部',
        userCount: '2',
        status: '启用',
        detailHref: undefined,
      },
    ]);
  });

  it('falls back missing display fields to design-safe placeholders', () => {
    const rows = buildRoleListRows([
      {
        id: 'role_002',
        name: '采购员',
        description: '',
        permissionCountLabel: null,
        userCountLabel: null,
        statusLabel: null,
      } satisfies RoleListItem,
    ]);

    expect(rows[0]).toMatchObject({
      description: '—',
      permissionCount: '—',
      userCount: '—',
      status: '—',
    });
  });

  it('does not expose detail href while detail page is not implemented', () => {
    const rows = buildRoleListRows([
      {
        id: 'role/with-slash',
        name: '仓管员',
        description: '负责库存和盘点',
        permissionCountLabel: '18',
        userCountLabel: '6',
        statusLabel: '停用',
      } satisfies RoleListItem,
    ]);

    expect(rows[0]?.detailHref).toBeUndefined();
  });

  it('renders design scaffold regions for the roles page', () => {
    const markup = renderToStaticMarkup(
      <RolesPageScaffold
        title={ROLE_PAGE_PRESENTATION.title}
        summary={ROLE_PAGE_PRESENTATION.summary}
        primaryActionLabel={ROLE_PAGE_PRESENTATION.primaryActionLabel}
        table={<div>table-body</div>}
      />,
    );

    expect(markup).toContain('data-testid="roles-topbar"');
    expect(markup).toContain('data-testid="roles-table"');
    expect(markup).not.toContain('data-testid="roles-search"');
    expect(markup).not.toContain('data-testid="roles-filter-chips"');
    expect(markup).not.toContain('data-testid="roles-seed-notice"');
    expect(markup).toContain('角色权限');
    expect(markup).toContain('角色 · 权限配置');
    expect(markup).toContain('新建角色');
    expect(markup).toContain('disabled');
  });

  it('renders the real page without pagination footer', () => {
    const markup = renderToStaticMarkup(<RolesPage />);

    expect(markup).toContain('角色权限');
    expect(markup).toContain('角色 · 权限配置');
    expect(markup).toContain('角色名称');
    expect(markup).toContain('描述');
    expect(markup).toContain('权限数');
    expect(markup).toContain('用户数');
    expect(markup).toContain('状态');
    expect(markup).toContain('新建角色');
    expect(markup).toContain('disabled');
    expect(markup).toContain('系统管理员');
    expect(markup).toContain('拥有所有系统权限');
    expect(markup).toContain('全部');
    expect(markup).toContain('2');
    expect(markup).toContain('启用');
    expect(markup).not.toContain('1 / 1');
    expect(markup).not.toContain('‹');
    expect(markup).not.toContain('›');
    expect(markup).not.toContain('保存');
    expect(markup).not.toContain('角色列表');
    expect(markup).not.toContain('系统管理员 — 权限配置');
    expect(markup).not.toContain('SKU 管理');
  });
});
