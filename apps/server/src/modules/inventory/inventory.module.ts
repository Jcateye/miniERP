import { Module } from '@nestjs/common';
import { InventoryPostingService } from './application/inventory-posting.service';
import { InMemoryInventoryConsistencyStore } from './infrastructure/in-memory-inventory-consistency.store';

@Module({
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
