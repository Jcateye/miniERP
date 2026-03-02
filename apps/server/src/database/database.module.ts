import { Global, Module } from '@nestjs/common';
import { parseEnv } from '../config/env.schema';
import { DATABASE_URL_TOKEN, REDIS_URL_TOKEN } from './database.constants';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_URL_TOKEN,
      useFactory: (): string => parseEnv(process.env).DATABASE_URL,
    },
    {
      provide: REDIS_URL_TOKEN,
      useFactory: (): string => parseEnv(process.env).REDIS_URL,
    },
  ],
  exports: [DATABASE_URL_TOKEN, REDIS_URL_TOKEN],
})
export class DatabaseModule {}
