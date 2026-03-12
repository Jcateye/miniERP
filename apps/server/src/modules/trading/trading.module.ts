import { Module } from '@nestjs/common';
import { TradingDocumentCatalogService } from './application/trading-document-catalog.service';

@Module({
  providers: [TradingDocumentCatalogService],
  exports: [TradingDocumentCatalogService],
})
export class TradingModule {}
