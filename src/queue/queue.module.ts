// src/queue/queue.module.ts

import {
  Module,
} from '@nestjs/common';

import {
  BullModule,
} from '@nestjs/bullmq';

import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';

import {
  FACTORY_QUEUE,
  FACTORY_DLQ,
} from './factory.constants.js';

import {
  FactoryDispatcher,
} from './factory.dispatcher.js';

import {
  FactoryProcessor,
} from './factory.processor.js';

import {
  TalabatModule,
} from '../providers/talabat/talabat.module.js';

import {
  LocationModule,
} from '../domain/locations/location.module.js';

import { RestaurantModule } from '../domain/restaurants/repository.module.js';

import { RestaurantLocationModule } from '../domain/restaurant-locations/restaurant-locations.module.js';

import { MenuCategoryModule } from '../domain/menu-categories/menu-categroy.module.js';
import {
  MenuItemModule,
} from '../domain/menu-items/menu-item.module.js';

import {
  QuarantineModule,
} from '../domain/quarantine/quarantine.module.js';

import {
  RunModule,
} from '../domain/runs/run.module.js';

@Module({
  imports: [
    ConfigModule,

    BullModule.forRootAsync({
      imports: [
        ConfigModule,
      ],

      inject: [
        ConfigService,
      ],

      useFactory: (
        config:
          ConfigService,
      ) => ({
        connection: {
          host:
            config.getOrThrow<string>(
              'redis.host',
            ),

          port:
            config.getOrThrow<number>(
              'redis.port',
            ),
        },
      }),
    }),

    BullModule.registerQueue(
      {
        name:
          FACTORY_QUEUE,
      },

      {
        name:
          FACTORY_DLQ,
      },
    ),

    TalabatModule,

    LocationModule,

    RestaurantModule,

    RestaurantLocationModule,

    MenuCategoryModule,

    MenuItemModule,

    QuarantineModule,

    RunModule,
  ],

  providers: [
    FactoryDispatcher,
    FactoryProcessor,
  ],

  exports: [
    FactoryDispatcher,
  ],
})
export class QueueModule {}