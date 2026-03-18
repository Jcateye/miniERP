import { Injectable } from '@nestjs/common';
import {
  createPlatformDb,
  type PlatformDbApi,
  type TenantId,
  type TenantSchema,
  type TenantTxClient,
} from '@minierp/platform-db';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { PrismaService } from './prisma.service';

@Injectable()
export class PlatformDbService implements PlatformDbApi {
  private readonly platformDb: PlatformDbApi;

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {
    this.platformDb = createPlatformDb({
      prisma: this.prisma,
      getCurrentTenantId: (): TenantId =>
        this.tenantContext.getRequiredContext().tenantId,
      getCurrentTenantSchema: (): TenantSchema | undefined =>
        this.tenantContext.getRequiredContext().schemaName,
      nodeEnv: process.env.NODE_ENV,
    });
  }

  withTenantTx<T>(fn: (tx: TenantTxClient) => Promise<T>): Promise<T>;
  withTenantTx<T>(
    options: Parameters<PlatformDbApi['withTenantTx']>[0],
    fn: (tx: TenantTxClient) => Promise<T>,
  ): Promise<T>;
  withTenantTx<T>(...args: readonly unknown[]): Promise<T> {
    const [first, second] = args as readonly [unknown, unknown?];

    if (typeof first === 'function') {
      return this.platformDb.withTenantTx(
        first as (tx: TenantTxClient) => Promise<T>,
      );
    }

    if (typeof second !== 'function') {
      throw new TypeError('withTenantTx(options, fn): fn must be a function');
    }

    return this.platformDb.withTenantTx(
      first as Parameters<PlatformDbApi['withTenantTx']>[0],
      second as (tx: TenantTxClient) => Promise<T>,
    );
  }

  getTenantSchema(tenantId: TenantId): Promise<TenantSchema> {
    return this.platformDb.getTenantSchema(tenantId);
  }

  assertInTenantTx(): void {
    this.platformDb.assertInTenantTx();
  }
}
