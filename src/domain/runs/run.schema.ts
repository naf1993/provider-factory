// src/domain/runs/run.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import type { HydratedDocument } from 'mongoose';

export type RunDocument = HydratedDocument<Run>;

export enum RunStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  COMPLETED_WITH_ERRORS = 'COMPLETED_WITH_ERRORS',
  FAILED = 'FAILED',
}

@Schema({
  _id: false,
})
export class RunCounters {
  @Prop({
    default: 0,
  })
  read: number;

  @Prop({
    default: 0,
  })
  transformed: number;

  @Prop({
    default: 0,
  })
  written: number;

  @Prop({
    default: 0,
  })
  skipped: number;

  @Prop({
    default: 0,
  })
  failed: number;
}

export const RunCountersSchema = SchemaFactory.createForClass(RunCounters);

// ============================================
// PER-STAGE COUNTERS
// ============================================

@Schema({
  _id: false,
})
export class RunStages {
  @Prop({
    type: RunCountersSchema,
    default: () => ({}),
  })
  locations: RunCounters;

  @Prop({
    type: RunCountersSchema,
    default: () => ({}),
  })
  restaurants: RunCounters;

  @Prop({
    type: RunCountersSchema,
    default: () => ({}),
  })
  menus: RunCounters;
}

export const RunStagesSchema = SchemaFactory.createForClass(RunStages);

@Schema({
  _id: false,
})
export class RunSampleError {
  @Prop({
    required: true,
  })
  stage: string;

  @Prop()
  sourceDocumentId?: string;

  @Prop({
    required: true,
  })
  message: string;

  @Prop({
    required: true,
  })
  createdAt: Date;
}

export const RunSampleErrorSchema =
  SchemaFactory.createForClass(RunSampleError);

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

  // Overall counters
  @Prop({
    type: RunCountersSchema,
    default: () => ({}),
  })
  counters: RunCounters;

  // Per-stage counters
  @Prop({
    type: RunStagesSchema,
    default: () => ({}),
  })
  stages: RunStages;

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

  @Prop({
  type: [
    RunSampleErrorSchema,
  ],
  default: [],
})
sampleErrors:
  RunSampleError[];

}

export const RunSchema = SchemaFactory.createForClass(Run);
