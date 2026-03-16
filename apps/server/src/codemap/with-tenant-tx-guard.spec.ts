import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { evaluateWithTenantTxGuard } from './with-tenant-tx-guard';

function createFile(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

describe('evaluateWithTenantTxGuard', () => {
  it('fails when backend imports PrismaService outside allowlist', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codemap-guard-'));

    createFile(
      path.join(tempDir, 'apps/server/src/some-feature/foo.ts'),
      "import { PrismaService } from '../database/prisma.service';\nexport const foo = PrismaService;",
    );

    createFile(
      path.join(tempDir, 'apps/server/src/some-feature/bar.ts'),
      "import { PrismaService } from '@/database/prisma.service';\nexport const bar = PrismaService;",
    );

    createFile(
      path.join(tempDir, 'apps/server/src/some-feature/baz.ts'),
      "import { PrismaService } from '@/database/prisma.service.ts';\nexport const baz = PrismaService;",
    );

    createFile(
      path.join(tempDir, 'apps/server/src/some-feature/req.ts'),
      "const { PrismaService } = require('@/database/prisma.service');\nexport const req = PrismaService;",
    );

    createFile(
      path.join(tempDir, 'apps/server/src/some-feature/comment.ts'),
      "// require('@/database/prisma.service')\nexport const x = 1;\nvoid x;",
    );

    createFile(
      path.join(tempDir, 'apps/server/src/some-feature/trailing-comment.ts'),
      "const x = 1; // require('@/database/prisma.service')\nvoid x;",
    );

    createFile(
      path.join(tempDir, 'apps/server/src/some-feature/dot-require.ts'),
      "const x = { require: (value: string) => value };\nconst y = x.require('@/database/prisma.service');\nvoid y;",
    );

    createFile(
      path.join(tempDir, 'apps/server/src/some-feature/third-party.ts'),
      "import { PrismaService } from '@acme/database/prisma.service';\nexport const x = PrismaService;\nvoid x;",
    );

    createFile(
      path.join(tempDir, 'apps/server/src/database/prisma.service.ts'),
      'export class PrismaService {}',
    );
    createFile(
      path.join(tempDir, 'apps/server/package.json'),
      JSON.stringify({ name: 'server' }),
    );
    createFile(
      path.join(tempDir, 'apps/web/package.json'),
      JSON.stringify({ name: 'web' }),
    );
    createFile(
      path.join(tempDir, 'packages/shared/package.json'),
      JSON.stringify({ name: 'shared' }),
    );
    createFile(
      path.join(tempDir, 'package.json'),
      JSON.stringify({ name: 'root' }),
    );

    const result = evaluateWithTenantTxGuard({ rootDir: tempDir });

    expect(result.ok).toBe(false);
    expect(typeof result.summary).toBe('string');
    expect(result.summary).toContain('ok=false');
    expect(result.summary).toContain('hint=');
    expect(result.directPrismaImports).toEqual([
      'apps/server/src/some-feature/bar.ts',
      'apps/server/src/some-feature/baz.ts',
      'apps/server/src/some-feature/foo.ts',
      'apps/server/src/some-feature/req.ts',
    ]);

    expect(result.directPrismaImports).not.toContain(
      'apps/server/src/some-feature/comment.ts',
    );
    expect(result.directPrismaImports).not.toContain(
      'apps/server/src/some-feature/trailing-comment.ts',
    );
    expect(result.directPrismaImports).not.toContain(
      'apps/server/src/some-feature/dot-require.ts',
    );
    expect(result.directPrismaImports).not.toContain(
      'apps/server/src/some-feature/third-party.ts',
    );
  });

  it('fails when backend imports PrismaService via barrel re-export', () => {
    const tempDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'codemap-guard-prisma-barrel-'),
    );

    createFile(
      path.join(tempDir, 'apps/server/src/some-feature/foo.ts'),
      "import { PrismaService } from '../database';\nexport const foo = PrismaService;\nvoid foo;",
    );

    createFile(
      path.join(tempDir, 'apps/server/src/some-feature/bar.ts'),
      "import { PrismaService } from '@/database';\nexport const bar = PrismaService;\nvoid bar;",
    );

    createFile(
      path.join(tempDir, 'apps/server/src/database/index.ts'),
      "export * from './prisma.service';\nexport * from './database.constants';",
    );

    createFile(
      path.join(tempDir, 'apps/server/src/database/database.constants.ts'),
      "export const PRISMA_SERVICE_TOKEN = Symbol('PRISMA_SERVICE_TOKEN');\nvoid PRISMA_SERVICE_TOKEN;",
    );

    createFile(
      path.join(tempDir, 'apps/server/src/database/prisma.service.ts'),
      'export class PrismaService {}',
    );

    createFile(
      path.join(tempDir, 'apps/server/package.json'),
      JSON.stringify({ name: 'server' }),
    );
    createFile(
      path.join(tempDir, 'apps/web/package.json'),
      JSON.stringify({ name: 'web' }),
    );
    createFile(
      path.join(tempDir, 'packages/shared/package.json'),
      JSON.stringify({ name: 'shared' }),
    );
    createFile(
      path.join(tempDir, 'package.json'),
      JSON.stringify({ name: 'root' }),
    );

    const result = evaluateWithTenantTxGuard({ rootDir: tempDir });

    expect(result.ok).toBe(false);
    expect(typeof result.summary).toBe('string');
    expect(result.summary).toContain('ok=false');
    expect(result.summary).toContain('hint=');
    expect(result.directPrismaImports).toEqual([
      'apps/server/src/database/index.ts',
      'apps/server/src/some-feature/bar.ts',
      'apps/server/src/some-feature/foo.ts',
    ]);
  });

  it('fails when backend uses PrismaClient outside allowlist', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codemap-guard-pc-'));

    createFile(
      path.join(tempDir, 'apps/server/src/some-feature/foo.ts'),
      "import { PrismaClient } from '@prisma/client/edge';\nconst prisma = new PrismaClient();\nexport const foo = prisma;",
    );
    createFile(
      path.join(tempDir, 'apps/server/src/database/prisma.service.ts'),
      'export class PrismaService {}',
    );
    createFile(
      path.join(tempDir, 'apps/server/package.json'),
      JSON.stringify({ name: 'server' }),
    );
    createFile(
      path.join(tempDir, 'apps/web/package.json'),
      JSON.stringify({ name: 'web' }),
    );
    createFile(
      path.join(tempDir, 'packages/shared/package.json'),
      JSON.stringify({ name: 'shared' }),
    );
    createFile(
      path.join(tempDir, 'package.json'),
      JSON.stringify({ name: 'root' }),
    );

    const result = evaluateWithTenantTxGuard({ rootDir: tempDir });

    expect(result.ok).toBe(false);
    expect(typeof result.summary).toBe('string');
    expect(result.summary).toContain('ok=false');
    expect(result.summary).toContain('hint=');
    expect(result.directPrismaClientUsages).toEqual([
      'apps/server/src/some-feature/foo.ts',
    ]);
  });

  it('fails when backend uses PRISMA_SERVICE_TOKEN outside allowlist', () => {
    const tempDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'codemap-guard-token-'),
    );

    createFile(
      path.join(tempDir, 'apps/server/src/some-feature/foo.ts'),
      "import { PRISMA_SERVICE_TOKEN } from '../database/database.constants';\nexport const foo = PRISMA_SERVICE_TOKEN;\nvoid foo;",
    );
    createFile(
      path.join(tempDir, 'apps/server/src/database/database.constants.ts'),
      "export const PRISMA_SERVICE_TOKEN = Symbol('PRISMA_SERVICE_TOKEN');",
    );
    createFile(
      path.join(tempDir, 'apps/server/src/database/prisma.service.ts'),
      'export class PrismaService {}',
    );
    createFile(
      path.join(tempDir, 'apps/server/package.json'),
      JSON.stringify({ name: 'server' }),
    );
    createFile(
      path.join(tempDir, 'apps/web/package.json'),
      JSON.stringify({ name: 'web' }),
    );
    createFile(
      path.join(tempDir, 'packages/shared/package.json'),
      JSON.stringify({ name: 'shared' }),
    );
    createFile(
      path.join(tempDir, 'package.json'),
      JSON.stringify({ name: 'root' }),
    );

    const result = evaluateWithTenantTxGuard({ rootDir: tempDir });

    expect(result.ok).toBe(false);
    expect(typeof result.summary).toBe('string');
    expect(result.summary).toContain('ok=false');
    expect(result.summary).toContain('hint=');
    expect(result.directPrismaServiceTokenUsages).toEqual([
      'apps/server/src/some-feature/foo.ts',
    ]);
  });

  it('fails when backend imports PRISMA_SERVICE_TOKEN via alias database.constants', () => {
    const tempDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'codemap-guard-token-alias-'),
    );

    createFile(
      path.join(tempDir, 'apps/server/src/some-feature/foo.ts'),
      "import { PRISMA_SERVICE_TOKEN } from '@/database/database.constants';\nexport const foo = PRISMA_SERVICE_TOKEN;\nvoid foo;",
    );
    createFile(
      path.join(tempDir, 'apps/server/src/database/database.constants.ts'),
      "export const PRISMA_SERVICE_TOKEN = Symbol('PRISMA_SERVICE_TOKEN');",
    );
    createFile(
      path.join(tempDir, 'apps/server/src/database/prisma.service.ts'),
      'export class PrismaService {}',
    );
    createFile(
      path.join(tempDir, 'apps/server/package.json'),
      JSON.stringify({ name: 'server' }),
    );
    createFile(
      path.join(tempDir, 'apps/web/package.json'),
      JSON.stringify({ name: 'web' }),
    );
    createFile(
      path.join(tempDir, 'packages/shared/package.json'),
      JSON.stringify({ name: 'shared' }),
    );
    createFile(
      path.join(tempDir, 'package.json'),
      JSON.stringify({ name: 'root' }),
    );

    const result = evaluateWithTenantTxGuard({ rootDir: tempDir });

    expect(result.ok).toBe(false);
    expect(typeof result.summary).toBe('string');
    expect(result.summary).toContain('ok=false');
    expect(result.summary).toContain('hint=');
    expect(result.directPrismaServiceTokenUsages).toEqual([
      'apps/server/src/some-feature/foo.ts',
    ]);
  });

  it('fails when backend imports PRISMA_SERVICE_TOKEN via alias barrel module', () => {
    const tempDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'codemap-guard-token-alias-barrel-'),
    );

    createFile(
      path.join(tempDir, 'apps/server/src/some-feature/foo.ts'),
      "import { PRISMA_SERVICE_TOKEN } from '@/database';\nexport const foo = PRISMA_SERVICE_TOKEN;\nvoid foo;",
    );
    createFile(
      path.join(tempDir, 'apps/server/src/database/index.ts'),
      "export * from './database.constants';",
    );

    createFile(
      path.join(tempDir, 'apps/server/src/database/database.constants.ts'),
      "export const PRISMA_SERVICE_TOKEN = Symbol('PRISMA_SERVICE_TOKEN');",
    );
    createFile(
      path.join(tempDir, 'apps/server/src/database/prisma.service.ts'),
      'export class PrismaService {}',
    );
    createFile(
      path.join(tempDir, 'apps/server/package.json'),
      JSON.stringify({ name: 'server' }),
    );
    createFile(
      path.join(tempDir, 'apps/web/package.json'),
      JSON.stringify({ name: 'web' }),
    );
    createFile(
      path.join(tempDir, 'packages/shared/package.json'),
      JSON.stringify({ name: 'shared' }),
    );
    createFile(
      path.join(tempDir, 'package.json'),
      JSON.stringify({ name: 'root' }),
    );

    const result = evaluateWithTenantTxGuard({ rootDir: tempDir });

    expect(result.ok).toBe(false);
    expect(typeof result.summary).toBe('string');
    expect(result.summary).toContain('ok=false');
    expect(result.summary).toContain('hint=');
    expect(result.directPrismaServiceTokenUsages).toEqual([
      'apps/server/src/some-feature/foo.ts',
    ]);
  });

  it('fails when backend imports PRISMA_SERVICE_TOKEN via barrel re-export', () => {
    const tempDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'codemap-guard-token-barrel-'),
    );

    createFile(
      path.join(tempDir, 'apps/server/src/some-feature/foo.ts'),
      "import { PRISMA_SERVICE_TOKEN } from '../database';\nexport const foo = PRISMA_SERVICE_TOKEN;\nvoid foo;",
    );
    createFile(
      path.join(tempDir, 'apps/server/src/database/index.ts'),
      "export * from './database.constants';",
    );
    createFile(
      path.join(tempDir, 'apps/server/src/database/database.constants.ts'),
      "export const PRISMA_SERVICE_TOKEN = Symbol('PRISMA_SERVICE_TOKEN');",
    );
    createFile(
      path.join(tempDir, 'apps/server/src/database/prisma.service.ts'),
      'export class PrismaService {}',
    );
    createFile(
      path.join(tempDir, 'apps/server/package.json'),
      JSON.stringify({ name: 'server' }),
    );
    createFile(
      path.join(tempDir, 'apps/web/package.json'),
      JSON.stringify({ name: 'web' }),
    );
    createFile(
      path.join(tempDir, 'packages/shared/package.json'),
      JSON.stringify({ name: 'shared' }),
    );
    createFile(
      path.join(tempDir, 'package.json'),
      JSON.stringify({ name: 'root' }),
    );

    const result = evaluateWithTenantTxGuard({ rootDir: tempDir });

    expect(result.ok).toBe(false);
    expect(typeof result.summary).toBe('string');
    expect(result.summary).toContain('ok=false');
    expect(result.summary).toContain('hint=');
    expect(result.directPrismaServiceTokenUsages).toEqual([
      'apps/server/src/some-feature/foo.ts',
    ]);
  });

  it('fails when backend resolves PRISMA_SERVICE_TOKEN via string index from barrel module', () => {
    const tempDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'codemap-guard-token-index-'),
    );

    createFile(
      path.join(tempDir, 'apps/server/src/some-feature/foo.ts'),
      "import * as db from '../database';\nconst token = db['PRISMA_SERVICE_TOKEN'];\nexport const foo = token;\nvoid foo;",
    );
    createFile(
      path.join(tempDir, 'apps/server/src/database/index.ts'),
      "export * from './database.constants';",
    );
    createFile(
      path.join(tempDir, 'apps/server/src/database/database.constants.ts'),
      "export const PRISMA_SERVICE_TOKEN = Symbol('PRISMA_SERVICE_TOKEN');",
    );
    createFile(
      path.join(tempDir, 'apps/server/src/database/prisma.service.ts'),
      'export class PrismaService {}',
    );
    createFile(
      path.join(tempDir, 'apps/server/package.json'),
      JSON.stringify({ name: 'server' }),
    );
    createFile(
      path.join(tempDir, 'apps/web/package.json'),
      JSON.stringify({ name: 'web' }),
    );
    createFile(
      path.join(tempDir, 'packages/shared/package.json'),
      JSON.stringify({ name: 'shared' }),
    );
    createFile(
      path.join(tempDir, 'package.json'),
      JSON.stringify({ name: 'root' }),
    );

    const result = evaluateWithTenantTxGuard({ rootDir: tempDir });

    expect(result.ok).toBe(false);
    expect(typeof result.summary).toBe('string');
    expect(result.summary).toContain('ok=false');
    expect(result.summary).toContain('hint=');
    expect(result.directPrismaServiceTokenUsages).toEqual([
      'apps/server/src/some-feature/foo.ts',
    ]);
  });

  it('fails when backend requires PRISMA_SERVICE_TOKEN via alias database.constants', () => {
    const tempDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'codemap-guard-token-require-alias-'),
    );

    createFile(
      path.join(tempDir, 'apps/server/src/some-feature/foo.ts'),
      "const { PRISMA_SERVICE_TOKEN } = require('@/database/database.constants');\nexport const foo = PRISMA_SERVICE_TOKEN;\nvoid foo;",
    );
    createFile(
      path.join(tempDir, 'apps/server/src/database/database.constants.ts'),
      "export const PRISMA_SERVICE_TOKEN = Symbol('PRISMA_SERVICE_TOKEN');",
    );
    createFile(
      path.join(tempDir, 'apps/server/src/database/prisma.service.ts'),
      'export class PrismaService {}',
    );
    createFile(
      path.join(tempDir, 'apps/server/package.json'),
      JSON.stringify({ name: 'server' }),
    );
    createFile(
      path.join(tempDir, 'apps/web/package.json'),
      JSON.stringify({ name: 'web' }),
    );
    createFile(
      path.join(tempDir, 'packages/shared/package.json'),
      JSON.stringify({ name: 'shared' }),
    );
    createFile(
      path.join(tempDir, 'package.json'),
      JSON.stringify({ name: 'root' }),
    );

    const result = evaluateWithTenantTxGuard({ rootDir: tempDir });

    expect(result.ok).toBe(false);
    expect(typeof result.summary).toBe('string');
    expect(result.summary).toContain('ok=false');
    expect(result.summary).toContain('hint=');
    expect(result.directPrismaServiceTokenUsages).toEqual([
      'apps/server/src/some-feature/foo.ts',
    ]);
  });

  it('passes when only allowlisted files import PrismaService', () => {
    const tempDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'codemap-guard-allow-'),
    );

    createFile(
      path.join(tempDir, 'apps/server/src/database/prisma.service.ts'),
      'export class PrismaService {}',
    );
    createFile(
      path.join(tempDir, 'apps/server/src/database/platform-db.service.ts'),
      "import type { PrismaService } from './prisma.service';\nexport const x = 1;\nvoid x;\nvoid PrismaService;",
    );
    createFile(
      path.join(
        tempDir,
        'apps/server/src/modules/masterdata/infrastructure/prisma-tenant-id.resolver.ts',
      ),
      "import type { PrismaService } from '../../../database/prisma.service';\nexport const x = 1;\nvoid x;\nvoid PrismaService;",
    );
    createFile(
      path.join(tempDir, 'apps/server/package.json'),
      JSON.stringify({ name: 'server' }),
    );
    createFile(
      path.join(tempDir, 'apps/web/package.json'),
      JSON.stringify({ name: 'web' }),
    );
    createFile(
      path.join(tempDir, 'packages/shared/package.json'),
      JSON.stringify({ name: 'shared' }),
    );
    createFile(
      path.join(tempDir, 'package.json'),
      JSON.stringify({ name: 'root' }),
    );

    const result = evaluateWithTenantTxGuard({ rootDir: tempDir });

    expect(result.ok).toBe(true);
    expect(result.directPrismaImports).toEqual([]);
  });
});
