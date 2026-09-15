import {
  talabatMenuItemSchema,
  talabatMenuCategorySchema,
  talabatMenuRestaurantSchema,
} from './talabat.schema.js'

describe(
  'Talabat schemas',
  () => {
    it(
      'accepts menu item with image null',
      () => {
        const item = {
          item_id: 101,
          item_name: 'Burger',
          description: 'Beef burger',
          price: '25.50',
          rating: '4.5',
          image: null,
        };

        const result =
          talabatMenuItemSchema.safeParse(
            item,
          );

        expect(
          result.success,
        ).toBe(
          true,
        );
      },
    );

    it(
      'accepts menu item with missing image',
      () => {
        const item = {
          item_id: '102',
          item_name: 'Pizza',
          description: null,
          price: 30,
          rating: null,
        };

        const result =
          talabatMenuItemSchema.safeParse(
            item,
          );

        expect(
          result.success,
        ).toBe(
          true,
        );
      },
    );

    it(
      'rejects menu item with empty item name',
      () => {
        const item = {
          item_id: 103,
          item_name: '',
          price: 10,
        };

        const result =
          talabatMenuItemSchema.safeParse(
            item,
          );

        expect(
          result.success,
        ).toBe(
          false,
        );
      },
    );

    it(
      'accepts numeric values as strings',
      () => {
        const item = {
          item_id: '5001',
          item_name: 'Chicken Burger',
          price: '18.75',
          rating: '4.2',
          image:
            'https://example.com/image.jpg',
        };

        const result =
          talabatMenuItemSchema.safeParse(
            item,
          );

        expect(
          result.success,
        ).toBe(
          true,
        );
      },
    );

    it(
      'accepts category with null items',
      () => {
        const category = {
          category_id: 10,
          category_name: 'Burgers',
          items: null,
        };

        const result =
          talabatMenuCategorySchema.safeParse(
            category,
          );

        expect(
          result.success,
        ).toBe(
          true,
        );
      },
    );

    it(
      'accepts restaurant with nullable fields',
      () => {
        const restaurant = {
          id: null,
          name: 'Test Restaurant',
          logo: null,
          latitude: '25.2048',
          longitude: '55.2708',
          rate: null,
          totalReviews: null,
          totalRatings: null,
          deliveryFee: '5',
          DeliveryTime: null,
          'Minimum Order': '20',
          'Restaurant Address': null,
          City: 'Dubai',
          Contact: null,
          outletCode: '12345',
          category: null,
        };

        const result =
          talabatMenuRestaurantSchema.safeParse(
            restaurant,
          );

        expect(
          result.success,
        ).toBe(
          true,
        );
      },
    );
  },
);