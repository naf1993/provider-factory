import {
  parseTalabatRestaurantUrl,
} from './talabat-url.parser.js';

describe(
  'parseTalabatRestaurantUrl',
  () => {
    it(
      'extracts restaurant and area IDs',
      () => {
        const result =
          parseTalabatRestaurantUrl(
            'https://www.talabat.com/uae/restaurant/648607/sla-restaurant-and-cafe-al-rowdah?aid=1468',
          );

        expect(
          result.restaurantId,
        ).toBe(648607);

        expect(
          result.areaId,
        ).toBe(1468);
      },
    );

    it(
      'removes aid from canonical URL',
      () => {
        const result =
          parseTalabatRestaurantUrl(
            'https://www.talabat.com/uae/restaurant/648607/sla-restaurant-and-cafe-al-rowdah?aid=1468',
          );

        expect(
          result.canonicalUrl,
        ).not.toContain(
          'aid=1468',
        );
      },
    );
  },
);