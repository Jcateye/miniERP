import { Module } from '@nestjs/common';
import { InventoryPostingService } from './application/inventory-posting.service';
import { InMemoryInventoryConsistencyStore } from './infrastructure/in-memory-inventory-consistency.store';
import { InventoryController } from './controllers/inventory.controller';

@Module({
  controllers: [InventoryController],
  providers: [
    InventoryPostingService,
    InMemoryInventoryConsistencyStore,
    {
      provide: 'InventoryConsistencyStore',
      useExisting: InMemoryInventoryConsistencyStore,
    },
  ],
  exports: [InventoryPostingService],
})
export class InventoryModule {}
