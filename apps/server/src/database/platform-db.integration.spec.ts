import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { createPlatformDb } from '../../../../packages/platform-db/src/index';

interface RequestTenantContext {
  readonly tenantId: string;
}

interface TenantFixture {
  readonly tenantId: string;
  readonly schemaName: string;
}

interface TenantProbeRow {
  readonly tenant_label: string;
  readonly marker: string;
}

const requestTenantStorage = new AsyncLocalStorage<RequestTenantContext>();
const TEST_DATABASE_URL =
  process.env.PLATFORM_DB_TEST_DATABASE_URL ?? process.env.DATABASE_URL;

const runId = randomUUID().replace(/-/gu, '').slice(0, 12);
const tenantFixtures: TenantFixture[] = [
  { tenantId: `tenant-${runId}-a`, schemaName: `tenant_${runId}_a` },
  { tenantId: `tenant-${runId}-b`, schemaName: `tenant_${runId}_b` },
  { tenantId: `tenant-${runId}-c`, schemaName: `tenant_${runId}_c` },
];

const platformDbDatabaseDescribe = TEST_DATABASE_URL ? describe : describe.skip;

function withTenantContext<T>(
  tenantId: string,
  work: () => Promise<T>,
): Promise<T> {
  return requestTenantStorage.run({ tenantId }, work);
}

async function ensureRegistryTable(prisma: PrismaClient): Promise<void> {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS public.tenants (
      tenant_id text PRIMARY KEY,
      schema_name text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);
}

async function ensureTenantSchemaObjects(
  prisma: PrismaClient,
  fixture: TenantFixture,
): Promise<void> {
  await prisma.$executeRawUnsafe(
    `CREATE SCHEMA IF NOT EXISTS "${fixture.schemaName}"`,
  );

  await prisma.$executeRawUnsafe(
    `INSERT INTO public.tenants (tenant_id, schema_name)
     VALUES ($1, $2)
     ON CONFLICT (tenant_id) DO UPDATE
     SET schema_name = EXCLUDED.schema_name`,
    fixture.tenantId,
    fixture.schemaName,
  );

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "${fixture.schemaName}"."tenant_probe" (
      id bigserial PRIMARY KEY,
      tenant_label text NOT NULL,
      marker text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);
}

async function truncateTenantProbeTables(
  prisma: PrismaClient,
  fixtures: readonly TenantFixture[],
): Promise<void> {
  for (const fixture of fixtures) {
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE "${fixture.schemaName}"."tenant_probe" RESTART IDENTITY`,
    );
  }
}

platformDbDatabaseDescribe('platform-db tenant transaction integration', () => {
  const prisma = new PrismaClient({
    datasources: TEST_DATABASE_URL
      ? {
          db: {
            url: TEST_DATABASE_URL,
          },
        }
      : undefined,
  });
  const platformDb = createPlatformDb({
    prisma,
    getCurrentTenantId: () => {
      const context = requestTenantStorage.getStore();
      if (!context) {
        throw new Error('tenant test context is missing');
      }

      return context.tenantId;
    },
    nodeEnv: 'test',
  });

  beforeAll(async () => {
    if (!TEST_DATABASE_URL) {
      return;
    }

    await prisma.$connect();
    await ensureRegistryTable(prisma);

    for (const fixture of tenantFixtures) {
      await ensureTenantSchemaObjects(prisma, fixture);
    }
  });

  beforeEach(async () => {
    if (!TEST_DATABASE_URL) {
      return;
    }

    await truncateTenantProbeTables(prisma, tenantFixtures);
  });

  afterAll(async () => {
    if (!TEST_DATABASE_URL) {
      return;
    }

    for (const fixture of tenantFixtures) {
      await prisma.$executeRawUnsafe(
        `DROP SCHEMA IF EXISTS "${fixture.schemaName}" CASCADE`,
      );
      await prisma.$executeRawUnsafe(
        'DELETE FROM public.tenants WHERE tenant_id = $1',
        fixture.tenantId,
      );
    }
    await prisma.$disconnect();
  });

  it('keeps same-named rows invisible across three tenant schemas', async () => {
    for (const fixture of tenantFixtures) {
      await withTenantContext(fixture.tenantId, async () => {
        await platformDb.withTenantTx(async (tx) => {
          platformDb.assertInTenantTx();
          await tx.$executeRawUnsafe(
            'INSERT INTO tenant_probe (tenant_label, marker) VALUES ($1, $2)',
            fixture.tenantId,
            'shared-marker',
          );
        });
      });
    }

    for (const fixture of tenantFixtures) {
      const schema = await platformDb.getTenantSchema(fixture.tenantId);
      expect(schema).toBe(fixture.schemaName);

      const rows = await withTenantContext(fixture.tenantId, async () =>
        platformDb.withTenantTx((tx) =>
          tx.$queryRawUnsafe<TenantProbeRow[]>(
            'SELECT tenant_label, marker FROM tenant_probe ORDER BY id',
          ),
        ),
      );

      expect(rows).toEqual([
        {
          tenant_label: fixture.tenantId,
          marker: 'shared-marker',
        },
      ]);
    }
  });

  it('does not leak search_path under 100 concurrent mixed operations', async () => {
    const expectedCounts = new Map<string, number>(
      tenantFixtures.map((fixture) => [fixture.tenantId, 0]),
    );

    await Promise.all(
      Array.from({ length: 100 }, (_, index) => {
        const fixture = tenantFixtures[index % tenantFixtures.length];
        expectedCounts.set(
          fixture.tenantId,
          (expectedCounts.get(fixture.tenantId) ?? 0) + 1,
        );

        return withTenantContext(fixture.tenantId, async () =>
          platformDb.withTenantTx(async (tx) => {
            platformDb.assertInTenantTx();

            const marker = `concurrency-${index}`;
            await tx.$executeRawUnsafe(
              'INSERT INTO tenant_probe (tenant_label, marker) VALUES ($1, $2)',
              fixture.tenantId,
              marker,
            );

            const rows = await tx.$queryRawUnsafe<TenantProbeRow[]>(
              'SELECT tenant_label, marker FROM tenant_probe ORDER BY id',
            );

            if (rows.some((row) => row.tenant_label !== fixture.tenantId)) {
              throw new Error(
                `cross-tenant leak detected in ${fixture.schemaName}`,
              );
            }
          }),
        );
      }),
    );

    for (const fixture of tenantFixtures) {
      const rows = await withTenantContext(fixture.tenantId, async () =>
        platformDb.withTenantTx((tx) =>
          tx.$queryRawUnsafe<TenantProbeRow[]>(
            'SELECT tenant_label, marker FROM tenant_probe ORDER BY id',
          ),
        ),
      );

      expect(rows).toHaveLength(expectedCounts.get(fixture.tenantId) ?? 0);
      expect(rows.every((row) => row.tenant_label === fixture.tenantId)).toBe(
        true,
      );
    }
  });
});
