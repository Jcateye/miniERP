import type { Prisma, PrismaClient } from '@prisma/client';

export type TenantId = string;
export type TenantSchema = string;
export type TenantTxClient = Prisma.TransactionClient;

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

export function createPlatformDb(_deps: PlatformDbDeps): PlatformDbApi {
  return {
    async withTenantTx<T>(): Promise<T> {
      throw new Error('withTenantTx is not implemented yet');
    },
    async getTenantSchema(): Promise<TenantSchema> {
      throw new Error('getTenantSchema is not implemented yet');
    },
    assertInTenantTx(): void {
      throw new Error('assertInTenantTx is not implemented yet');
    },
  };
}
