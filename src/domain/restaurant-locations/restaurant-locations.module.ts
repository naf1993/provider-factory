// src/domain/restaurant-locations/restaurant-location.module.ts

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
  RestaurantLocation,
  RestaurantLocationSchema,
} from './restaurant-locations.schema.js'

import {
  RestaurantLocationRepository,
} from './restaurant-locations.repository.js'

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name:
            RestaurantLocation.name,

          schema:
            RestaurantLocationSchema,
        },
      ],
      DOMAIN_DB_CONNECTION,
    ),
  ],

  providers: [
    RestaurantLocationRepository,
  ],

  exports: [
    RestaurantLocationRepository,
  ],
})
export class RestaurantLocationModule {}