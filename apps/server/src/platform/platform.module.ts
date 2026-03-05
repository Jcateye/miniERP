import { Module } from '@nestjs/common';
import { PlatformAccessService } from './application/platform-access.service';

@Module({
  providers: [PlatformAccessService],
  exports: [PlatformAccessService],
})
export class PlatformModule {}
