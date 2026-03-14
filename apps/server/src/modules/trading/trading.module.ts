import { Module } from '@nestjs/common';
import { TradingDocumentCatalogService } from './application/trading-document-catalog.service';
import { PurchaseInboundWriteService } from './application/purchase-inbound-write.service';
import { SalesShipmentWriteService } from './application/sales-shipment-write.service';
import { TradingDocumentsReadService } from './application/trading-documents-read.service';

import { AuditModule } from '../../audit/audit.module';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [AuditModule, InventoryModule],
  providers: [
    TradingDocumentCatalogService,
    PurchaseInboundWriteService,
    SalesShipmentWriteService,
    TradingDocumentsReadService,
  ],
  exports: [
    TradingDocumentCatalogService,
    PurchaseInboundWriteService,
    SalesShipmentWriteService,
    TradingDocumentsReadService,
  ],
})
export class TradingModule {}
