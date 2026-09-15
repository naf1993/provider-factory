// src/domain/restaurant-locations/restaurant-location.schema.ts

import {
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';

import type {
  HydratedDocument,
} from 'mongoose';

export type RestaurantLocationDocument =
  HydratedDocument<RestaurantLocation>;

@Schema({
  timestamps: true,
  collection:
    'restaurant_locations',
})
export class RestaurantLocation {
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
  providerLocationId: number;

  @Prop()
  areaName?: string;
}

export const
  RestaurantLocationSchema =
    SchemaFactory.createForClass(
      RestaurantLocation,
    );

RestaurantLocationSchema.index(
  {
    provider: 1,
    providerRestaurantId: 1,
    providerLocationId: 1,
  },
  {
    unique: true,
  },
);

RestaurantLocationSchema.index({
  providerLocationId: 1,
});