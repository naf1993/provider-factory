// src/queue/factory.processor.ts

import {
  Logger,
} from '@nestjs/common';

import {
  InjectQueue,
  OnWorkerEvent,
  Processor,
  WorkerHost,
} from '@nestjs/bullmq';

import {
  InjectConnection,
} from '@nestjs/mongoose';

import type {
  Connection,
} from 'mongoose';

import {
  ObjectId,
} from 'mongodb';

import type {
  Job,
  Queue,
} from 'bullmq';

import {
  RAW_DB_CONNECTION,
} from '../database/database.module.js';

import {
  FACTORY_QUEUE,
  FACTORY_DLQ,
  FACTORY_CONCURRENCY,
  FactoryJobName,
} from './factory.constants.js';

import type {
  FactoryBatchJob,
} from './factory.types.js';

import {
  TalabatAdapter,
} from '../providers/talabat/talabat.adapter.js';

import {
  LocationRepository,
} from '../domain/locations/location.repository.js';

import {
  RestaurantRepository,
} from '../domain/restaurants/restaurant.repository.js';

import {
  RestaurantLocationRepository,
} from '../domain/restaurant-locations/restaurant-locations.repository.js';

import {
  MenuCategoryRepository,
} from '../domain/menu-categories/menu-category.repository.js';

import {
  MenuItemRepository,
} from '../domain/menu-items/menu-item.repository.js';

import {
  QuarantineRepository,
} from '../domain/quarantine/quarantine.repository.js';

import {
  RunRepository,
} from '../domain/runs/run.repository.js';

import { dedupeByKey } from '../core/uitls/dedupe.js';

@Processor(
  FACTORY_QUEUE,
  {
    concurrency:
      FACTORY_CONCURRENCY,
  },
)
export class FactoryProcessor
  extends WorkerHost
{
  private readonly logger =
    new Logger(
      FactoryProcessor.name,
    );

  constructor(
    @InjectConnection(
      RAW_DB_CONNECTION,
    )
    private readonly rawDb:
      Connection,

    @InjectQueue(
      FACTORY_DLQ,
    )
    private readonly dlq:
      Queue,

    private readonly talabat:
      TalabatAdapter,

    private readonly locations:
      LocationRepository,

    private readonly restaurants:
      RestaurantRepository,

    private readonly restaurantLocations:
      RestaurantLocationRepository,

    private readonly categories:
      MenuCategoryRepository,

    private readonly items:
      MenuItemRepository,

    private readonly quarantine:
      QuarantineRepository,

    private readonly runs:
      RunRepository,
  ) {
    super();
  }


  async process(
    job:
      Job<FactoryBatchJob>,
  ) {
    this.logger.log(
      [
        `Run ${job.data.runId}`,
        `Job ${job.id}`,
        `Type ${job.name}`,
      ].join(' | '),
    );

    /*
     * TEMPORARY DLQ TEST
     */

    // if (
    //   job.name ===
    //     FactoryJobName.MENUS &&
    //   job.data.batchNumber === 0
    // ) {
    //   throw new Error(
    //     'Temporary DLQ test failure',
    //   );
    // }

    let result;

    switch (
      job.name
    ) {
      case FactoryJobName.LOCATIONS:
        result =
          await this.processLocations(
            job,
          );
        break;

      case FactoryJobName.RESTAURANTS:
        result =
          await this.processRestaurants(
            job,
          );
        break;

      case FactoryJobName.MENUS:
        result =
          await this.processMenus(
            job,
          );
        break;

      default:
        throw new Error(
          `Unknown job type: ${job.name}`,
        );
    }


    await this.runs
      .incrementCompletedJobs(
        job.data.runId,
      );


    await this.finalizeRunIfNeeded(
      job.data.runId,
    );

    return result;
  }


  private async getDocuments(
    job:
      Job<FactoryBatchJob>,
  ) {
    const ids =
      job.data.documentIds.map(
        (id) =>
          new ObjectId(
            id,
          ),
      );

    return this.rawDb
      .collection(
        job.data
          .sourceCollection,
      )
      .find({
        _id: {
          $in:
            ids,
        },
      })
      .toArray();
  }


  private async processLocations(
    job:
      Job<FactoryBatchJob>,
  ) {
    const documents =
      await this.getDocuments(
        job,
      );

    for (
      const rawDocument
      of documents
    ) {
  
      await this.runs
        .incrementCounters(
          job.data.runId,
          'locations',
          {
            read: 1,
          },
        );

      let result;

      try {
        result =
          this.talabat
            .transformLocationDocument(
              rawDocument,
            );
      } catch (error) {
        await this.handleBadDocument(
          job,
          rawDocument,
          error,
        );

        continue;
      }

      const deduped =
        dedupeByKey(
          result,
          (location) =>
            `${location.provider}:${location.providerLocationId}`,
        );

     
      await this.locations
        .bulkUpsert(
          deduped,
        );

   
      await this.runs
        .incrementCounters(
          job.data.runId,
          'locations',
          {
            transformed: 1,

            written:
              deduped.length,
          },
        );
    }
  }


  private async processRestaurants(
    job:
      Job<FactoryBatchJob>,
  ) {
    const documents =
      await this.getDocuments(
        job,
      );

    for (
      const rawDocument
      of documents
    ) {
      await this.runs
        .incrementCounters(
          job.data.runId,
          'restaurants',
          {
            read: 1,
          },
        );

      let result;

      try {
        result =
          this.talabat
            .transformRestaurantDocument(
              rawDocument,
            );
      } catch (error) {
        await this.handleBadDocument(
          job,
          rawDocument,
          error,
        );

        continue;
      }

      const restaurants =
        dedupeByKey(
          result.restaurants,
          (restaurant) =>
            `${restaurant.provider}:${restaurant.providerRestaurantId}`,
        );

      const relations =
        dedupeByKey(
          result.restaurantLocations,
          (relation) =>
            [
              relation.provider,
              relation.providerRestaurantId,
              relation.providerLocationId,
            ].join(':'),
        );

  
      await this.restaurants
        .bulkUpsert(
          restaurants,
        );

      await this
        .restaurantLocations
        .bulkUpsert(
          relations,
        );

      await this.runs
        .incrementCounters(
          job.data.runId,
          'restaurants',
          {
            transformed: 1,

            written:
              restaurants.length +
              relations.length,
          },
        );
    }
  }


  private async processMenus(
    job:
      Job<FactoryBatchJob>,
  ) {
    const documents =
      await this.getDocuments(
        job,
      );

    for (
      const rawDocument
      of documents
    ) {
      await this.runs
        .incrementCounters(
          job.data.runId,
          'menus',
          {
            read: 1,
          },
        );

      let result;

      try {
        result =
          this.talabat
            .transformMenuDocument(
              rawDocument,
            );
      } catch (error) {
        await this.handleBadDocument(
          job,
          rawDocument,
          error,
        );

        continue;
      }

      const restaurants =
        dedupeByKey(
          result.restaurants,
          (restaurant) =>
            `${restaurant.provider}:${restaurant.providerRestaurantId}`,
        );

      const categories =
        dedupeByKey(
          result.categories,
          (category) =>
            [
              category.provider,
              category.providerRestaurantId,
              category.providerCategoryId,
            ].join(':'),
        );

      const items =
        dedupeByKey(
          result.items,
          (item) =>
            [
              item.provider,
              item.providerRestaurantId,
              item.providerItemId,
            ].join(':'),
        );

   
      await this.restaurants
        .bulkUpsert(
          restaurants,
        );

      await this.categories
        .bulkUpsert(
          categories,
        );

      await this.items
        .bulkUpsert(
          items,
        );

      await this.runs
        .incrementCounters(
          job.data.runId,
          'menus',
          {
            transformed: 1,

            written:
              restaurants.length +
              categories.length +
              items.length,
          },
        );
    }
  }


  private async handleBadDocument(
    job:
      Job<FactoryBatchJob>,

    rawDocument:
      any,

    error:
      unknown,
  ) {
    const message =
      error instanceof Error
        ? error.message
        : String(
            error,
          );


    await this.quarantine
      .create({
        runId:
          job.data.runId,

        provider:
          job.data.provider,

        sourceCollection:
          job.data
            .sourceCollection,

        sourceDocumentId:
          rawDocument._id
            ?.toString(),

        stage:
          'transform',

        reason:
          message,

        rawDocument,
      });


    await this.runs
      .incrementCounters(
        job.data.runId,
        job.data
          .sourceCollection,
        {
          skipped: 1,
          failed: 1,
        },
      );

    this.logger.warn(
      [
        `Run ${job.data.runId}`,
        `Job ${job.id}`,
        `Source ${rawDocument._id}`,
        message,
      ].join(' | '),
    );
  }

  private async finalizeRunIfNeeded(
    runId: string,
  ) {
    const run =
      await this.runs
        .findByRunId(
          runId,
        );

    if (!run) {
      return;
    }

    const finishedJobs =
      run.completedJobs +
      run.failedJobs;


    if (
      finishedJobs <
      run.expectedJobs
    ) {
      return;
    }

    const startedAt =
      run.startedAt
        ? new Date(
            run.startedAt,
          ).getTime()
        : Date.now();

    const durationMs =
      Date.now() -
      startedAt;

 
    if (
      run.failedJobs > 0
    ) {
      await this.runs
        .markCompletedWithErrors(
          runId,
          durationMs,
        );

      this.logger.warn(
        [
          `Run ${runId}`,
          'completed with errors',
          `completedJobs=${run.completedJobs}`,
          `failedJobs=${run.failedJobs}`,
        ].join(' | '),
      );

      return;
    }

    
    await this.runs
      .markCompleted(
        runId,
        durationMs,
      );

    this.logger.log(
      `Run ${runId} completed`,
    );
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
    const maxAttempts =
      job.opts.attempts ??
      1;

    this.logger.error(
      [
        `Run ${job.data.runId}`,
        `Job ${job.id}`,
        `Attempt ${job.attemptsMade}/${maxAttempts}`,
        error.message,
      ].join(' | '),
    );


    if (
      job.attemptsMade <
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

        provider:
          job.data.provider,

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
        removeOnComplete:
          false,

        removeOnFail:
          false,
      },
    );

  
    await this.runs
      .incrementFailedJobs(
        job.data.runId,
      );

    this.logger.error(
      `Job ${job.id} moved to DLQ`,
    );


    await this.finalizeRunIfNeeded(
      job.data.runId,
    );
  }
}