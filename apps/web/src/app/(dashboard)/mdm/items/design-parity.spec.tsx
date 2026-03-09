import { renderToStaticMarkup } from 'react-dom/server';

import ItemsPage from './page';

describe('items list design parity', () => {
  it('matches the 44noB SKU list workstation structure instead of the simplified fallback', () => {
    const markup = renderToStaticMarkup(<ItemsPage />);

    expect(markup).toContain('SKU 管理');
    expect(markup).toContain('SKU 管理 · 管理工作台');
    expect(markup).toContain('导入');
    expect(markup).toContain('导出');
    expect(markup).toContain('新建 SKU');
    expect(markup).toContain('搜索 SKU 编码、名称、分类、供应商...');
    expect(markup).toContain('电子');
    expect(markup).toContain('线材');
    expect(markup).toContain('在售');
    expect(markup).toContain('低库存');
    expect(markup).toContain('查看预览');
    expect(markup).not.toContain('物料主数据');
    expect(markup).not.toContain('筛选与分享');
  });
});
