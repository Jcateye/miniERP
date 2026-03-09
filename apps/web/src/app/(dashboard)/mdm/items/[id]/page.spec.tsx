import { describe, expect, it } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import ItemDetailPage from './page';

describe('item detail page contract', () => {
  it('renders a real T3 detail page instead of the client fetch detail shell', async () => {
    const page = await ItemDetailPage({
      params: Promise.resolve({ id: 'item-test-001' }),
    });
    const markup = renderToStaticMarkup(page);

    expect(markup).toContain('CAB-HDMI-2M');
    expect(markup).toContain('data-testid="item-detail-header"');
    expect(markup).toContain('data-testid="item-detail-summary"');
    expect(markup).toContain('data-testid="item-detail-electrical"');
    expect(markup).toContain('data-testid="item-detail-stock-card"');
    expect(markup).toContain('data-testid="item-detail-bottom-tabs"');
    expect(markup).toContain('item-test-001');
    expect(markup).toContain('返回列表');
    expect(markup).toContain('href="/mdm/items"');
    expect(markup).toContain('基本信息');
    expect(markup).toContain('电气参数');
    expect(markup).toContain('库存价值');
    expect(markup).toContain('引脚图');
    expect(markup).toContain('证书文档');
    expect(markup).toContain('报价记录');
    expect(markup).not.toContain('迁移中');
    expect(markup).not.toContain('当前详情来自 BFF fixture 回退数据');
  });
});
