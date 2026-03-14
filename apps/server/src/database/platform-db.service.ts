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
      nodeEnv: process.env.NODE_ENV,
    });
  }

  withTenantTx<T>(fn: (tx: TenantTxClient) => Promise<T>): Promise<T> {
    return this.platformDb.withTenantTx(fn);
  }

  getTenantSchema(tenantId: TenantId): Promise<TenantSchema> {
    return this.platformDb.getTenantSchema(tenantId);
  }

  assertInTenantTx(): void {
    this.platformDb.assertInTenantTx();
  }
}
