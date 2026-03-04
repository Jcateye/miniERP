import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { buildSourceGraph } from './scan-source-graph';

function createFile(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

describe('buildSourceGraph', () => {
  it('collects source nodes and import/export metadata', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codemap-graph-'));

    createFile(
      path.join(tempDir, 'apps/server/src/a.ts'),
      "import { b } from './b';\nimport { Injectable } from '@nestjs/common';\nexport const a = b;",
    );
    createFile(path.join(tempDir, 'apps/server/src/b.ts'), 'export const b = 1;');
    createFile(path.join(tempDir, 'apps/server/package.json'), JSON.stringify({ name: 'server', dependencies: { '@nestjs/common': '^11' } }));
    createFile(path.join(tempDir, 'apps/web/package.json'), JSON.stringify({ name: 'web' }));
    createFile(path.join(tempDir, 'packages/shared/package.json'), JSON.stringify({ name: 'shared' }));
    createFile(path.join(tempDir, 'package.json'), JSON.stringify({ name: 'root' }));

    const graph = buildSourceGraph(tempDir);

    expect(graph.nodes.length).toBe(2);
    const serverNode = graph.nodes.find((node) => node.filePath === 'apps/server/src/a.ts');
    expect(serverNode).toBeDefined();
    expect(serverNode?.internalImports).toContain('apps/server/src/b.ts');
    expect(serverNode?.externalImports).toContain('@nestjs/common');
    expect(serverNode?.exportNames).toContain('a');

    expect(graph.packageDependencies.length).toBe(4);
  });
});
