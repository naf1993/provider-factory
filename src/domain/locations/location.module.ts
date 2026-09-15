// src/domain/locations/location.module.ts

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
  Location,
  LocationSchema,
} from './location.schema.js';

import {
  LocationRepository,
} from './location.repository.js';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name:
            Location.name,

          schema:
            LocationSchema,
        },
      ],
      DOMAIN_DB_CONNECTION,
    ),
  ],

  providers: [
    LocationRepository,
  ],

  exports: [
    LocationRepository,
  ],
})
export class LocationModule {}