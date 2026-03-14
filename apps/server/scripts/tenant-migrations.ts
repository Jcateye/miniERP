import { Prisma, PrismaClient } from '@prisma/client';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { z } from 'zod';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const SERVER_ROOT = resolve(SCRIPT_DIR, '..');
const PRISMA_SCHEMA_PATH = resolve(SERVER_ROOT, 'prisma', 'schema.prisma');
const REPO_ROOT = resolve(SERVER_ROOT, '..', '..');

const PRISMA_BIN_NAME = process.platform === 'win32' ? 'prisma.cmd' : 'prisma';

function resolvePrismaBin(): string {
  const candidates = [
    resolve(REPO_ROOT, 'node_modules', '.bin', PRISMA_BIN_NAME),
    resolve(SERVER_ROOT, 'node_modules', '.bin', PRISMA_BIN_NAME),
  ];

  const found = candidates.find((candidate) => existsSync(candidate));
  return found ?? candidates[0]!;
}

const PRISMA_BIN = resolvePrismaBin();

const POSTGRES_IDENTIFIER_MAX_LENGTH = 63;
const DEFAULT_TENANT_SCHEMA_PREFIX = 'tenant_';

const SchemaNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(POSTGRES_IDENTIFIER_MAX_LENGTH)
  .regex(/^[A-Za-z_][A-Za-z0-9_]*$/u);

function writeLine(line: string): void {
  process.stdout.write(`${line}\n`);
}

function writeError(line: string): void {
  process.stderr.write(`${line}\n`);
}

function normalizeTenantId(tenantId: string): string {
  const normalized = tenantId.trim();
  if (normalized.length === 0) {
    throw new Error('tenantId is required');
  }
  return normalized;
}

function sanitizeSchemaSegment(value: string): string {
  return value.replace(/[^A-Za-z0-9_]/gu, '_');
}

function defaultSchemaNameForTenantId(tenantId: string): string {
  const normalized = normalizeTenantId(tenantId);
  const safe = sanitizeSchemaSegment(normalized);

  const maxSegmentLength = Math.max(
    0,
    POSTGRES_IDENTIFIER_MAX_LENGTH - DEFAULT_TENANT_SCHEMA_PREFIX.length,
  );
  const segment = safe.slice(0, maxSegmentLength);

  return SchemaNameSchema.parse(`${DEFAULT_TENANT_SCHEMA_PREFIX}${segment}`);
}

function quoteIdentifier(identifier: string): string {
  // identifier 已经过正则校验，这里再做一次 SQL identifier 的双引号转义。
  return `"${identifier.replaceAll('"', '""')}"`;
}

function withSchemaInDatabaseUrl(databaseUrl: string, schemaName: string): string {
  const url = new URL(databaseUrl);
  url.searchParams.set('schema', schemaName);
  return url.toString();
}

function getRequiredDatabaseUrl(): string {
  const value = process.env.DATABASE_URL;
  if (!value || value.trim().length === 0) {
    throw new Error('DATABASE_URL is required');
  }
  return value;
}

function createPublicPrismaClient(databaseUrl: string): PrismaClient {
  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });
}

async function ensureTenantsRegistry(prisma: PrismaClient): Promise<void> {
  // 仅用于平台 registry：不纳入 Prisma schema，避免影响业务模型。
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS public.tenants (
      tenant_id TEXT PRIMARY KEY,
      schema_name TEXT NOT NULL UNIQUE,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE public.tenants
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE public.tenants
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE public.tenants
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
  `);
}

async function ensureSchemaExists(prisma: PrismaClient, schemaName: string): Promise<void> {
  const validated = SchemaNameSchema.parse(schemaName);
  await prisma.$executeRawUnsafe(
    `CREATE SCHEMA IF NOT EXISTS ${quoteIdentifier(validated)};`,
  );
}

async function upsertTenantRegistryRow(
  prisma: PrismaClient,
  input: {
    readonly tenantId: string;
    readonly schemaName: string;
    readonly isActive: boolean;
  },
): Promise<void> {
  await prisma.$executeRaw(
    Prisma.sql`
      INSERT INTO public.tenants (tenant_id, schema_name, is_active)
      VALUES (${input.tenantId}, ${input.schemaName}, ${input.isActive})
      ON CONFLICT (tenant_id)
      DO UPDATE SET
        schema_name = EXCLUDED.schema_name,
        is_active = EXCLUDED.is_active,
        updated_at = now();
    `,
  );
}

type ListedTenant = {
  readonly tenant_id: string;
  readonly schema_name: string;
};

type TenantRegistryRow = {
  readonly tenant_id: string;
  readonly schema_name: string;
  readonly is_active: boolean;
};

async function getTenantRegistryByTenantId(
  prisma: PrismaClient,
  tenantId: string,
): Promise<TenantRegistryRow | null> {
  const rows = await prisma.$queryRaw<ReadonlyArray<TenantRegistryRow>>(
    Prisma.sql`
      SELECT tenant_id, schema_name, is_active
      FROM public.tenants
      WHERE tenant_id = ${tenantId}
      LIMIT 1;
    `,
  );

  const row = rows[0];
  if (!row) {
    return null;
  }

  return {
    tenant_id: row.tenant_id,
    schema_name: SchemaNameSchema.parse(row.schema_name),
    is_active: row.is_active,
  };
}

async function getTenantRegistryBySchemaName(
  prisma: PrismaClient,
  schemaName: string,
): Promise<TenantRegistryRow | null> {
  const rows = await prisma.$queryRaw<ReadonlyArray<TenantRegistryRow>>(
    Prisma.sql`
      SELECT tenant_id, schema_name, is_active
      FROM public.tenants
      WHERE schema_name = ${schemaName}
      LIMIT 1;
    `,
  );

  const row = rows[0];
  if (!row) {
    return null;
  }

  return {
    tenant_id: row.tenant_id,
    schema_name: SchemaNameSchema.parse(row.schema_name),
    is_active: row.is_active,
  };
}

async function listActiveTenants(
  prisma: PrismaClient,
): Promise<ReadonlyArray<ListedTenant>> {
  const rows = await prisma.$queryRaw<
    ReadonlyArray<{
      readonly tenant_id: string;
      readonly schema_name: string;
    }>
  >(Prisma.sql`
    SELECT tenant_id, schema_name
    FROM public.tenants
    WHERE is_active = true
    ORDER BY tenant_id;
  `);

  return rows.map((row) => {
    try {
      return {
        tenant_id: row.tenant_id,
        schema_name: SchemaNameSchema.parse(row.schema_name),
      };
    } catch (error: unknown) {
      throw new Error(
        [
          'INVALID_TENANT_REGISTRY_ROW: public.tenants 存在非法 schema_name。',
          `tenant_id=${row.tenant_id}`,
          `schema_name=${row.schema_name}`,
          String(error),
        ].join('\n'),
      );
    }
  });
}

function redactSensitive(text: string): string {
  return text.replace(
    /(postgres(?:ql)?):\/\/([^:\s]+):([^@\s]+)@/giu,
    '$1://$2:[REDACTED]@',
  );
}

async function runPrismaMigrateDeploy(options: {
  readonly schemaName: string;
  readonly databaseUrl: string;
}): Promise<void> {
  const tenantDatabaseUrl = withSchemaInDatabaseUrl(
    options.databaseUrl,
    options.schemaName,
  );

  const result = spawnSync(
    PRISMA_BIN,
    ['migrate', 'deploy', '--schema', PRISMA_SCHEMA_PATH],
    {
      cwd: SERVER_ROOT,
      encoding: 'utf8',
      env: {
        ...process.env,
        DATABASE_URL: tenantDatabaseUrl,
      },
    },
  );

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const combined = redactSensitive(
      [result.stdout, result.stderr].filter(Boolean).join('\n'),
    );

    if (/was modified after it was applied/iu.test(combined)) {
      throw new Error(
        [
          'CHECKSUM_MISMATCH: migration checksum 发生变化，疑似迁移文件被篡改。',
          `schema=${options.schemaName}`,
          combined,
        ].join('\n'),
      );
    }

    throw new Error(
      [
        'PRISMA_MIGRATE_FAILED: prisma migrate deploy 执行失败。',
        `schema=${options.schemaName}`,
        combined,
      ].join('\n'),
    );
  }

  // prisma migrate deploy 在无 pending migrations 时不会校验 checksum。
  // 为了防篡改，这里额外对已应用 migrations 做一次 checksum 自检。
  await validateAppliedMigrationsChecksum({
    schemaName: options.schemaName,
    databaseUrl: options.databaseUrl,
  });
}

type AppliedMigrationChecksumRow = {
  readonly migration_name: string;
  readonly checksum: string;
};

const MIGRATIONS_DIR = resolve(SERVER_ROOT, 'prisma', 'migrations');

function computeSha256Hex(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

function readMigrationSql(migrationDir: string): string {
  return readFileSync(resolve(MIGRATIONS_DIR, migrationDir, 'migration.sql'), 'utf8');
}

function listMigrationDirs(): ReadonlyArray<string> {
  return readdirSync(MIGRATIONS_DIR)
    .filter((name) => /^[0-9]{14}_/u.test(name))
    .sort();
}

function getExpectedMigrationChecksums(): ReadonlyMap<string, string> {
  const result = new Map<string, string>();

  for (const dir of listMigrationDirs()) {
    const sql = readMigrationSql(dir);
    result.set(dir, computeSha256Hex(Buffer.from(sql, 'utf8')));
  }

  return result;
}

async function validateAppliedMigrationsChecksum(options: {
  readonly schemaName: string;
  readonly databaseUrl: string;
}): Promise<void> {
  const tenantDatabaseUrl = withSchemaInDatabaseUrl(
    options.databaseUrl,
    options.schemaName,
  );

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: tenantDatabaseUrl,
      },
    },
  });

  try {
    await prisma.$connect();

    const appliedRows = await prisma.$queryRaw<
      ReadonlyArray<AppliedMigrationChecksumRow>
    >(Prisma.sql`
      SELECT migration_name, checksum
      FROM "_prisma_migrations"
      ORDER BY started_at ASC;
    `);

    const expected = getExpectedMigrationChecksums();

    for (const row of appliedRows) {
      const expectedChecksum = expected.get(row.migration_name);
      if (!expectedChecksum) {
        continue;
      }

      if (row.checksum !== expectedChecksum) {
        throw new Error(
          [
            'CHECKSUM_MISMATCH: migration checksum 发生变化，疑似迁移文件被篡改。',
            `schema=${options.schemaName}`,
            `migration=${row.migration_name}`,
            `expected=${expectedChecksum}`,
            `actual=${row.checksum}`,
          ].join('\n'),
        );
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}


function tenantCodeForRegistryTenantId(tenantId: string): string {
  const normalized = tenantId.trim();
  if (normalized.length === 0) {
    throw new Error('tenantId is required');
  }

  return normalized.toUpperCase().startsWith('TENANT-')
    ? normalized
    : `TENANT-${normalized}`;
}

async function initializeDefaultAdminBindings(input: {
  readonly tenantId: string;
  readonly schemaName: string;
}): Promise<void> {
  const databaseUrl = getRequiredDatabaseUrl();
  const tenantDatabaseUrl = withSchemaInDatabaseUrl(databaseUrl, input.schemaName);
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: tenantDatabaseUrl,
      },
    },
  });

  try {
    await prisma.$connect();

    const tenantCode = tenantCodeForRegistryTenantId(input.tenantId);

    const tenant = await prisma.tenant.upsert({
      where: {
        code: tenantCode,
      },
      update: {
        name: tenantCode,
        updatedBy: 'tenant-init',
      },
      create: {
        code: tenantCode,
        name: tenantCode,
        createdBy: 'tenant-init',
        updatedBy: 'tenant-init',
      },
    });

    const permission = await prisma.permission.upsert({
      where: { code: 'erp:*' },
      update: { name: 'ERP Full Access' },
      create: {
        code: 'erp:*',
        name: 'ERP Full Access',
      },
    });

    const role = await prisma.role.upsert({
      where: {
        tenantId_code: {
          tenantId: tenant.id,
          code: 'admin',
        },
      },
      update: {
        name: 'Admin',
        updatedBy: 'tenant-init',
      },
      create: {
        tenantId: tenant.id,
        code: 'admin',
        name: 'Admin',
        createdBy: 'tenant-init',
        updatedBy: 'tenant-init',
      },
    });

    await prisma.rolePermission.upsert({
      where: {
        tenantId_roleId_permissionId: {
          tenantId: tenant.id,
          roleId: role.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        tenantId: tenant.id,
        roleId: role.id,
        permissionId: permission.id,
        createdBy: 'tenant-init',
      },
    });

    const adminUser = await prisma.user.findFirst({
      where: {
        tenantId: tenant.id,
        username: 'admin',
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!adminUser) {
      return;
    }

    await prisma.userRole.upsert({
      where: {
        tenantId_userId_roleId: {
          tenantId: tenant.id,
          userId: adminUser.id,
          roleId: role.id,
        },
      },
      update: {},
      create: {
        tenantId: tenant.id,
        userId: adminUser.id,
        roleId: role.id,
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

async function migrateAllTenants(): Promise<void> {
  const databaseUrl = getRequiredDatabaseUrl();
  const prisma = createPublicPrismaClient(databaseUrl);

  try {
    await ensureTenantsRegistry(prisma);
    const tenants = await listActiveTenants(prisma);

    if (tenants.length === 0) {
      writeLine('No active tenants found in public.tenants. Nothing to migrate.');
      return;
    }

    writeLine(`Found ${tenants.length} tenants. Start migrations...`);

    for (const tenant of tenants) {
      writeLine(`- tenant=${tenant.tenant_id} schema=${tenant.schema_name}`);
      await ensureSchemaExists(prisma, tenant.schema_name);
      await runPrismaMigrateDeploy({ schemaName: tenant.schema_name, databaseUrl });
    }

    writeLine('All tenant migrations finished.');
  } finally {
    await prisma.$disconnect();
  }
}

async function tenantInit(args: {
  readonly tenantId: string;
  readonly schemaName: string;
}): Promise<void> {
  const databaseUrl = getRequiredDatabaseUrl();
  const prisma = createPublicPrismaClient(databaseUrl);

  try {
    await ensureTenantsRegistry(prisma);

    const existingByTenant = await getTenantRegistryByTenantId(prisma, args.tenantId);
    if (existingByTenant?.is_active) {
      throw new Error(
        [
          'TENANT_ALREADY_ACTIVE: 该 tenant 已处于 active 状态，禁止重复执行 tenant-init。',
          '请使用 migrate-all-tenants。',
          `tenant=${existingByTenant.tenant_id}`,
          `schema=${existingByTenant.schema_name}`,
        ].join('\n'),
      );
    }

    if (existingByTenant && existingByTenant.schema_name !== args.schemaName) {
      throw new Error(
        [
          'TENANT_SCHEMA_MISMATCH: tenant 已存在但 schema 不一致，拒绝覆盖映射。',
          `tenant=${existingByTenant.tenant_id}`,
          `existing_schema=${existingByTenant.schema_name}`,
          `requested_schema=${args.schemaName}`,
        ].join('\n'),
      );
    }

    const existingBySchema = await getTenantRegistryBySchemaName(prisma, args.schemaName);
    if (existingBySchema && existingBySchema.tenant_id !== args.tenantId) {
      throw new Error(
        [
          'SCHEMA_ALREADY_IN_USE: schema 已被其他 tenant 占用，拒绝绑定。',
          `schema=${args.schemaName}`,
          `owner_tenant=${existingBySchema.tenant_id}`,
          `requested_tenant=${args.tenantId}`,
        ].join('\n'),
      );
    }

    await ensureSchemaExists(prisma, args.schemaName);

    writeLine(
      `Running migrations for tenant=${args.tenantId} schema=${args.schemaName}...`,
    );

    await upsertTenantRegistryRow(prisma, {
      tenantId: args.tenantId,
      schemaName: args.schemaName,
      isActive: false,
    });

    await runPrismaMigrateDeploy({ schemaName: args.schemaName, databaseUrl });

    await upsertTenantRegistryRow(prisma, {
      tenantId: args.tenantId,
      schemaName: args.schemaName,
      isActive: true,
    });

    await initializeDefaultAdminBindings({
      tenantId: args.tenantId,
      schemaName: args.schemaName,
    });

    writeLine(
      `Tenant init finished: tenant=${args.tenantId} schema=${args.schemaName}`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

type ParsedArgs =
  | {
      readonly command: 'migrate-all-tenants';
    }
  | {
      readonly command: 'tenant-init';
      readonly tenantId: string;
      readonly schemaName: string;
    };

function parseArgs(argv: readonly string[]): ParsedArgs {
  const [command, ...rest] = argv;

  if (command === 'migrate-all-tenants') {
    return { command };
  }

  if (command === 'tenant-init') {
    const tenantId = rest[0];
    if (typeof tenantId !== 'string') {
      throw new Error('Usage: tenant-init <tenantId> [--schema <schemaName>]');
    }

    const schemaFlagIndex = rest.findIndex((value) => value === '--schema');
    const schemaName =
      schemaFlagIndex >= 0
        ? (() => {
            const value = rest[schemaFlagIndex + 1];
            if (typeof value !== 'string') {
              throw new Error('Missing value for --schema');
            }
            return SchemaNameSchema.parse(value);
          })()
        : defaultSchemaNameForTenantId(tenantId);

    return {
      command,
      tenantId: normalizeTenantId(tenantId),
      schemaName,
    };
  }

  throw new Error(
    [
      'Unknown command.',
      'Supported commands:',
      '- migrate-all-tenants',
      '- tenant-init <tenantId> [--schema <schemaName>]',
    ].join('\n'),
  );
}

async function main(): Promise<void> {
  const parsed = parseArgs(process.argv.slice(2));

  if (parsed.command === 'migrate-all-tenants') {
    await migrateAllTenants();
    return;
  }

  await tenantInit({
    tenantId: parsed.tenantId,
    schemaName: parsed.schemaName,
  });
}

main().catch((error: unknown) => {
  if (error instanceof Error && error.stack) {
    writeError(error.stack);
  } else {
    writeError(String(error));
  }
  process.exit(1);
});
