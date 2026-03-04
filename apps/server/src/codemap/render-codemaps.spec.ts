import { renderCodemaps } from './render-codemaps';
import type { SourceGraph } from './scan-source-graph';

function createGraph(): SourceGraph {
  return {
    generatedAt: '2026-03-04T00:00:00.000Z',
    rootDir: '/tmp/repo',
    nodes: [
      {
        filePath: 'apps/server/src/modules/a.ts',
        scope: 'backend',
        internalImports: ['apps/server/src/modules/b.ts'],
        externalImports: ['@nestjs/common'],
        exportNames: ['AService'],
      },
      {
        filePath: 'apps/server/src/modules/b.ts',
        scope: 'backend',
        internalImports: [],
        externalImports: [],
        exportNames: ['BService'],
      },
      {
        filePath: 'apps/web/src/hooks/use-a.ts',
        scope: 'frontend',
        internalImports: [],
        externalImports: ['react'],
        exportNames: ['useA'],
      },
      {
        filePath: 'packages/shared/src/types/a.ts',
        scope: 'shared',
        internalImports: [],
        externalImports: [],
        exportNames: ['AType'],
      },
    ],
    packageDependencies: [
      {
        packageName: 'server',
        dependencies: ['@nestjs/common'],
        devDependencies: ['jest'],
      },
    ],
  };
}

describe('renderCodemaps', () => {
  it('renders all codemap outputs with freshness', () => {
    const rendered = renderCodemaps(createGraph());

    expect(rendered.architecture).toContain('# Architecture codemap');
    expect(rendered.backend).toContain('# Backend codemap');
    expect(rendered.frontend).toContain('# Frontend codemap');
    expect(rendered.data).toContain('# Data codemap');

    expect(rendered.architecture).toContain(
      'Freshness: 2026-03-04T00:00:00.000Z',
    );
    expect(rendered.backend).toContain('Freshness: 2026-03-04T00:00:00.000Z');
    expect(rendered.frontend).toContain('Freshness: 2026-03-04T00:00:00.000Z');
    expect(rendered.data).toContain('Freshness: 2026-03-04T00:00:00.000Z');
  });
});
