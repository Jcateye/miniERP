import { Module } from '@nestjs/common';
import { AuditModule } from '../../audit/audit.module';
import { PlatformModule } from '../../platform/platform.module';
import { TenantModule } from '../../common/tenant/tenant.module';
import { AuthorizeGuard } from '../../common/iam/authorize/authorize.guard';
import { PolicyController } from './policy.controller';
import { RbacModule } from '../../common/iam/rbac/rbac.module';

@Module({
  imports: [TenantModule, AuditModule, PlatformModule, RbacModule],
  controllers: [PolicyController],
  providers: [AuthorizeGuard],
})
export class PolicyModule {}
