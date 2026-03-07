import { renderToStaticMarkup } from 'react-dom/server';

import { DataTable } from './data-table';

describe('DataTable', () => {
  it('hides pagination footer when showPagination is false', () => {
    const markup = renderToStaticMarkup(
      <DataTable
        columns={[{ key: 'name', label: '名称' }]}
        rows={[{ id: 'row_1', name: '测试行' }]}
        showPagination={false}
      />,
    );

    expect(markup).not.toContain('1 / 1');
    expect(markup).not.toContain('共 ');
    expect(markup).not.toContain('‹');
    expect(markup).not.toContain('›');
  });
});
