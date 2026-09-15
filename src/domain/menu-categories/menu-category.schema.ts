// src/domain/menu-categories/menu-category.schema.ts

import {
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';

import type {
  HydratedDocument,
} from 'mongoose';

export type MenuCategoryDocument =
  HydratedDocument<MenuCategory>;

@Schema({
  timestamps: true,
  collection:
    'menu_categories',
})
export class MenuCategory {
  @Prop({
    required: true,
  })
  provider: string;

  @Prop({
    required: true,
  })
  providerRestaurantId: number;

  @Prop({
    required: true,
  })
  providerCategoryId: number;

  @Prop({
    required: true,
    trim: true,
  })
  name: string;
}

export const
  MenuCategorySchema =
    SchemaFactory.createForClass(
      MenuCategory,
    );

MenuCategorySchema.index(
  {
    provider: 1,
    providerRestaurantId: 1,
    providerCategoryId: 1,
  },
  {
    unique: true,
  },
);

MenuCategorySchema.index({
  providerRestaurantId: 1,
});