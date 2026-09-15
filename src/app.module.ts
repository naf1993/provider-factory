// src/app.module.ts

import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';

import configuration from './config/configuration.js';

import { validateEnvironment } from './config/env.schema.js';

import { DatabaseModule } from './database/database.module.js';

import { QueueModule } from './queue/queue.module.js';

import { HealthModule } from './health/health.module.js';

import { LocationModule } from './domain/locations/location.module.js';

import { RestaurantModule } from './domain/restaurants/repository.module.js';

import { RestaurantLocationModule } from './domain/restaurant-locations/restaurant-locations.module.js';

import { MenuCategoryModule } from './domain/menu-categories/menu-categroy.module.js';

import { MenuItemModule } from './domain/menu-items/menu-item.module.js';

import { TalabatModule } from './providers/talabat/talabat.module.js';

import { PipelineModule } from './core/pipeline.module.js';
import { RunsModule } from './runs/runs.module.js';
import { RedisModule } from './redis/redis.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,

      load: [configuration],

      validate: validateEnvironment,
    }),

    DatabaseModule,

    QueueModule,

    HealthModule,

    LocationModule,

    RestaurantModule,

    RestaurantLocationModule,

    MenuCategoryModule,

    MenuItemModule,
    TalabatModule,

    PipelineModule,
    RunsModule,
    RedisModule
  ],
})
export class AppModule {}
