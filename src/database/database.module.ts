import {
  Module,
} from '@nestjs/common';

import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';

import {
  MongooseModule,
} from '@nestjs/mongoose';

export const RAW_DB_CONNECTION =
  'RAW_DB';

export const DOMAIN_DB_CONNECTION =
  'DOMAIN_DB';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      connectionName:
        RAW_DB_CONNECTION,

      imports: [
        ConfigModule,
      ],

      inject: [
        ConfigService,
      ],

      useFactory: (
        configService:
          ConfigService,
      ) => ({
        uri:
          configService.getOrThrow<string>(
            'database.rawUri',
          ),
      }),
    }),

    MongooseModule.forRootAsync({
      connectionName:
        DOMAIN_DB_CONNECTION,

      imports: [
        ConfigModule,
      ],

      inject: [
        ConfigService,
      ],

      useFactory: (
        configService:
          ConfigService,
      ) => ({
        uri:
          configService.getOrThrow<string>(
            'database.domainUri',
          ),
      }),
    }),
  ],
})
export class DatabaseModule {}