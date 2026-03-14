import { Module } from '@nestjs/common';
import { PrismaGrantedPermissionsStore } from './granted-permissions.store';

@Module({
  providers: [PrismaGrantedPermissionsStore],
  exports: [PrismaGrantedPermissionsStore],
})
export class RbacModule {}
