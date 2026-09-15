import {
  Injectable,
  Logger,
} from '@nestjs/common';

import {
  InjectQueue,
} from '@nestjs/bullmq';

import {
  InjectConnection,
} from '@nestjs/mongoose';

import {
  ConfigService,
} from '@nestjs/config';

import type {
  Connection,
} from 'mongoose';

import type {
  Queue,
} from 'bullmq';

import {
  RAW_DB_CONNECTION,
} from '../database/database.module.js';

import {
  FACTORY_QUEUE,
  FactoryJobName,
} from './factory.constants.js';

import type {
  FactoryBatchJob,
  SourceCollection,
} from './factory.types.js';

@Injectable()
export class FactoryDispatcher {
  private readonly logger =
    new Logger(
      FactoryDispatcher.name,
    );

  constructor(
    @InjectConnection(
      RAW_DB_CONNECTION,
    )
    private readonly rawDb:
      Connection,

    @InjectQueue(
      FACTORY_QUEUE,
    )
    private readonly queue:
      Queue<FactoryBatchJob>,

    private readonly config:
      ConfigService,
  ) {}

  async dispatchRun(
    runId: string,
  ) {
    const batchSize =
      this.config.get<number>(
        'factory.batchSize',
      ) ?? 25;

    let totalJobs = 0;

    totalJobs +=
      await this.dispatchCollection(
        runId,
        'locations',
        FactoryJobName.LOCATIONS,
        batchSize,
      );

    totalJobs +=
      await this.dispatchCollection(
        runId,
        'restaurants',
        FactoryJobName.RESTAURANTS,
        batchSize,
      );

    totalJobs +=
      await this.dispatchCollection(
        runId,
        'menus',
        FactoryJobName.MENUS,
        batchSize,
      );

    this.logger.log(
      `Run ${runId}: dispatched ${totalJobs} jobs`,
    );

    return {
      runId,
      totalJobs,
    };
  }

  private async dispatchCollection(
    runId: string,

    sourceCollection:
      SourceCollection,

    jobName: string,

    batchSize: number,
  ) {
    const collection =
      this.rawDb.collection(
        sourceCollection,
      );

    /*
     * Only read _id.
     *
     * We don't need the huge provider
     * payload inside the dispatcher.
     */
    const cursor =
      collection
        .find(
          {},
          {
            projection: {
              _id: 1,
            },
          },
        )
        .batchSize(
          batchSize,
        );

    let documentIds:
      string[] = [];

    let batchNumber = 0;

    let jobsCreated = 0;

    for await (
      const document
      of cursor
    ) {
      documentIds.push(
        document._id.toString(),
      );

      if (
        documentIds.length >=
        batchSize
      ) {
        await this.enqueueBatch(
          runId,
          sourceCollection,
          jobName,
          batchNumber,
          documentIds,
        );

        jobsCreated++;

        batchNumber++;

        documentIds = [];
      }
    }

    /*
     * Handle final partial batch.
     *
     * Example:
     *
     * 70 restaurants
     * batch size 25
     *
     * 25
     * 25
     * 20 <- this block
     */
    if (
      documentIds.length > 0
    ) {
      await this.enqueueBatch(
        runId,
        sourceCollection,
        jobName,
        batchNumber,
        documentIds,
      );

      jobsCreated++;
    }

    this.logger.log(
      [
        `Run ${runId}`,
        sourceCollection,
        `${jobsCreated} batches`,
      ].join(' | '),
    );

    return jobsCreated;
  }

  private async enqueueBatch(
    runId: string,

    sourceCollection:
      SourceCollection,

    jobName: string,

    batchNumber: number,

    documentIds:
      string[],
  ) {
    const data:
      FactoryBatchJob = {
        runId,

        provider:
          'talabat',

        sourceCollection,

        documentIds,

        batchNumber,
      };

    await this.queue.add(
      jobName,
      data,
      {
        /*
         * Important for retries /
         * resumability.
         */
        jobId:
          `${runId}:${sourceCollection}:${batchNumber}`,

        attempts: 5,

        backoff: {
          type:
            'exponential',

          delay:
            1000,
        },

        removeOnComplete: {
          age:
            3600,

          count:
            1000,
        },

        removeOnFail: false,
      },
    );
  }
}