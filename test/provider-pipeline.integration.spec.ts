import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from 'vitest';

import mongoose from 'mongoose';

import type {
  Model,
} from 'mongoose';

import {
  MongoMemoryServer,
} from 'mongodb-memory-server';

import {
  Location,
  LocationSchema,
} from '../src/domain/locations/location.schema.js';

import {
  LocationRepository,
} from '../src/domain/locations/location.repository.js';

import {
  TalabatAdapter,
} from '../src/providers/talabat/talabat.adapter.js';

describe(
  'Provider pipeline integration',
  () => {
    let mongoServer:
      MongoMemoryServer;

    let connection:
      mongoose.Connection;

    let model:
      Model<Location>;

    let repository:
      LocationRepository;

    let adapter:
      TalabatAdapter;

    beforeAll(
      async () => {
        mongoServer =
          await MongoMemoryServer.create();

        connection =
          await mongoose
            .createConnection(
              mongoServer.getUri(),
            )
            .asPromise();

        model =
          connection.model(
            Location.name,
            LocationSchema,
          ) as unknown as Model<Location>;

        repository =
          new LocationRepository(
            model,
          );

        adapter =
          new TalabatAdapter();
      },
    );

    afterAll(
      async () => {
        await connection.close();

        await mongoServer.stop();
      },
    );

    it(
      'transforms raw Talabat location data and stores normalized locations',
      async () => {
        const rawDocument = {
          payload: {
            results: [
              {
                location_id:
                  '101',

                location_name:
                  'Dubai Marina',

                location_slug:
                  'dubai-marina',
              },

              {
                location_id:
                  102,

                location_name:
                  'Business Bay',

                location_slug:
                  'business-bay',
              },
            ],
          },
        };

        /*
         * Step 1:
         * provider-specific transformation
         */
        const transformed =
          adapter
            .transformLocationDocument(
              rawDocument,
            );

        expect(
          transformed,
        ).toHaveLength(
          2,
        );

        expect(
          transformed[0],
        ).toEqual({
          provider:
            'talabat',

          providerLocationId:
            101,

          name:
            'Dubai Marina',

          slug:
            'dubai-marina',
        });

        /*
         * Step 2:
         * save normalized models
         */
        await repository
          .bulkUpsert(
            transformed,
          );

        /*
         * Step 3:
         * read normalized data back
         * from MongoDB
         */
        const dubaiMarina =
          await repository
            .findByProviderId(
              'talabat',
              101,
            );

        const businessBay =
          await repository
            .findByProviderId(
              'talabat',
              102,
            );

        expect(
          dubaiMarina?.name,
        ).toBe(
          'Dubai Marina',
        );

        expect(
          dubaiMarina
            ?.providerLocationId,
        ).toBe(
          101,
        );

        expect(
          businessBay?.name,
        ).toBe(
          'Business Bay',
        );

        expect(
          businessBay
            ?.providerLocationId,
        ).toBe(
          102,
        );
      },
    );

    it(
      'is idempotent when the same provider data is processed twice',
      async () => {
        const rawDocument = {
          payload: {
            results: [
              {
                location_id:
                  '500',

                location_name:
                  'Jumeirah',

                location_slug:
                  'jumeirah',
              },
            ],
          },
        };

        const first =
          adapter
            .transformLocationDocument(
              rawDocument,
            );

        const second =
          adapter
            .transformLocationDocument(
              rawDocument,
            );

        await repository
          .bulkUpsert(
            first,
          );

        await repository
          .bulkUpsert(
            second,
          );

        const count =
          await model
            .countDocuments({
              provider:
                'talabat',

              providerLocationId:
                500,
            });

        expect(
          count,
        ).toBe(
          1,
        );
      },
    );
  },
);