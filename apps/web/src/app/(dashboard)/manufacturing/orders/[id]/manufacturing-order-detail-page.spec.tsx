import { describe, expect, it } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import ManufacturingOrderDetailPage from './page';

describe('manufacturing order detail page contract', () => {
  it('renders a real T3 detail page instead of the placeholder shell', async () => {
    const page = await ManufacturingOrderDetailPage({
      params: Promise.resolve({ id: 'mo-test-001' }),
    });
    const markup = renderToStaticMarkup(page);

    expect(markup).toContain('mo-test-001');
    expect(markup).toContain('生产订单详情 · 详情数据接入中');
    expect(markup).toContain('data-testid="manufacturing-order-detail-header"');
    expect(markup).toContain('data-testid="manufacturing-order-detail-summary"');
    expect(markup).toContain('data-testid="manufacturing-order-detail-sections"');
    expect(markup).toContain('工单');
    expect(markup).toContain('领退料');
    expect(markup).toContain('报工');
    expect(markup).toContain('完工入库');
    expect(markup).toContain('返回生产订单');
    expect(markup).toContain('href="/manufacturing/orders"');
    expect(markup).toContain('操作待接入');
    expect(markup).not.toContain('发起下达');
    expect(markup).not.toContain('迁移中');
    expect(markup).not.toContain('Tab 内容');
    expect(markup).not.toContain('概览、证据、审计三类内容都将统一到这个详情模板');
  });
});
