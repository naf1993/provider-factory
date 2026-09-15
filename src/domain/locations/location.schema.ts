
import {
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';

import type {
  HydratedDocument,
} from 'mongoose';

export type LocationDocument =
  HydratedDocument<Location>;

@Schema({
  timestamps: true,
  collection: 'locations',
})
export class Location {
  @Prop({
    required: true,
    trim: true,
  })
  provider: string;

  @Prop({
    required: true,
  })
  providerLocationId: number;

  @Prop({
    required: true,
    trim: true,
  })
  name: string;

  @Prop({
    required: true,
    trim: true,
  })
  slug: string;
}

export const LocationSchema =
  SchemaFactory.createForClass(
    Location,
  );

LocationSchema.index(
  {
    provider: 1,
    providerLocationId: 1,
  },
  {
    unique: true,
  },
);

LocationSchema.index({
  name: 1,
});