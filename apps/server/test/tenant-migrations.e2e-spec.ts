import { Prisma, PrismaClient } from '@prisma/client';
import { spawnSync } from 'node:child_process';

jest.setTimeout(120_000);

const describeWhenEnabled =
  process.env.RUN_TENANT_MIGRATIONS_E2E === '1' ? describe : describe.skip;

const SERVER_ROOT = `${__dirname}/..`;
const SCRIPT_PATH = `${SERVER_ROOT}/scripts/tenant-migrations.ts`;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`${name} is required for tenant-migrations e2e test`);
  }
  return value;
}

function withSchemaInDatabaseUrl(
  databaseUrl: string,
  schemaName: string,
): string {
  const url = new URL(databaseUrl);
  url.searchParams.set('schema', schemaName);
  return url.toString();
}

function runCli(args: readonly string[], env: Record<string, string>): void {
  const result = spawnSync('bun', [SCRIPT_PATH, ...args], {
    cwd: SERVER_ROOT,
    encoding: 'utf8',
    env: {
      ...process.env,
      ...env,
    },
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(
      [
        `CLI failed: bun ${[SCRIPT_PATH, ...args].join(' ')}`,
        result.stdout,
        result.stderr,
      ]
        .filter(Boolean)
        .join('\n'),
    );
  }
}

describeWhenEnabled('tenant migrations runner (e2e)', () => {
  const databaseUrl = requireEnv('DATABASE_URL');
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

  const tenantIds = ['e2e_tenant_1', 'e2e_tenant_2', 'e2e_tenant_3'] as const;
  const schemaNames = tenantIds.map(
    (tenantId) => `tenant_${tenantId}` as const,
  );

  beforeAll(async () => {
    await prisma.$connect();

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS public.tenants (
        tenant_id TEXT PRIMARY KEY,
        schema_name TEXT NOT NULL UNIQUE,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await prisma.$executeRawUnsafe(
      `DELETE FROM public.tenants WHERE tenant_id LIKE 'e2e_tenant_%';`,
    );

    for (let i = 0; i < tenantIds.length; i += 1) {
      const tenantId = tenantIds[i];
      const schemaName = schemaNames[i];

      await prisma.$executeRawUnsafe(
        `DROP SCHEMA IF EXISTS "${schemaName}" CASCADE;`,
      );

      await prisma.$executeRaw(
        Prisma.sql`
          INSERT INTO public.tenants (tenant_id, schema_name, is_active)
          VALUES (${tenantId}, ${schemaName}, true);
        `,
      );
    }
  });

  afterAll(async () => {
    try {
      for (const schemaName of schemaNames) {
        await prisma.$executeRawUnsafe(
          `DROP SCHEMA IF EXISTS "${schemaName}" CASCADE;`,
        );
      }
      await prisma.$executeRawUnsafe(
        `DELETE FROM public.tenants WHERE tenant_id LIKE 'e2e_tenant_%';`,
      );
    } finally {
      await prisma.$disconnect();
    }
  });

  it('migrates all tenants, keeps versions aligned, and is idempotent on re-run', async () => {
    runCli(['migrate-all-tenants'], { DATABASE_URL: databaseUrl });

    const migratedOnce = await prisma.$queryRaw<
      ReadonlyArray<{ readonly schema_name: string }>
    >(Prisma.sql`
      SELECT schema_name
      FROM public.tenants
      WHERE tenant_id LIKE 'e2e_tenant_%'
      ORDER BY tenant_id;
    `);
    expect(migratedOnce.map((row) => row.schema_name)).toEqual(schemaNames);

    const snapshots = await Promise.all(
      schemaNames.map(async (schemaName) => {
        const tenantDbUrl = withSchemaInDatabaseUrl(databaseUrl, schemaName);
        const tenantPrisma = new PrismaClient({
          datasources: {
            db: {
              url: tenantDbUrl,
            },
          },
        });

        await tenantPrisma.$connect();
        try {
          return await tenantPrisma.$queryRaw<
            ReadonlyArray<{
              readonly migration_name: string;
              readonly checksum: string;
            }>
          >(Prisma.sql`
            SELECT migration_name, checksum
            FROM "_prisma_migrations"
            ORDER BY started_at ASC;
          `);
        } finally {
          await tenantPrisma.$disconnect();
        }
      }),
    );

    // 版本一致：各 tenant schema 应应用同一套 migrations（migration_name + checksum）
    expect(snapshots).toHaveLength(3);
    expect(snapshots[0]).toEqual(snapshots[1]);
    expect(snapshots[1]).toEqual(snapshots[2]);

    // 幂等：重复执行不应失败，且 migrations 列表不应变化
    runCli(['migrate-all-tenants'], { DATABASE_URL: databaseUrl });

    const snapshotsAfter = await Promise.all(
      schemaNames.map(async (schemaName) => {
        const tenantDbUrl = withSchemaInDatabaseUrl(databaseUrl, schemaName);
        const tenantPrisma = new PrismaClient({
          datasources: {
            db: {
              url: tenantDbUrl,
            },
          },
        });

        await tenantPrisma.$connect();
        try {
          return await tenantPrisma.$queryRaw<
            ReadonlyArray<{
              readonly migration_name: string;
              readonly checksum: string;
            }>
          >(Prisma.sql`
            SELECT migration_name, checksum
            FROM "_prisma_migrations"
            ORDER BY started_at ASC;
          `);
        } finally {
          await tenantPrisma.$disconnect();
        }
      }),
    );

    expect(snapshotsAfter[0]).toEqual(snapshots[0]);
    expect(snapshotsAfter[1]).toEqual(snapshots[1]);
    expect(snapshotsAfter[2]).toEqual(snapshots[2]);
  });

  it('detects checksum mismatch after migration tamper', async () => {
    const schemaName = schemaNames[0];

    // Ensure migrated
    runCli(['migrate-all-tenants'], { DATABASE_URL: databaseUrl });

    // Tamper checksum inside tenant schema
    const tenantDbUrl = withSchemaInDatabaseUrl(databaseUrl, schemaName);
    const tenantPrisma = new PrismaClient({
      datasources: {
        db: {
          url: tenantDbUrl,
        },
      },
    });

    await tenantPrisma.$connect();
    try {
      await tenantPrisma.$executeRawUnsafe(
        `UPDATE "_prisma_migrations" SET checksum = 'tampered' WHERE id = (SELECT id FROM "_prisma_migrations" ORDER BY started_at ASC LIMIT 1);`,
      );
    } finally {
      await tenantPrisma.$disconnect();
    }

    const result = spawnSync('bun', [SCRIPT_PATH, 'migrate-all-tenants'], {
      cwd: SERVER_ROOT,
      encoding: 'utf8',
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
      },
    });

    expect(result.status).not.toBe(0);
    expect(`${result.stdout}\n${result.stderr}`).toMatch(
      /CHECKSUM_MISMATCH|modified after it was applied/iu,
    );
  });
});
