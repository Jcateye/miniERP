import { Module } from '@nestjs/common';
import { DocumentsController } from './controllers/documents.controller';
import { DocumentsService } from './services/documents.service';
import { InventoryModule } from '../inventory/inventory.module';
import { AuditService } from '../../audit/application/audit.service';

@Module({
  imports: [InventoryModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, AuditService],
})
export class DocumentsModule {}
