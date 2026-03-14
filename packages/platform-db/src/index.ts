import { AsyncLocalStorage } from 'node:async_hooks';
import { Prisma, type PrismaClient } from '@prisma/client';

export type TenantId = string;
export type TenantSchema = string;
export type TenantTxClient = Prisma.TransactionClient;

interface TenantTxContext {
  readonly tenantId: TenantId;
  readonly schema: TenantSchema;
  readonly tx: TenantTxClient;
}

export interface PlatformDbApi {
  withTenantTx<T>(fn: (tx: TenantTxClient) => Promise<T>): Promise<T>;
  getTenantSchema(tenantId: TenantId): Promise<TenantSchema>;
  assertInTenantTx(): void;
}

export interface PlatformDbDeps {
  readonly prisma: PrismaClient;
  readonly getCurrentTenantId: () => TenantId;
  readonly nodeEnv?: string;
  readonly tenantRegistryTable?: string;
}

const DEFAULT_TENANT_REGISTRY_TABLE = 'public.tenants';
const VALID_IDENTIFIER_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/u;
const tenantTxStorage = new AsyncLocalStorage<TenantTxContext>();

function parseQualifiedName(qualifiedName: string): {
  readonly schema: string;
  readonly table: string;
} {
  const parts = qualifiedName.split('.');
  if (parts.length !== 2) {
    throw new Error(
      `Tenant registry table must be <schema>.<table>: ${qualifiedName}`,
    );
  }

  const schema = parts[0];
  const table = parts[1];
  if (
    typeof schema !== 'string' ||
    typeof table !== 'string' ||
    !VALID_IDENTIFIER_PATTERN.test(schema) ||
    !VALID_IDENTIFIER_PATTERN.test(table)
  ) {
    throw new Error(
      `Tenant registry table contains unsafe identifier: ${qualifiedName}`,
    );
  }

  return { schema, table };
}

function assertValidTenantSchema(schema: string): TenantSchema {
  if (!VALID_IDENTIFIER_PATTERN.test(schema)) {
    throw new Error(`Invalid tenant schema identifier: ${schema}`);
  }

  return schema;
}

function isDevGuardEnabled(nodeEnv: string | undefined): boolean {
  return nodeEnv !== 'production';
}

async function applyTenantSearchPath(
  tx: TenantTxClient,
  tenantSchema: TenantSchema,
): Promise<void> {
  const schema = assertValidTenantSchema(tenantSchema);
  await tx.$executeRawUnsafe(`SET LOCAL search_path = "${schema}", public`);
}

export function createPlatformDb(deps: PlatformDbDeps): PlatformDbApi {
  const registryTable = parseQualifiedName(
    deps.tenantRegistryTable ?? DEFAULT_TENANT_REGISTRY_TABLE,
  );

  return {
    async withTenantTx<T>(fn: (tx: TenantTxClient) => Promise<T>): Promise<T> {
      const tenantId = deps.getCurrentTenantId();
      const activeContext = tenantTxStorage.getStore();

      if (activeContext) {
        if (activeContext.tenantId !== tenantId) {
          throw new Error(
            `Nested tenant transaction mismatch: ${activeContext.tenantId} !== ${tenantId}`,
          );
        }

        return fn(activeContext.tx);
      }

      const tenantSchema = await this.getTenantSchema(tenantId);
      return deps.prisma.$transaction(async (tx: TenantTxClient) => {
        await applyTenantSearchPath(tx, tenantSchema);

        return tenantTxStorage.run(
          {
            tenantId,
            schema: tenantSchema,
            tx,
          },
          () => fn(tx),
        );
      });
    },
    async getTenantSchema(tenantId: TenantId): Promise<TenantSchema> {
      const normalizedTenantId = tenantId.trim();
      if (normalizedTenantId.length === 0) {
        throw new Error('tenantId is required');
      }

      const activeContext = tenantTxStorage.getStore();
      if (activeContext && activeContext.tenantId === normalizedTenantId) {
        return activeContext.schema;
      }

      const rows = (await deps.prisma.$queryRawUnsafe(
        `SELECT schema_name
         FROM "${registryTable.schema}"."${registryTable.table}"
         WHERE tenant_id = $1
         LIMIT 1`,
        normalizedTenantId,
      )) as Array<{ schema_name: string }>;

      const schemaName = rows[0]?.schema_name;
      if (!schemaName) {
        throw new Error(
          `Tenant schema is not registered in ${registryTable.schema}.${registryTable.table}: ${normalizedTenantId}`,
        );
      }

      return assertValidTenantSchema(schemaName);
    },
    assertInTenantTx(): void {
      if (!isDevGuardEnabled(deps.nodeEnv)) {
        return;
      }

      if (!tenantTxStorage.getStore()) {
        throw new Error(
          'Tenant transaction context is required. Wrap the query in withTenantTx().',
        );
      }
    },
  };
}
