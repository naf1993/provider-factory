import {
  Injectable,
  Logger,
} from '@nestjs/common';

import {
  InjectQueue,
  OnWorkerEvent,
  Processor,
  WorkerHost,
} from '@nestjs/bullmq';

import type {
  Job,
  Queue,
} from 'bullmq';

import {
  FACTORY_QUEUE,
  FACTORY_DLQ,
} from './factory.constants.js';

import type {
  FactoryBatchJob,
} from './factory.types.js';

import {
  RunRepository,
} from '../domain/runs/run.repository.js';

@Processor(
  FACTORY_QUEUE,
)
@Injectable()
export class FactoryEvents
  extends WorkerHost
{
  private readonly logger =
    new Logger(
      FactoryEvents.name,
    );

  constructor(
    @InjectQueue(
      FACTORY_DLQ,
    )
    private readonly dlq:
      Queue,

    private readonly runs:
      RunRepository,
  ) {
    super();
  }

  async process() {
    // no-op
  }

  @OnWorkerEvent(
    'failed',
  )
  async onFailed(
    job:
      Job<FactoryBatchJob>,

    error:
      Error,
  ) {
    const attemptsMade =
      job.attemptsMade;

    const maxAttempts =
      job.opts.attempts ?? 1;

    this.logger.error(
      [
        `Run ${job.data.runId}`,
        `Job ${job.id}`,
        `Attempt ${attemptsMade}/${maxAttempts}`,
        error.message,
      ].join(' | '),
    );

    if (
      attemptsMade <
      maxAttempts
    ) {
      return;
    }

    await this.dlq.add(
      'dead-letter',
      {
        originalJobId:
          job.id,

        originalJobName:
          job.name,

        runId:
          job.data.runId,

        sourceCollection:
          job.data
            .sourceCollection,

        documentIds:
          job.data
            .documentIds,

        batchNumber:
          job.data
            .batchNumber,

        error:
          error.message,

        failedAt:
          new Date()
            .toISOString(),
      },
      {
        removeOnComplete: false,
        removeOnFail: false,
      },
    );

    await this.runs
      .incrementFailedJobs(
        job.data.runId,
      );

    this.logger.error(
      `Job ${job.id} moved to DLQ`,
    );
  }
}