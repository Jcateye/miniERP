import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiExceptionFilter } from './common/filters/api-exception.filter';
import { ApiResponseInterceptor } from './common/interceptors/api-response.interceptor';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { MasterdataModule } from './modules/masterdata/masterdata.module';
import { AuditService } from './audit/application/audit.service';
import {
  AUDIT_STORE_TOKEN,
  InMemoryAuditStore,
} from './audit/application/audit.store';
import { IamGuard } from './common/iam/iam.guard';
import { PlatformAccessService } from './platform/application/platform-access.service';
import { TenantContextService } from './common/tenant/tenant-context.service';
import { DocumentsModule } from './modules/documents/documents.module';
import { EvidenceModule } from './modules/evidence/evidence.module';
import { InventoryModule } from './modules/inventory/inventory.module';

@Module({
  imports: [
    DatabaseModule,
    HealthModule,
    DocumentsModule,
    EvidenceModule,
    InventoryModule,
    MasterdataModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    TenantContextService,
    {
      provide: AUDIT_STORE_TOKEN,
      useClass: InMemoryAuditStore,
    },
    AuditService,
    PlatformAccessService,
    IamGuard,
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: ApiExceptionFilter,
    },
  ],
})
export class AppModule {}
