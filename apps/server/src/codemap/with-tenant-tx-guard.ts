import { buildSourceGraph } from './scan-source-graph';

export interface WithTenantTxGuardOptions {
  readonly rootDir: string;
}

export interface WithTenantTxGuardResult {
  readonly ok: boolean;
  readonly directPrismaImports: readonly string[];
  readonly directPrismaClientUsages: readonly string[];
  readonly directPrismaServiceTokenUsages: readonly string[];
  readonly summary: string;
}

const ALLOWED_DIRECT_PRISMA_IMPORTS = new Set([
  // PrismaService 本身
  'apps/server/src/database/prisma.service.ts',
  // platform-db service 需要持有 PrismaService 来创建 platform db
  'apps/server/src/database/platform-db.service.ts',
  // DatabaseModule 提供 PrismaService provider/exports
  'apps/server/src/database/database.module.ts',
  // tenant resolver 为了让类型签名兼容（Pick<PrismaService,'tenant'>）
  'apps/server/src/modules/masterdata/infrastructure/prisma-tenant-id.resolver.ts',
]);

const ALLOWED_DIRECT_PRISMA_CLIENT_USAGES = new Set([
  // PrismaService 本身
  'apps/server/src/database/prisma.service.ts',
  // integration specs（会直接 new PrismaClient 做平台 schema/registry 准备）
  'apps/server/src/database/platform-db.integration.spec.ts',
  'apps/server/src/common/iam/rbac/granted-permissions.store.integration.spec.ts',
]);

const ALLOWED_PRISMA_SERVICE_TOKEN_USAGES = new Set([
  // DatabaseModule 负责绑定 provider，本身必须使用该 token。
  'apps/server/src/database/database.module.ts',
  // constants 本身必须声明 token。
  'apps/server/src/database/database.constants.ts',
  // DocumentsService 在 production 下 fail-closed，需要能探测 persisted store 是否注入。
  'apps/server/src/modules/documents/services/documents.service.ts',
]);

/**
 * Phase1 guard:
 * - 业务侧不得直接 import PrismaService（应通过 PlatformDbService.withTenantTx + tx）
 * - 仅允许平台层极少数文件直接引用 PrismaService
 */
export function evaluateWithTenantTxGuard(
  options: WithTenantTxGuardOptions,
): WithTenantTxGuardResult {
  const graph = buildSourceGraph(options.rootDir);

  const directPrismaImports = graph.nodes
    .filter((node) => node.scope === 'backend')
    .filter((node) => {
      const importsPrismaService =
        node.internalImports.includes(
          'apps/server/src/database/prisma.service.ts',
        ) ||
        node.externalImports.includes(
          'apps/server/src/database/prisma.service.ts',
        );

      const importsDatabaseBarrel =
        node.internalImports.includes('apps/server/src/database/index.ts') ||
        node.externalImports.includes('apps/server/src/database/index.ts');

      return importsPrismaService || importsDatabaseBarrel;
    })
    .map((node) => node.filePath)
    .filter((filePath) => !ALLOWED_DIRECT_PRISMA_IMPORTS.has(filePath));

  const directPrismaClientUsages = graph.nodes
    .filter((node) => node.scope === 'backend')
    .filter((node) => node.hasPrismaClientUsage)
    .map((node) => node.filePath)
    .filter((filePath) => !ALLOWED_DIRECT_PRISMA_CLIENT_USAGES.has(filePath));

  const directPrismaServiceTokenUsages = graph.nodes
    .filter((node) => node.scope === 'backend')
    .filter((node) => node.hasPrismaServiceTokenUsage)
    .map((node) => node.filePath)
    .filter((filePath) => !ALLOWED_PRISMA_SERVICE_TOKEN_USAGES.has(filePath));

  const ok =
    directPrismaImports.length === 0 &&
    directPrismaClientUsages.length === 0 &&
    directPrismaServiceTokenUsages.length === 0;

  function pickSample(items: readonly string[], limit = 10): string {
    const sample = items.slice(0, limit);
    const suffix =
      items.length > limit ? ` (+${items.length - limit} more)` : '';
    return sample.length === 0 ? '-' : `${sample.join(', ')}${suffix}`;
  }

  const summaryLines = [
    `ok=${ok}`,
    `directPrismaImports=${directPrismaImports.length}`,
    `directPrismaClientUsages=${directPrismaClientUsages.length}`,
    `directPrismaServiceTokenUsages=${directPrismaServiceTokenUsages.length}`,
    'hint=业务侧禁止直接使用 PrismaService/PrismaClient/PRISMA_SERVICE_TOKEN；请改用 PlatformDbService.withTenantTx(tx => ...)',
    `directPrismaImports.sample=${pickSample(directPrismaImports)}`,
    `directPrismaClientUsages.sample=${pickSample(directPrismaClientUsages)}`,
    `directPrismaServiceTokenUsages.sample=${pickSample(directPrismaServiceTokenUsages)}`,
  ];

  return {
    ok,
    directPrismaImports,
    directPrismaClientUsages,
    directPrismaServiceTokenUsages,
    summary: summaryLines.join('\n'),
  };
}
