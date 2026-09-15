import { z } from 'zod';

const numericValueSchema =
  z.union([
    z.number(),
    z.string(),
  ]);

export const talabatLocationSchema =
  z.object({
    location_name:
      z.string().min(1),

    location_slug:
      z.string().min(1),

    location_id:
      numericValueSchema,
  });

export const
  talabatRestaurantListItemSchema =
    z.object({
      area_name:
        z.string().min(1),

      restaurant_name:
        z.string().min(1),

      restaurant_url:
        z.string().url(),
    });

export const
  talabatMenuItemSchema =
    z.object({
      item_id:
        numericValueSchema,

      item_name:
        z.string().min(1),

      description:
        z.string().nullish(),

      price:
        numericValueSchema.nullish(),

      rating:
        numericValueSchema.nullish(),

      image:
        z.string().nullish(),
    });

export const
  talabatMenuCategorySchema =
    z.object({
      category_id:
        numericValueSchema,

      category_name:
        z.string().min(1),

      items:
        z.array(
          talabatMenuItemSchema,
        ).nullish(),
    });

export const
  talabatMenuRestaurantSchema =
    z.object({
      id:
        numericValueSchema.nullish(),

      name:
        z.string().min(1),

      logo:
        z.string().nullish(),

      latitude:
        numericValueSchema.nullish(),

      longitude:
        numericValueSchema.nullish(),

      rate:
        numericValueSchema.nullish(),

      totalReviews:
        numericValueSchema.nullish(),

      totalRatings:
        numericValueSchema.nullish(),

      deliveryFee:
        numericValueSchema.nullish(),

      DeliveryTime:
        z.string().nullish(),

      'Minimum Order':
        numericValueSchema.nullish(),

      'Restaurant Address':
        z.string().nullish(),

      City:
        z.string().nullish(),

      Contact:
        z.string().nullish(),

      outletCode:
        numericValueSchema,

      category:
        z.array(
          talabatMenuCategorySchema,
        ).nullish(),
    });