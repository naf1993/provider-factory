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

describe(
  'LocationRepository integration',
  () => {
    let mongoServer:
      MongoMemoryServer;

    let connection:
      mongoose.Connection;

    let model:
      Model<Location>;

    let repository:
      LocationRepository;

    beforeAll(
      async () => {
        mongoServer =
          await MongoMemoryServer.create();

        const uri =
          mongoServer.getUri();

        connection =
          await mongoose
            .createConnection(
              uri,
            )
            .asPromise();

        /*
         * Mongoose has very complex
         * inferred generic types.
         *
         * For this integration test,
         * explicitly treat this as
         * Model<Location>.
         */
        model =
          connection.model(
            Location.name,
            LocationSchema,
          ) as unknown as Model<Location>;

        repository =
          new LocationRepository(
            model,
          );
      },
    );

    afterAll(
      async () => {
        await connection.close();

        await mongoServer.stop();
      },
    );

    it(
      'upserts a location',
      async () => {
        await repository.upsert({
          provider:
            'talabat',

          providerLocationId:
            101,

          name:
            'Dubai Marina',

          slug:
            'dubai-marina',
        });

        const result =
          await repository
            .findByProviderId(
              'talabat',
              101,
            );

        expect(
          result,
        ).not.toBeNull();

        expect(
          result?.provider,
        ).toBe(
          'talabat',
        );

        expect(
          result?.providerLocationId,
        ).toBe(
          101,
        );

        expect(
          result?.name,
        ).toBe(
          'Dubai Marina',
        );

        expect(
          result?.slug,
        ).toBe(
          'dubai-marina',
        );
      },
    );

    it(
      'updates existing location instead of creating duplicate',
      async () => {
        await repository.upsert({
          provider:
            'talabat',

          providerLocationId:
            200,

          name:
            'Old Name',

          slug:
            'old-name',
        });

        await repository.upsert({
          provider:
            'talabat',

          providerLocationId:
            200,

          name:
            'New Name',

          slug:
            'new-name',
        });

        const documents =
          await model
            .find({
              provider:
                'talabat',

              providerLocationId:
                200,
            })
            .lean();

        expect(
          documents,
        ).toHaveLength(
          1,
        );

        expect(
          documents[0]?.name,
        ).toBe(
          'New Name',
        );

        expect(
          documents[0]?.slug,
        ).toBe(
          'new-name',
        );
      },
    );

    it(
      'bulk upserts multiple locations',
      async () => {
        await repository.bulkUpsert([
          {
            provider:
              'talabat',

            providerLocationId:
              301,

            name:
              'Area One',

            slug:
              'area-one',
          },

          {
            provider:
              'talabat',

            providerLocationId:
              302,

            name:
              'Area Two',

            slug:
              'area-two',
          },
        ]);

        const one =
          await repository
            .findByProviderId(
              'talabat',
              301,
            );

        const two =
          await repository
            .findByProviderId(
              'talabat',
              302,
            );

        expect(
          one?.name,
        ).toBe(
          'Area One',
        );

        expect(
          two?.name,
        ).toBe(
          'Area Two',
        );
      },
    );

    it(
      'is idempotent for same natural key',
      async () => {
        const location = {
          provider:
            'talabat',

          providerLocationId:
            400,

          name:
            'Test Area',

          slug:
            'test-area',
        };

        await repository.upsert(
          location,
        );

        await repository.upsert(
          location,
        );

        await repository.upsert(
          location,
        );

        const count =
          await model
            .countDocuments({
              provider:
                'talabat',

              providerLocationId:
                400,
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