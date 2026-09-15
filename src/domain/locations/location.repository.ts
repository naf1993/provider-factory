// src/domain/locations/location.repository.ts

import {
  Injectable,
} from '@nestjs/common';

import {
  InjectModel,
} from '@nestjs/mongoose';

import type {
  Model,
} from 'mongoose';

import {
  DOMAIN_DB_CONNECTION,
} from '../../database/database.module.js';

import {
  Location,

} from './location.schema.js';

export interface LocationWriteModel {
  provider: string;
  providerLocationId: number;
  name: string;
  slug: string;
}

@Injectable()
export class LocationRepository {
  constructor(
    @InjectModel(
      Location.name,
      DOMAIN_DB_CONNECTION,
    )
   private readonly model:
  Model<Location>,
  ) {}

  async upsert(
    location: LocationWriteModel,
  ) {
    return this.model.updateOne(
      {
        provider:
          location.provider,

        providerLocationId:
          location.providerLocationId,
      },
      {
        $set: location,
      },
      {
        upsert: true,
      },
    );
  }

  async bulkUpsert(
    locations:
      LocationWriteModel[],
  ) {
    if (!locations.length) {
      return;
    }

    return this.model.bulkWrite(
      locations.map(
        (location) => ({
          updateOne: {
            filter: {
              provider:
                location.provider,

              providerLocationId:
                location.providerLocationId,
            },

            update: {
              $set: location,
            },

            upsert: true,
          },
        }),
      ),
      {
        ordered: false,
      },
    );
  }

  async findByProviderId(
    provider: string,
    providerLocationId: number,
  ) {
    return this.model
      .findOne({
        provider,
        providerLocationId,
      })
      .lean();
  }
}