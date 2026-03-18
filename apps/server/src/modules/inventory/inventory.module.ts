import { Module } from '@nestjs/common';
import { AuditModule } from '../../audit/audit.module';
import { TenantModule } from '../../common/tenant/tenant.module';
import { AuthorizeGuard } from '../../common/iam/authorize/authorize.guard';
import { RbacModule } from '../../common/iam/rbac/rbac.module';
import { PlatformModule } from '../../platform/platform.module';
import { InventoryPostingService } from './application/inventory-posting.service';
import { InMemoryInventoryConsistencyStore } from './infrastructure/in-memory-inventory-consistency.store';
import { PrismaInventoryConsistencyStore } from './infrastructure/prisma-inventory-consistency.store';
import { InventoryController } from './controllers/inventory.controller';

@Module({
  imports: [TenantModule, AuditModule, PlatformModule, RbacModule],
  controllers: [InventoryController],
  providers: [
    AuthorizeGuard,
    InventoryPostingService,
    InMemoryInventoryConsistencyStore,
    PrismaInventoryConsistencyStore,
    {
      provide: 'InventoryConsistencyStore',
      useFactory: (
        inMemoryStore: InMemoryInventoryConsistencyStore,
        prismaStore: PrismaInventoryConsistencyStore,
      ) =>
        (process.env.NODE_ENV ?? 'development') === 'test'
          ? inMemoryStore
          : prismaStore,
      inject: [
        InMemoryInventoryConsistencyStore,
        PrismaInventoryConsistencyStore,
      ],
    },
  ],
  exports: [InventoryPostingService],
})
export class InventoryModule {}
