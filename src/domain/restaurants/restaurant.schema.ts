// src/domain/restaurants/restaurant.schema.ts

import {
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';

import type {
  HydratedDocument,
} from 'mongoose';

export type RestaurantDocument =
  HydratedDocument<Restaurant>;

@Schema({
  timestamps: true,
  collection: 'restaurants',
})
export class Restaurant {
  @Prop({
    required: true,
    trim: true,
  })
  provider: string;

  @Prop({
    required: true,
  })
  providerRestaurantId: number;

  @Prop()
  providerInternalId?: number;

  @Prop({
    required: true,
    trim: true,
  })
  name: string;

  @Prop()
  canonicalUrl?: string;

  @Prop()
  logoUrl?: string;

  @Prop()
  latitude?: number;

  @Prop()
  longitude?: number;

  @Prop()
  rating?: number;

  @Prop()
  totalReviews?: number;

  @Prop()
  totalRatings?: number;

  @Prop()
  deliveryFee?: number;

  @Prop()
  deliveryTime?: string;

  @Prop()
  minimumOrder?: number;

  @Prop()
  address?: string;

  @Prop()
  city?: string;

  @Prop()
  contact?: string;
}

export const RestaurantSchema =
  SchemaFactory.createForClass(
    Restaurant,
  );

RestaurantSchema.index(
  {
    provider: 1,
    providerRestaurantId: 1,
  },
  {
    unique: true,
  },
);

RestaurantSchema.index({
  name: 1,
});

RestaurantSchema.index({
  city: 1,
});