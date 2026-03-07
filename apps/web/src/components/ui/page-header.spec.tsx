import { renderToStaticMarkup } from 'react-dom/server';

import { ActionButton } from './page-header';

describe('ActionButton', () => {
  it('renders a link when href is provided', () => {
    const markup = renderToStaticMarkup(<ActionButton label="新建客户" tone="primary" href="/mdm/customers/new" />);

    expect(markup).toContain('href="/mdm/customers/new"');
    expect(markup).toContain('新建客户');
  });
});
