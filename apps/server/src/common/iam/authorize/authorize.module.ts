import { Module } from '@nestjs/common';
import { AuditModule } from '../../../audit/audit.module';
import { PlatformModule } from '../../../platform/platform.module';
import { TenantModule } from '../../tenant/tenant.module';
import { RbacModule } from '../rbac/rbac.module';
import { AuthorizeGuard } from './authorize.guard';

@Module({
  imports: [TenantModule, AuditModule, PlatformModule, RbacModule],
  providers: [AuthorizeGuard],
  exports: [AuthorizeGuard],
})
export class AuthorizeModule {}
