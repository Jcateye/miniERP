import { renderToStaticMarkup } from 'react-dom/server';

import UsersPage from './page';
import {
  buildUserListRows,
  USER_LIST_COLUMNS,
  USER_PAGE_PRESENTATION,
  type UserListItem,
} from './users-page';
import { UsersPageScaffold } from './users-page-view';

describe('users page contract', () => {
  it('uses user-specific T2 page presentation', () => {
    expect(USER_PAGE_PRESENTATION).toMatchObject({
      family: 'T2',
      variant: 'simple-list',
      title: '用户管理',
      summary: '用户 · 权限管理',
      primaryActionLabel: '新建用户',
      detailHrefBase: '/mdm/users',
    });
  });

  it('uses design-aligned user table columns', () => {
    expect(USER_LIST_COLUMNS.map((column) => column.label)).toEqual([
      '用户名',
      '姓名',
      '角色',
      '部门',
      '最近登录',
      '状态',
    ]);
  });

  it('maps seeded items into design-shaped user rows', () => {
    const rows = buildUserListRows([
      {
        id: 'user_001',
        username: 'zhangsan',
        name: '张三',
        roleLabel: '管理员',
        departmentLabel: '采购部',
        lastLoginLabel: '2 分钟前',
        statusLabel: '在线',
      } satisfies UserListItem,
    ]);

    expect(rows).toEqual([
      {
        id: 'user_001',
        username: 'zhangsan',
        name: '张三',
        role: '管理员',
        department: '采购部',
        lastLogin: '2 分钟前',
        status: '在线',
        detailHref: undefined,
      },
    ]);
  });

  it('falls back missing display fields to design-safe placeholders', () => {
    const rows = buildUserListRows([
      {
        id: 'user_002',
        username: 'lisi',
        name: '李四',
        roleLabel: null,
        departmentLabel: '',
        lastLoginLabel: null,
        statusLabel: null,
      } satisfies UserListItem,
    ]);

    expect(rows[0]).toMatchObject({
      role: '—',
      department: '—',
      lastLogin: '—',
      status: '—',
    });
  });

  it('does not expose detail href while detail page is not implemented', () => {
    const rows = buildUserListRows([
      {
        id: 'user/with-slash',
        username: 'wangwu',
        name: '王五',
        roleLabel: '仓管员',
        departmentLabel: '仓储部',
        lastLoginLabel: '1 天前',
        statusLabel: '离线',
      } satisfies UserListItem,
    ]);

    expect(rows[0]?.detailHref).toBeUndefined();
  });

  it('renders design scaffold regions for the users page', () => {
    const markup = renderToStaticMarkup(
      <UsersPageScaffold
        title={USER_PAGE_PRESENTATION.title}
        summary={USER_PAGE_PRESENTATION.summary}
        primaryActionLabel={USER_PAGE_PRESENTATION.primaryActionLabel}
        table={<div>table-body</div>}
      />,
    );

    expect(markup).toContain('data-testid="users-topbar"');
    expect(markup).toContain('data-testid="users-table"');
    expect(markup).not.toContain('data-testid="users-search"');
    expect(markup).not.toContain('data-testid="users-filter-chips"');
    expect(markup).not.toContain('data-testid="users-seed-notice"');
    expect(markup).toContain('用户管理');
    expect(markup).toContain('用户 · 权限管理');
    expect(markup).toContain('新建用户');
    expect(markup).toContain('disabled');
  });

  it('renders the real page without pagination footer', () => {
    const markup = renderToStaticMarkup(<UsersPage />);

    expect(markup).toContain('用户管理');
    expect(markup).toContain('用户 · 权限管理');
    expect(markup).toContain('用户名');
    expect(markup).toContain('姓名');
    expect(markup).toContain('角色');
    expect(markup).toContain('部门');
    expect(markup).toContain('最近登录');
    expect(markup).toContain('状态');
    expect(markup).toContain('新建用户');
    expect(markup).toContain('disabled');
    expect(markup).toContain('zhangsan');
    expect(markup).toContain('张三');
    expect(markup).toContain('管理员');
    expect(markup).toContain('采购部');
    expect(markup).toContain('2 分钟前');
    expect(markup).toContain('在线');
    expect(markup).not.toContain('1 / 1');
    expect(markup).not.toContain('‹');
    expect(markup).not.toContain('›');
    expect(markup).not.toContain('搜索用户姓名、邮箱');
    expect(markup).not.toContain('所有角色');
    expect(markup).not.toContain('添加用户');
    expect(markup).not.toContain('邮箱');
  });
});
