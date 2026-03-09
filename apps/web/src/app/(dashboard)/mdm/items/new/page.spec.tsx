import { describe, expect, it } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import NewItemPage from './page';

describe('new item page contract', () => {
  it('renders a real T4 create page instead of the legacy wizard assembly', () => {
    const markup = renderToStaticMarkup(<NewItemPage />);

    expect(markup).toContain('新建 SKU');
    expect(markup).toContain('data-testid="new-item-header"');
    expect(markup).toContain('data-testid="new-item-steps"');
    expect(markup).toContain('data-testid="new-item-sections"');
    expect(markup).toContain('返回列表');
    expect(markup).toContain('href="/mdm/items"');
    expect(markup).toContain('基础信息');
    expect(markup).toContain('规格与分类');
    expect(markup).toContain('提交确认');
    expect(markup).toContain('编码规则');
    expect(markup).toContain('SKU 名称');
    expect(markup).toContain('分类');
    expect(markup).toContain('基础单位');
    expect(markup).not.toContain('按统一物料模板创建主数据，并保留旧 SKU 字段兼容能力。');
    expect(markup).not.toContain('提交物料');
  });
});
