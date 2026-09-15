// src/domain/menu-items/menu-item.repository.ts

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
  MenuItem,
  MenuItemDocument,
} from './menu-item.schema.js';

export interface MenuItemWriteModel {
  provider: string;

  providerRestaurantId: number;

  providerCategoryId: number;

  providerItemId: number;

  name: string;

  description?: string;

  price?: number;

  rating?: number;

  imageUrl?: string;
}

@Injectable()
export class MenuItemRepository {
  constructor(
    @InjectModel(
      MenuItem.name,
      DOMAIN_DB_CONNECTION,
    )
    private readonly model:
      Model<MenuItemDocument>,
  ) {}

  async upsert(
    item: MenuItemWriteModel,
  ) {
    return this.model.updateOne(
      {
        provider:
          item.provider,

        providerRestaurantId:
          item.providerRestaurantId,

        providerItemId:
          item.providerItemId,
      },
      {
        $set: item,
      },
      {
        upsert: true,
      },
    );
  }

  async bulkUpsert(
    items:
      MenuItemWriteModel[],
  ) {
    if (!items.length) {
      return;
    }

    return this.model.bulkWrite(
      items.map(
        (item) => ({
          updateOne: {
            filter: {
              provider:
                item.provider,

              providerRestaurantId:
                item
                  .providerRestaurantId,

              providerItemId:
                item.providerItemId,
            },

            update: {
              $set: item,
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

  async findByCategory(
    provider: string,
    providerRestaurantId:
      number,
    providerCategoryId:
      number,
  ) {
    return this.model
      .find({
        provider,
        providerRestaurantId,
        providerCategoryId,
      })
      .lean();
  }
}