// src/domain/runs/run.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import type { HydratedDocument } from 'mongoose';

export type RunDocument = HydratedDocument<Run>;


export enum RunStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  COMPLETED_WITH_ERRORS =
    'COMPLETED_WITH_ERRORS',
  FAILED = 'FAILED',
}

@Schema({
  timestamps: true,
  collection: 'runs',
})
export class Run {
  @Prop({
    required: true,
    unique: true,
    index: true,
  })
  runId: string;

  @Prop({
    required: true,
    enum: RunStatus,
    default: RunStatus.PENDING,
  })
  status: RunStatus;

  @Prop({
    required: true,
    default: 'talabat',
  })
  provider: string;

  @Prop({
    type: Object,
    default: {
      read: 0,
      transformed: 0,
      written: 0,
      skipped: 0,
      failed: 0,
    },
  })
  counters: {
    read: number;
    transformed: number;
    written: number;
    skipped: number;
    failed: number;
  };

  @Prop({
    default: 0,
  })
  expectedJobs: number;

  @Prop({
    default: 0,
  })
  completedJobs: number;

  @Prop({
    default: 0,
  })
  failedJobs: number;

  @Prop()
  currentStage?: string;

  @Prop()
  startedAt?: Date;

  @Prop()
  completedAt?: Date;

  @Prop()
  durationMs?: number;

  @Prop()
  lastError?: string;
}

export const RunSchema = SchemaFactory.createForClass(Run);
