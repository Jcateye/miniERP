import { Module } from '@nestjs/common';
import { SkuService, SKU_REPOSITORY_TOKEN } from './application/sku.service';
import { WarehouseService, WAREHOUSE_REPOSITORY_TOKEN } from './application/warehouse.service';
import { SupplierService, SUPPLIER_REPOSITORY_TOKEN } from './application/supplier.service';
import { CustomerService, CUSTOMER_REPOSITORY_TOKEN } from './application/customer.service';
import { InMemorySkuRepository } from './infrastructure/in-memory-sku.repository';
import { InMemoryWarehouseRepository } from './infrastructure/in-memory-warehouse.repository';
import { InMemorySupplierRepository } from './infrastructure/in-memory-supplier.repository';
import { InMemoryCustomerRepository } from './infrastructure/in-memory-customer.repository';
import { WarehouseController } from './controllers/warehouse.controller';

@Module({
  controllers: [WarehouseController],
  providers: [
    // SKU
    {
      provide: SKU_REPOSITORY_TOKEN,
      useClass: InMemorySkuRepository,
    },
    SkuService,
    // Warehouse
    {
      provide: WAREHOUSE_REPOSITORY_TOKEN,
      useClass: InMemoryWarehouseRepository,
    },
    WarehouseService,
    // Supplier
    {
      provide: SUPPLIER_REPOSITORY_TOKEN,
      useClass: InMemorySupplierRepository,
    },
    SupplierService,
    // Customer
    {
      provide: CUSTOMER_REPOSITORY_TOKEN,
      useClass: InMemoryCustomerRepository,
    },
    CustomerService,
  ],
  exports: [
    SkuService,
    WarehouseService,
    SupplierService,
    CustomerService,
  ],
})
export class MasterdataModule {}
