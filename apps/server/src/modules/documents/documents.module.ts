import { Module } from '@nestjs/common';
import { DocumentsController } from './controllers/documents.controller';
import { DocumentsService } from './services/documents.service';
import { InventoryModule } from '../inventory/inventory.module';
import { AuditModule } from '../../audit/audit.module';
import { TenantModule } from '../../common/tenant/tenant.module';
import { AuthorizeGuard } from '../../common/iam/authorize/authorize.guard';
import { RbacModule } from '../../common/iam/rbac/rbac.module';
import { PlatformModule } from '../../platform/platform.module';
import { TradingModule } from '../trading/trading.module';

@Module({
  imports: [
    InventoryModule,
    AuditModule,
    TenantModule,
    PlatformModule,
    RbacModule,
    TradingModule,
  ],
  controllers: [DocumentsController],
  providers: [AuthorizeGuard, DocumentsService],
})
export class DocumentsModule {}
