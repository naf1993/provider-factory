// src/domain/restaurant-locations/restaurant-location.repository.ts

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
  RestaurantLocation,
  RestaurantLocationDocument,
} from './restaurant-locations.schema.js'

export interface RestaurantLocationWriteModel {
  provider: string;

  providerRestaurantId: number;

  providerLocationId: number;

  areaName?: string;
}

@Injectable()
export class RestaurantLocationRepository {
  constructor(
    @InjectModel(
      RestaurantLocation.name,
      DOMAIN_DB_CONNECTION,
    )
    private readonly model:
      Model<RestaurantLocationDocument>,
  ) {}

  async upsert(
    relation:
      RestaurantLocationWriteModel,
  ) {
    return this.model.updateOne(
      {
        provider:
          relation.provider,

        providerRestaurantId:
          relation
            .providerRestaurantId,

        providerLocationId:
          relation
            .providerLocationId,
      },
      {
        $set: relation,
      },
      {
        upsert: true,
      },
    );
  }

  async bulkUpsert(
    relations:
      RestaurantLocationWriteModel[],
  ) {
    if (!relations.length) {
      return;
    }

    return this.model.bulkWrite(
      relations.map(
        (relation) => ({
          updateOne: {
            filter: {
              provider:
                relation.provider,

              providerRestaurantId:
                relation
                  .providerRestaurantId,

              providerLocationId:
                relation
                  .providerLocationId,
            },

            update: {
              $set: relation,
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

  async findByRestaurant(
    provider: string,
    providerRestaurantId:
      number,
  ) {
    return this.model
      .find({
        provider,
        providerRestaurantId,
      })
      .lean();
  }

  async findByLocation(
    provider: string,
    providerLocationId:
      number,
  ) {
    return this.model
      .find({
        provider,
        providerLocationId,
      })
      .lean();
  }
}