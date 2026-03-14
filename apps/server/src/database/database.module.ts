import { Global, Module } from '@nestjs/common';
import { TenantModule } from '../common/tenant/tenant.module';
import { parseEnv } from '../config/env.schema';
import { DATABASE_URL_TOKEN, REDIS_URL_TOKEN } from './database.constants';
import { PlatformDbService } from './platform-db.service';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  imports: [TenantModule],
  providers: [
    PrismaService,
    PlatformDbService,
    {
      provide: DATABASE_URL_TOKEN,
      useFactory: (): string => parseEnv(process.env).DATABASE_URL,
    },
    {
      provide: REDIS_URL_TOKEN,
      useFactory: (): string => parseEnv(process.env).REDIS_URL,
    },
  ],
  exports: [
    PrismaService,
    PlatformDbService,
    DATABASE_URL_TOKEN,
    REDIS_URL_TOKEN,
  ],
})
export class DatabaseModule {}
