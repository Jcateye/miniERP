import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { createAuthorizer } from '@minierp/platform-iam';
import { createPlatformDb } from '@minierp/platform-db';
import type { PlatformDbService } from '../../../database/platform-db.service';
import { PrismaGrantedPermissionsStore } from './granted-permissions.store';

interface RequestTenantContext {
  readonly tenantId: string;
}

interface TenantFixture {
  readonly tenantId: string;
  readonly schemaName: string;
}

const requestTenantStorage = new AsyncLocalStorage<RequestTenantContext>();
const TEST_DATABASE_URL = process.env.PLATFORM_DB_TEST_DATABASE_URL;

const runId = randomUUID().replace(/-/gu, '').slice(0, 12);
const tenantFixtures: readonly TenantFixture[] = [
  { tenantId: `tenant-${runId}-a`, schemaName: `tenant_${runId}_a` },
  { tenantId: `tenant-${runId}-b`, schemaName: `tenant_${runId}_b` },
];

const integrationDescribe = TEST_DATABASE_URL ? describe : describe.skip;

function withTenantContext<T>(tenantId: string, work: () => Promise<T>): Promise<T> {
  return requestTenantStorage.run({ tenantId }, work);
}

async function ensureRegistryTable(prisma: PrismaClient): Promise<void> {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS public.tenants (
      tenant_id text PRIMARY KEY,
      schema_name text NOT NULL,
      is_active boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE public.tenants
      ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE public.tenants
      ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now()
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE public.tenants
      ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now()
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
    `INSERT INTO public.tenants (tenant_id, schema_name, is_active)
     VALUES ($1, $2, true)
     ON CONFLICT (tenant_id) DO UPDATE
     SET schema_name = EXCLUDED.schema_name,
         is_active = true,
         updated_at = now()`,
    fixture.tenantId,
    fixture.schemaName,
  );

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "${fixture.schemaName}"."tenant" (
      "id" BIGSERIAL NOT NULL,
      "code" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "is_active" BOOLEAN NOT NULL DEFAULT true,
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "created_by" TEXT NOT NULL DEFAULT 'system',
      "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_by" TEXT NOT NULL DEFAULT 'system',
      CONSTRAINT "tenant_pkey" PRIMARY KEY ("id")
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "tenant_code_key" ON "${fixture.schemaName}"."tenant"("code")
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "${fixture.schemaName}"."role" (
      "id" BIGSERIAL NOT NULL,
      "tenant_id" BIGINT NOT NULL,
      "code" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "created_by" TEXT NOT NULL DEFAULT 'system',
      "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_by" TEXT NOT NULL DEFAULT 'system',
      CONSTRAINT "role_pkey" PRIMARY KEY ("id")
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "${fixture.schemaName}"."permission" (
      "id" BIGSERIAL NOT NULL,
      "code" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "permission_pkey" PRIMARY KEY ("id")
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "permission_code_key" ON "${fixture.schemaName}"."permission"("code")
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "${fixture.schemaName}"."user_role" (
      "id" BIGSERIAL NOT NULL,
      "tenant_id" BIGINT NOT NULL,
      "user_id" BIGINT NOT NULL,
      "role_id" BIGINT NOT NULL,
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "user_role_pkey" PRIMARY KEY ("id")
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "${fixture.schemaName}"."role_permission" (
      "id" BIGSERIAL NOT NULL,
      "tenant_id" BIGINT NOT NULL,
      "role_id" BIGINT NOT NULL,
      "permission_id" BIGINT NOT NULL,
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "created_by" TEXT NOT NULL DEFAULT 'system',
      CONSTRAINT "role_permission_pkey" PRIMARY KEY ("id")
    )
  `);
}

async function truncateTenantRbacTables(
  prisma: PrismaClient,
  fixtures: readonly TenantFixture[],
): Promise<void> {
  for (const fixture of fixtures) {
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE
        "${fixture.schemaName}"."role_permission",
        "${fixture.schemaName}"."user_role",
        "${fixture.schemaName}"."role",
        "${fixture.schemaName}"."permission",
        "${fixture.schemaName}"."tenant"
      RESTART IDENTITY`,
    );
  }
}

integrationDescribe('rbac integration (withTenantTx + schema isolation)', () => {
  jest.setTimeout(30_000);

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

  const store = new PrismaGrantedPermissionsStore({
    withTenantTx: platformDb.withTenantTx.bind(platformDb),
  } as unknown as PlatformDbService);

  const authorizer = createAuthorizer({
    store,
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

    await truncateTenantRbacTables(prisma, tenantFixtures);
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

  it('allows in tenant A but denies in tenant B for the same user', async () => {
    const userId = '1001';
    const [tenantA, tenantB] = tenantFixtures;

    await withTenantContext(tenantA.tenantId, async () => {
      await platformDb.withTenantTx(async (tx) => {
        const tenant = await tx.tenant.create({
          data: {
            code: tenantA.tenantId,
            name: 'Tenant A',
          },
        });

        const permission = await tx.permission.create({
          data: {
            code: 'erp:*',
            name: 'ERP Full Access',
          },
        });

        const role = await tx.role.create({
          data: {
            tenantId: tenant.id,
            code: 'operator',
            name: 'Operator',
          },
        });

        await tx.userRole.create({
          data: {
            tenantId: tenant.id,
            userId: BigInt(userId),
            roleId: role.id,
          },
        });

        await tx.rolePermission.create({
          data: {
            tenantId: tenant.id,
            roleId: role.id,
            permissionId: permission.id,
          },
        });
      });
    });

    await withTenantContext(tenantB.tenantId, async () => {
      await platformDb.withTenantTx(async (tx) => {
        await tx.tenant.create({
          data: {
            code: tenantB.tenantId,
            name: 'Tenant B',
          },
        });
      });
    });

    await expect(
      withTenantContext(tenantA.tenantId, async () =>
        authorizer.authorize({
          tenantId: tenantA.tenantId,
          userId,
          resource: 'erp:order',
          action: 'read',
        }),
      ),
    ).resolves.toMatchObject({ decision: 'allow', obligations: {} });

    await expect(
      withTenantContext(tenantB.tenantId, async () =>
        authorizer.authorize({
          tenantId: tenantB.tenantId,
          userId,
          resource: 'erp:order',
          action: 'read',
        }),
      ),
    ).resolves.toMatchObject({
      decision: 'deny',
      obligations: {},
      reason: 'MISSING_PERMISSION',
    });
  });

  it('denies another user in the same tenant when no role is granted', async () => {
    const user1 = '1001';
    const user2 = '1002';
    const [tenantA] = tenantFixtures;

    await withTenantContext(tenantA.tenantId, async () => {
      await platformDb.withTenantTx(async (tx) => {
        const tenant = await tx.tenant.create({
          data: {
            code: tenantA.tenantId,
            name: 'Tenant A',
          },
        });

        const permission = await tx.permission.create({
          data: {
            code: 'erp:*',
            name: 'ERP Full Access',
          },
        });

        const role = await tx.role.create({
          data: {
            tenantId: tenant.id,
            code: 'operator',
            name: 'Operator',
          },
        });

        await tx.userRole.create({
          data: {
            tenantId: tenant.id,
            userId: BigInt(user1),
            roleId: role.id,
          },
        });

        await tx.rolePermission.create({
          data: {
            tenantId: tenant.id,
            roleId: role.id,
            permissionId: permission.id,
          },
        });
      });
    });

    await expect(
      withTenantContext(tenantA.tenantId, async () =>
        authorizer.authorize({
          tenantId: tenantA.tenantId,
          userId: user1,
          resource: 'erp:order',
          action: 'read',
        }),
      ),
    ).resolves.toMatchObject({ decision: 'allow' });

    await expect(
      withTenantContext(tenantA.tenantId, async () =>
        authorizer.authorize({
          tenantId: tenantA.tenantId,
          userId: user2,
          resource: 'erp:order',
          action: 'read',
        }),
      ),
    ).resolves.toMatchObject({
      decision: 'deny',
      reason: 'MISSING_PERMISSION',
    });
  });
});
