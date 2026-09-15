// src/domain/restaurants/restaurant.module.ts

import {
  Module,
} from '@nestjs/common';

import {
  MongooseModule,
} from '@nestjs/mongoose';

import {
  DOMAIN_DB_CONNECTION,
} from '../../database/database.module.js';

import {
  Restaurant,
  RestaurantSchema,
} from './restaurant.schema.js';

import {
  RestaurantRepository,
} from './restaurant.repository.js';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name:
            Restaurant.name,

          schema:
            RestaurantSchema,
        },
      ],
      DOMAIN_DB_CONNECTION,
    ),
  ],

  providers: [
    RestaurantRepository,
  ],

  exports: [
    RestaurantRepository,
  ],
})
export class RestaurantModule {}