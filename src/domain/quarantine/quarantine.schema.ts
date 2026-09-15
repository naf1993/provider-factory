import {
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';

import type {
  HydratedDocument,
} from 'mongoose';

export type QuarantineDocument =
  HydratedDocument<Quarantine>;

@Schema({
  timestamps: true,
  collection: 'quarantine',
})
export class Quarantine {
  @Prop({
    required: true,
  })
  runId: string;

  @Prop({
    required: true,
  })
  provider: string;

  @Prop({
    required: true,
  })
  sourceCollection: string;

  @Prop()
  sourceDocumentId?: string;

  @Prop({
    required: true,
  })
  stage: string;

  @Prop({
    required: true,
  })
  reason: string;

  @Prop({
    type: Object,
  })
  rawDocument?: Record<
    string,
    unknown
  >;
}

export const QuarantineSchema =
  SchemaFactory.createForClass(
    Quarantine,
  );

QuarantineSchema.index({
  runId: 1,
  createdAt: -1,
});