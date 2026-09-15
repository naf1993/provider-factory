// src/domain/menu-categories/menu-category.repository.ts

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
  MenuCategory,
  MenuCategoryDocument,
} from './menu-category.schema.js';

export interface MenuCategoryWriteModel {
  provider: string;

  providerRestaurantId: number;

  providerCategoryId: number;

  name: string;
}

@Injectable()
export class MenuCategoryRepository {
  constructor(
    @InjectModel(
      MenuCategory.name,
      DOMAIN_DB_CONNECTION,
    )
    private readonly model:
      Model<MenuCategoryDocument>,
  ) {}

  async upsert(
    category:
      MenuCategoryWriteModel,
  ) {
    return this.model.updateOne(
      {
        provider:
          category.provider,

        providerRestaurantId:
          category
            .providerRestaurantId,

        providerCategoryId:
          category
            .providerCategoryId,
      },
      {
        $set: category,
      },
      {
        upsert: true,
      },
    );
  }

  async bulkUpsert(
    categories:
      MenuCategoryWriteModel[],
  ) {
    if (!categories.length) {
      return;
    }

    return this.model.bulkWrite(
      categories.map(
        (category) => ({
          updateOne: {
            filter: {
              provider:
                category.provider,

              providerRestaurantId:
                category
                  .providerRestaurantId,

              providerCategoryId:
                category
                  .providerCategoryId,
            },

            update: {
              $set: category,
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
}