import { Module } from '@nestjs/common';
import { TenantModule } from '../../common/tenant/tenant.module';
import { InventoryPostingService } from './application/inventory-posting.service';
import { InMemoryInventoryConsistencyStore } from './infrastructure/in-memory-inventory-consistency.store';
import { PrismaInventoryConsistencyStore } from './infrastructure/prisma-inventory-consistency.store';
import { InventoryController } from './controllers/inventory.controller';

@Module({
  imports: [TenantModule],
  controllers: [InventoryController],
  providers: [
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
      inject: [InMemoryInventoryConsistencyStore, PrismaInventoryConsistencyStore],
    },
  ],
  exports: [InventoryPostingService],
})
export class InventoryModule {}
