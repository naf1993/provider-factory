import {
  dedupeByKey,
} from './dedupe.js';

describe(
  'dedupeByKey',
  () => {
    it(
      'removes duplicate items by key',
      () => {
        const items = [
          {
            id: 1,
            name: 'A',
          },
          {
            id: 2,
            name: 'B',
          },
          {
            id: 1,
            name: 'A duplicate',
          },
        ];

        const result =
          dedupeByKey(
            items,
            (item) =>
              item.id.toString(),
          );

        expect(
          result,
        ).toHaveLength(
          2,
        );

        expect(
          result.map(
            (item) =>
              item.id,
          ),
        ).toEqual(
          [
            1,
            2,
          ],
        );
      },
    );

    it(
      'returns empty array for empty input',
      () => {
        const result =
          dedupeByKey(
            [],
            () =>
              'key',
          );

        expect(
          result,
        ).toEqual(
          [],
        );
      },
    );
  },
);