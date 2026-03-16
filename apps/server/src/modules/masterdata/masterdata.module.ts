import { Module } from '@nestjs/common';
import { SkuService, SKU_REPOSITORY_TOKEN } from './application/sku.service';
import { AuditModule } from '../../audit/audit.module';
import { TenantModule } from '../../common/tenant/tenant.module';
import { PlatformModule } from '../../platform/platform.module';
import {
  WarehouseService,
  WAREHOUSE_REPOSITORY_TOKEN,
} from './application/warehouse.service';
import {
  SupplierService,
  SUPPLIER_REPOSITORY_TOKEN,
} from './application/supplier.service';
import {
  CustomerService,
  CUSTOMER_REPOSITORY_TOKEN,
} from './application/customer.service';
import { InMemorySkuRepository } from './infrastructure/in-memory-sku.repository';
import { InMemoryWarehouseRepository } from './infrastructure/in-memory-warehouse.repository';
import { InMemorySupplierRepository } from './infrastructure/in-memory-supplier.repository';
import { InMemoryCustomerRepository } from './infrastructure/in-memory-customer.repository';
import { PrismaSkuRepository } from './infrastructure/prisma-sku.repository';
import { PrismaWarehouseRepository } from './infrastructure/prisma-warehouse.repository';
import { PrismaSupplierRepository } from './infrastructure/prisma-supplier.repository';
import { PrismaCustomerRepository } from './infrastructure/prisma-customer.repository';
import { WarehouseController } from './controllers/warehouse.controller';
import { SupplierController } from './controllers/supplier.controller';
import { CustomerController } from './controllers/customer.controller';
import { SkuController } from './controllers/sku.controller';
import { ItemController } from './controllers/item.controller';
import { UomController } from './controllers/uom.controller';
import { TaxCodeController } from './controllers/tax-code.controller';
import { WarehouseBinController } from './controllers/warehouse-bin.controller';
import { WarehouseBinService } from './application/warehouse-bin.service';
import { TaxCodeService } from './application/tax-code.service';
import { UomService } from './application/uom.service';

@Module({
  imports: [AuditModule, TenantModule, PlatformModule],
  controllers: [
    SkuController,
    ItemController,
    WarehouseController,
    SupplierController,
    CustomerController,
    UomController,
    TaxCodeController,
    WarehouseBinController,
  ],
  providers: [
    WarehouseBinService,
    TaxCodeService,
    UomService,
    InMemorySkuRepository,
    InMemoryWarehouseRepository,
    InMemorySupplierRepository,
    InMemoryCustomerRepository,
    PrismaSkuRepository,
    PrismaWarehouseRepository,
    PrismaSupplierRepository,
    PrismaCustomerRepository,
    // SKU
    {
      provide: SKU_REPOSITORY_TOKEN,
      useFactory: (
        inMemoryRepository: InMemorySkuRepository,
        prismaRepository: PrismaSkuRepository,
      ) =>
        (process.env.NODE_ENV ?? 'development') === 'test'
          ? inMemoryRepository
          : prismaRepository,
      inject: [InMemorySkuRepository, PrismaSkuRepository],
    },
    SkuService,
    // Warehouse
    {
      provide: WAREHOUSE_REPOSITORY_TOKEN,
      useFactory: (
        inMemoryRepository: InMemoryWarehouseRepository,
        prismaRepository: PrismaWarehouseRepository,
      ) =>
        (process.env.NODE_ENV ?? 'development') === 'test'
          ? inMemoryRepository
          : prismaRepository,
      inject: [InMemoryWarehouseRepository, PrismaWarehouseRepository],
    },
    WarehouseService,
    // Supplier
    {
      provide: SUPPLIER_REPOSITORY_TOKEN,
      useFactory: (
        inMemoryRepository: InMemorySupplierRepository,
        prismaRepository: PrismaSupplierRepository,
      ) =>
        (process.env.NODE_ENV ?? 'development') === 'test'
          ? inMemoryRepository
          : prismaRepository,
      inject: [InMemorySupplierRepository, PrismaSupplierRepository],
    },
    SupplierService,
    // Customer
    {
      provide: CUSTOMER_REPOSITORY_TOKEN,
      useFactory: (
        inMemoryRepository: InMemoryCustomerRepository,
        prismaRepository: PrismaCustomerRepository,
      ) =>
        (process.env.NODE_ENV ?? 'development') === 'test'
          ? inMemoryRepository
          : prismaRepository,
      inject: [InMemoryCustomerRepository, PrismaCustomerRepository],
    },
    CustomerService,
  ],
  exports: [
    SkuService,
    WarehouseService,
    SupplierService,
    CustomerService,
    WarehouseBinService,
    TaxCodeService,
    UomService,
  ],
})
export class MasterdataModule {}
