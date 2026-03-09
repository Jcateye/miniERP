import { describe, expect, it } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import ManufacturingOverviewPage from './page';

describe('manufacturing overview page contract', () => {
  it('renders the real manufacturing overview instead of the placeholder shell', () => {
    const markup = renderToStaticMarkup(<ManufacturingOverviewPage />);

    expect(markup).toContain('制造总览');
    expect(markup).toContain('data-testid="manufacturing-overview-topbar"');
    expect(markup).toContain('data-testid="manufacturing-overview-metrics"');
    expect(markup).toContain('data-testid="manufacturing-overview-quick-links"');
    expect(markup).toContain('生产订单');
    expect(markup).toContain('工单');
    expect(markup).toContain('href="/manufacturing/orders"');
    expect(markup).toContain('href="/quality/records"');
    expect(markup).not.toContain('href="/manufacturing/work-orders/wip"');
    expect(markup).toContain('BOM');
    expect(markup).toContain('质检');
    expect(markup).not.toContain('迁移中');
    expect(markup).not.toContain('后续接入点');
    expect(markup).not.toContain('下一步：接入真实领域数据');
  });
});
