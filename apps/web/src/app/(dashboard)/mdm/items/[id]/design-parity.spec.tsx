import { renderToStaticMarkup } from 'react-dom/server';

import ItemDetailPage from './page';

describe('item detail design parity', () => {
  it('matches the 9Yth0 SKU detail page structure instead of the simplified fallback detail', async () => {
    const page = await ItemDetailPage({ params: Promise.resolve({ id: 'item-001' }) });
    const markup = renderToStaticMarkup(page);

    expect(markup).toContain('CAB-HDMI-2M');
    expect(markup).toContain('SKU 详情页');
    expect(markup).toContain('基本信息');
    expect(markup).toContain('电气参数');
    expect(markup).toContain('库存价值');
    expect(markup).toContain('库存数量');
    expect(markup).toContain('引脚图');
    expect(markup).toContain('证书文档');
    expect(markup).toContain('报价记录');
    expect(markup).not.toContain('物料详情');
    expect(markup).not.toContain('审计线索');
  });
});
