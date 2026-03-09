import { describe, expect, it } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import WorkOrderDetailPage from './page';

describe('manufacturing work order detail page contract', () => {
  it('renders a real T3 detail page instead of the placeholder shell', async () => {
    const page = await WorkOrderDetailPage({
      params: Promise.resolve({ id: 'wo-test-001' }),
    });
    const markup = renderToStaticMarkup(page);

    expect(markup).toContain('wo-test-001');
    expect(markup).toContain('工单详情 · 详情数据接入中');
    expect(markup).toContain('data-testid="work-order-detail-header"');
    expect(markup).toContain('data-testid="work-order-detail-summary"');
    expect(markup).toContain('data-testid="work-order-detail-sections"');
    expect(markup).toContain('工序');
    expect(markup).toContain('工作中心');
    expect(markup).toContain('报工结果');
    expect(markup).toContain('质量记录');
    expect(markup).toContain('返回生产视图');
    expect(markup).toContain('href="/manufacturing/orders"');
    expect(markup).toContain('操作待接入');
    expect(markup).not.toContain('迁移中');
    expect(markup).not.toContain('Tab 内容');
    expect(markup).not.toContain('概览、证据、审计三类内容都将统一到这个详情模板');
  });
});
