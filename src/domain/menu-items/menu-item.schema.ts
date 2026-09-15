// src/domain/menu-items/menu-item.schema.ts

import {
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';

import type {
  HydratedDocument,
} from 'mongoose';

export type MenuItemDocument =
  HydratedDocument<MenuItem>;

@Schema({
  timestamps: true,
  collection: 'menu_items',
})
export class MenuItem {
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
  })
  providerItemId: number;

  @Prop({
    required: true,
    trim: true,
  })
  name: string;

  @Prop()
  description?: string;

  @Prop()
  price?: number;

  @Prop()
  rating?: number;

  @Prop()
  imageUrl?: string;
}

export const MenuItemSchema =
  SchemaFactory.createForClass(
    MenuItem,
  );

MenuItemSchema.index(
  {
    provider: 1,
    providerRestaurantId: 1,
    providerItemId: 1,
  },
  {
    unique: true,
  },
);

MenuItemSchema.index({
  providerRestaurantId: 1,
  providerCategoryId: 1,
});