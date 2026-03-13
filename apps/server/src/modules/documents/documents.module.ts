import { Module } from '@nestjs/common';
import { DocumentsController } from './controllers/documents.controller';
import { DocumentsService } from './services/documents.service';
import { InventoryModule } from '../inventory/inventory.module';
import { AuditModule } from '../../audit/audit.module';
import { TenantModule } from '../../common/tenant/tenant.module';
import { TradingModule } from '../trading';

@Module({
  imports: [InventoryModule, AuditModule, TenantModule, TradingModule],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
