// src/domain/restaurants/restaurant.repository.ts

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
  Restaurant,
  RestaurantDocument,
} from './restaurant.schema.js';

export interface RestaurantWriteModel {
  provider: string;

  providerRestaurantId: number;

  providerInternalId?: number;

  name: string;

  canonicalUrl?: string;

  logoUrl?: string;

  latitude?: number;

  longitude?: number;

  rating?: number;

  totalReviews?: number;

  totalRatings?: number;

  deliveryFee?: number;

  deliveryTime?: string;

  minimumOrder?: number;

  address?: string;

  city?: string;

  contact?: string;
}

@Injectable()
export class RestaurantRepository {
  constructor(
    @InjectModel(
      Restaurant.name,
      DOMAIN_DB_CONNECTION,
    )
    private readonly model:
      Model<RestaurantDocument>,
  ) {}

  async upsert(
    restaurant:
      RestaurantWriteModel,
  ) {
    return this.model.updateOne(
      {
        provider:
          restaurant.provider,

        providerRestaurantId:
          restaurant
            .providerRestaurantId,
      },
      {
        $set: restaurant,
      },
      {
        upsert: true,
      },
    );
  }

  async bulkUpsert(
    restaurants:
      RestaurantWriteModel[],
  ) {
    if (!restaurants.length) {
      return;
    }

    return this.model.bulkWrite(
      restaurants.map(
        (restaurant) => ({
          updateOne: {
            filter: {
              provider:
                restaurant.provider,

              providerRestaurantId:
                restaurant
                  .providerRestaurantId,
            },

            update: {
              $set: restaurant,
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
    providerRestaurantId:
      number,
  ) {
    return this.model
      .findOne({
        provider,
        providerRestaurantId,
      })
      .lean();
  }
}