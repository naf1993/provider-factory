// src/core/pipeline/pipeline.service.ts

import {
  Injectable,
  Logger,
} from '@nestjs/common';

import {
  InjectConnection,
} from '@nestjs/mongoose';

import type {
  Connection,
} from 'mongoose';

import {
  randomUUID,
} from 'node:crypto';

import { RAW_DB_CONNECTION } from '../database/database.module.js';

import { TalabatAdapter } from '../providers/talabat/talabat.adapter.js';

import { LocationRepository } from '../domain/locations/location.repository.js';

import { RestaurantRepository } from '../domain/restaurants/restaurant.repository.js';

import { RestaurantLocationRepository } from '../domain/restaurant-locations/restaurant-locations.repository.js';

import { MenuCategoryRepository } from '../domain/menu-categories/menu-category.repository.js';
import { MenuItemRepository } from '../domain/menu-items/menu-item.repository.js';

import { QuarantineRepository } from '../domain/quarantine/quarantine.repository.js';

import { RunRepository } from '../domain/runs/run.repository.js';

import { dedupeByKey } from './uitls/dedupe.js';

@Injectable()
export class PipelineService {
  private readonly logger =
    new Logger(
      PipelineService.name,
    );

  constructor(
    @InjectConnection(
      RAW_DB_CONNECTION,
    )
    private readonly rawDb:
      Connection,

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
  ) {}

  // ============================================
  // LOCATIONS
  // ============================================

  async processLocations(
    runId: string,
  ) {
    const collection =
      this.rawDb.collection(
        'locations',
      );

    const cursor =
      collection
        .find({})
        .batchSize(25);

    let rawCount = 0;
    let writtenCount = 0;
    let failedCount = 0;

    for await (
      const rawDocument
      of cursor
    ) {
      rawCount++;

      await this.runs
        .incrementCounters(
          runId,
          {
            read: 1,
          },
        );

      try {
        const transformed =
          this.talabat
            .transformLocationDocument(
              rawDocument,
            );

        const deduped =
          dedupeByKey(
            transformed,
            (location) =>
              `${location.provider}:${location.providerLocationId}`,
          );

        await this.locations
          .bulkUpsert(
            deduped,
          );

        writtenCount +=
          deduped.length;

        await this.runs
          .incrementCounters(
            runId,
            {
              transformed: 1,
              written:
                deduped.length,
            },
          );
      } catch (error) {
        failedCount++;

        const message =
          error instanceof Error
            ? error.message
            : String(error);

        await this.quarantine
          .create({
            runId,

            provider:
              'talabat',

            sourceCollection:
              'locations',

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
            runId,
            {
              skipped: 1,
              failed: 1,
            },
          );

        this.logger.warn(
          `Location document quarantined: ${message}`,
        );
      }
    }

    return {
      rawCount,
      writtenCount,
      failedCount,
    };
  }

  // ============================================
  // RESTAURANTS
  // ============================================

  async processRestaurants(
    runId: string,
  ) {
    const collection =
      this.rawDb.collection(
        'restaurants',
      );

    const cursor =
      collection
        .find({})
        .batchSize(25);

    let rawCount = 0;
    let restaurantCount = 0;
    let relationCount = 0;
    let failedCount = 0;

    for await (
      const rawDocument
      of cursor
    ) {
      rawCount++;

      await this.runs
        .incrementCounters(
          runId,
          {
            read: 1,
          },
        );

      try {
        const result =
          this.talabat
            .transformRestaurantDocument(
              rawDocument,
            );

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

        restaurantCount +=
          restaurants.length;

        relationCount +=
          relations.length;

        await this.runs
          .incrementCounters(
            runId,
            {
              transformed: 1,

              written:
                restaurants.length +
                relations.length,
            },
          );
      } catch (error) {
        failedCount++;

        const message =
          error instanceof Error
            ? error.message
            : String(error);

        await this.quarantine
          .create({
            runId,

            provider:
              'talabat',

            sourceCollection:
              'restaurants',

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
            runId,
            {
              skipped: 1,
              failed: 1,
            },
          );

        this.logger.warn(
          `Restaurant document quarantined: ${message}`,
        );
      }
    }

    return {
      rawCount,
      restaurantCount,
      relationCount,
      failedCount,
    };
  }

  // ============================================
  // MENUS
  // ============================================

  async processMenus(
    runId: string,
  ) {
    const collection =
      this.rawDb.collection(
        'menus',
      );

    const cursor =
      collection
        .find({})
        .batchSize(25);

    let rawCount = 0;
    let restaurantCount = 0;
    let categoryCount = 0;
    let itemCount = 0;
    let failedCount = 0;

    for await (
      const rawDocument
      of cursor
    ) {
      rawCount++;

      await this.runs
        .incrementCounters(
          runId,
          {
            read: 1,
          },
        );

      try {
        const result =
          this.talabat
            .transformMenuDocument(
              rawDocument,
            );

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

        restaurantCount +=
          restaurants.length;

        categoryCount +=
          categories.length;

        itemCount +=
          items.length;

        await this.runs
          .incrementCounters(
            runId,
            {
              transformed: 1,

              written:
                restaurants.length +
                categories.length +
                items.length,
            },
          );
      } catch (error) {
        failedCount++;

        const message =
          error instanceof Error
            ? error.message
            : String(error);

        await this.quarantine
          .create({
            runId,

            provider:
              'talabat',

            sourceCollection:
              'menus',

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
            runId,
            {
              skipped: 1,
              failed: 1,
            },
          );

        this.logger.warn(
          `Menu document quarantined: ${message}`,
        );
      }
    }

    return {
      rawCount,
      restaurantCount,
      categoryCount,
      itemCount,
      failedCount,
    };
  }

  // ============================================
  // COMPLETE RUN
  // ============================================

  async processAll() {
    const runId =
      randomUUID();

    const startedAt =
      Date.now();

    await this.runs.create(
      runId,
    );

    await this.runs
      .markRunning(
        runId,
      );

    try {
      // --------------------
      // LOCATIONS
      // --------------------

      await this.runs
        .setStage(
          runId,
          'locations',
        );

      const locations =
        await this.processLocations(
          runId,
        );

      // --------------------
      // RESTAURANTS
      // --------------------

      await this.runs
        .setStage(
          runId,
          'restaurants',
        );

      const restaurants =
        await this.processRestaurants(
          runId,
        );

      // --------------------
      // MENUS
      // --------------------

      await this.runs
        .setStage(
          runId,
          'menus',
        );

      const menus =
        await this.processMenus(
          runId,
        );

      const durationMs =
        Date.now() -
        startedAt;

      await this.runs
        .markCompleted(
          runId,
          durationMs,
        );

      return {
        runId,

        status:
          'COMPLETED',

        locations,

        restaurants,

        menus,

        durationMs,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);

      await this.runs
        .markFailed(
          runId,
          message,
        );

      this.logger.error(
        `Run ${runId} failed: ${message}`,
      );

      throw error;
    }
  }
}