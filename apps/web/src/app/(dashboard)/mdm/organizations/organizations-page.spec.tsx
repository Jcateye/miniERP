import { renderToStaticMarkup } from 'react-dom/server';

import OrganizationsPage from './page';
import {
  buildOrganizationListRows,
  ORGANIZATION_LIST_COLUMNS,
  ORGANIZATION_PAGE_PRESENTATION,
  type OrganizationListItem,
} from './organizations-page';
import { OrganizationsPageScaffold } from './organizations-page-view';

describe('organizations page contract', () => {
  it('uses organization-specific T2 page presentation', () => {
    expect(ORGANIZATION_PAGE_PRESENTATION).toMatchObject({
      family: 'T2',
      variant: 'simple-list',
      title: '组织管理',
      summary: '公司 · 组织单元',
      primaryActionLabel: '新建组织',
      detailHrefBase: '/mdm/organizations',
    });
  });

  it('uses design-aligned organization table columns', () => {
    expect(ORGANIZATION_LIST_COLUMNS.map((column) => column.label)).toEqual([
      '编号',
      '名称',
      '类型',
      '上级组织',
      '状态',
    ]);
  });

  it('maps seeded items into design-shaped organization rows', () => {
    const rows = buildOrganizationListRows([
      {
        id: 'org_001',
        code: 'ORG-001',
        name: '深圳总部有限公司',
        typeLabel: '公司',
        parentName: null,
        statusLabel: '活跃',
      } satisfies OrganizationListItem,
    ]);

    expect(rows).toEqual([
      {
        id: 'org_001',
        code: 'ORG-001',
        name: '深圳总部有限公司',
        type: '公司',
        parentName: '—',
        status: '活跃',
        detailHref: undefined,
      },
    ]);
  });

  it('falls back missing display fields to design-safe placeholders', () => {
    const rows = buildOrganizationListRows([
      {
        id: 'org_002',
        code: 'ORG-002',
        name: '华南供应链中心',
        typeLabel: null,
        parentName: '',
        statusLabel: null,
      } satisfies OrganizationListItem,
    ]);

    expect(rows[0]).toMatchObject({
      type: '—',
      parentName: '—',
      status: '—',
    });
  });

  it('does not expose detail href while detail page is not implemented', () => {
    const rows = buildOrganizationListRows([
      {
        id: 'org/with-slash',
        code: 'ORG-SLASH',
        name: '测试组织',
        typeLabel: '部门',
        parentName: '深圳总部有限公司',
        statusLabel: '活跃',
      } satisfies OrganizationListItem,
    ]);

    expect(rows[0]?.detailHref).toBeUndefined();
  });

  it('renders design scaffold regions for the organizations page', () => {
    const markup = renderToStaticMarkup(
      <OrganizationsPageScaffold
        title={ORGANIZATION_PAGE_PRESENTATION.title}
        summary={ORGANIZATION_PAGE_PRESENTATION.summary}
        primaryActionLabel={ORGANIZATION_PAGE_PRESENTATION.primaryActionLabel}
        table={<div>table-body</div>}
      />,
    );

    expect(markup).toContain('data-testid="organizations-topbar"');
    expect(markup).toContain('data-testid="organizations-table"');
    expect(markup).not.toContain('data-testid="organizations-search"');
    expect(markup).not.toContain('data-testid="organizations-filter-chips"');
    expect(markup).not.toContain('data-testid="organizations-seed-notice"');
    expect(markup).toContain('组织管理');
    expect(markup).toContain('公司 · 组织单元');
    expect(markup).toContain('新建组织');
    expect(markup).toContain('disabled');
  });

  it('renders the real page without pagination footer', () => {
    const markup = renderToStaticMarkup(<OrganizationsPage />);

    expect(markup).toContain('组织管理');
    expect(markup).toContain('公司 · 组织单元');
    expect(markup).toContain('编号');
    expect(markup).toContain('名称');
    expect(markup).toContain('类型');
    expect(markup).toContain('上级组织');
    expect(markup).toContain('状态');
    expect(markup).toContain('新建组织');
    expect(markup).toContain('disabled');
    expect(markup).toContain('ORG-001');
    expect(markup).toContain('深圳总部有限公司');
    expect(markup).toContain('ORG-002');
    expect(markup).toContain('华南供应链中心');
    expect(markup).toContain('业务单元');
    expect(markup).toContain('活跃');
    expect(markup).not.toContain('1 / 1');
    expect(markup).not.toContain('‹');
    expect(markup).not.toContain('›');
    expect(markup).not.toContain('组织单元工作台');
  });
});
