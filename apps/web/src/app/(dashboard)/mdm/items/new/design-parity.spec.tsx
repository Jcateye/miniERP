import { renderToStaticMarkup } from 'react-dom/server';

import NewItemPage from './page';

describe('new item design parity', () => {
  it('matches a T4 create flow instead of a simplified notes page', () => {
    const markup = renderToStaticMarkup(<NewItemPage />);

    expect(markup).toContain('新建 SKU');
    expect(markup).toContain('返回列表');
    expect(markup).toContain('保存草稿');
    expect(markup).toContain('基础信息');
    expect(markup).toContain('规格与分类');
    expect(markup).toContain('提交确认');
    expect(markup).toContain('编码规则');
    expect(markup).toContain('SKU 名称');
    expect(markup).toContain('分类');
    expect(markup).toContain('基础单位');
    expect(markup).not.toContain('新建物料');
    expect(markup).not.toContain('以最小 T4 向导承接物料创建流程');
  });
});
