import { renderToStaticMarkup } from 'react-dom/server';

import IntegrationEndpointsPage from './page';
import {
  buildEndpointListRows,
  ENDPOINT_LIST_COLUMNS,
  ENDPOINT_PAGE_PRESENTATION,
  type EndpointListItem,
} from './endpoints-page';
import { EndpointsPageScaffold } from './endpoints-page-view';

describe('integration endpoints page contract', () => {
  it('uses endpoint-specific T2 page presentation', () => {
    expect(ENDPOINT_PAGE_PRESENTATION).toMatchObject({
      family: 'T2',
      variant: 'simple-list',
      title: '集成端点',
      summary: 'Integration Endpoints · 外部系统连接',
      primaryActionLabel: '新建端点',
      detailHrefBase: '/integration/endpoints',
    });
  });

  it('uses design-aligned endpoint table columns', () => {
    expect(ENDPOINT_LIST_COLUMNS.map((column) => column.label)).toEqual([
      '名称',
      '类型',
      'URL',
      '状态',
      '最近同步',
    ]);
  });

  it('maps seeded items into design-shaped endpoint rows', () => {
    const rows = buildEndpointListRows([
      {
        id: 'endpoint_wms',
        name: 'ERP-WMS 同步',
        typeLabel: 'REST',
        url: 'https://wms.example.com/api',
        statusLabel: '连接',
        lastSyncedLabel: '3 分钟前',
      } satisfies EndpointListItem,
    ]);

    expect(rows).toEqual([
      {
        id: 'endpoint_wms',
        name: 'ERP-WMS 同步',
        type: 'REST',
        url: 'https://wms.example.com/api',
        status: '连接',
        lastSynced: '3 分钟前',
        detailHref: undefined,
      },
    ]);
  });

  it('falls back missing display fields to design-safe placeholders', () => {
    const rows = buildEndpointListRows([
      {
        id: 'endpoint_missing',
        name: 'ERP-MES 同步',
        typeLabel: null,
        url: '',
        statusLabel: null,
        lastSyncedLabel: null,
      } satisfies EndpointListItem,
    ]);

    expect(rows[0]).toMatchObject({
      type: '—',
      url: '—',
      status: '—',
      lastSynced: '—',
    });
  });

  it('does not expose detail href while detail page is not implemented', () => {
    const rows = buildEndpointListRows([
      {
        id: 'endpoint/with-slash',
        name: '测试端点',
        typeLabel: 'Webhook',
        url: 'https://hooks.example.com/mini-erp',
        statusLabel: '断开',
        lastSyncedLabel: '从未同步',
      } satisfies EndpointListItem,
    ]);

    expect(rows[0]?.detailHref).toBeUndefined();
  });

  it('renders design scaffold regions for the endpoints page', () => {
    const markup = renderToStaticMarkup(
      <EndpointsPageScaffold
        title={ENDPOINT_PAGE_PRESENTATION.title}
        summary={ENDPOINT_PAGE_PRESENTATION.summary}
        primaryActionLabel={ENDPOINT_PAGE_PRESENTATION.primaryActionLabel}
        table={<div>table-body</div>}
      />,
    );

    expect(markup).toContain('data-testid="endpoints-topbar"');
    expect(markup).toContain('data-testid="endpoints-table"');
    expect(markup).not.toContain('data-testid="endpoints-search"');
    expect(markup).not.toContain('data-testid="endpoints-filter-chips"');
    expect(markup).not.toContain('data-testid="endpoints-seed-notice"');
    expect(markup).toContain('集成端点');
    expect(markup).toContain('Integration Endpoints · 外部系统连接');
    expect(markup).toContain('新建端点');
    expect(markup).toContain('disabled');
  });

  it('renders the real page without pagination footer', () => {
    const markup = renderToStaticMarkup(<IntegrationEndpointsPage />);

    expect(markup).toContain('集成端点');
    expect(markup).toContain('Integration Endpoints · 外部系统连接');
    expect(markup).toContain('名称');
    expect(markup).toContain('类型');
    expect(markup).toContain('URL');
    expect(markup).toContain('状态');
    expect(markup).toContain('最近同步');
    expect(markup).toContain('新建端点');
    expect(markup).toContain('disabled');
    expect(markup).toContain('ERP-WMS 同步');
    expect(markup).toContain('REST');
    expect(markup).toContain('https://wms.example.com/api');
    expect(markup).toContain('连接');
    expect(markup).toContain('3 分钟前');
    expect(markup).not.toContain('1 / 1');
    expect(markup).not.toContain('‹');
    expect(markup).not.toContain('›');
    expect(markup).not.toContain('API 客户端管理');
    expect(markup).not.toContain('新建客户端');
  });
});
