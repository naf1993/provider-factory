// src/providers/talabat/talabat.adapter.ts

import {
  Injectable,
} from '@nestjs/common';

import type {
  LocationWriteModel,
} from '../../domain/locations/location.repository.js';

import type {
  RestaurantWriteModel,
} from '../../domain/restaurants/restaurant.repository.js';

import type {
  RestaurantLocationWriteModel,
} from '../../domain/restaurant-locations/restaurant-locations.repository.js'
import type {
  MenuCategoryWriteModel,
} from '../../domain/menu-categories/menu-category.repository.js';

import type {
  MenuItemWriteModel,
} from '../../domain/menu-items/menu-item.repository.js';

import {
  talabatLocationSchema,
  talabatRestaurantListItemSchema,
  talabatMenuRestaurantSchema,
} from './talabat.schema.js'

import {
  parseTalabatRestaurantUrl,
} from './talabat-url.parser.js';

import {
  normalizeText,
  toNumber,
  toRequiredNumber,
} from './talabat.mapping.js';

import type {
  TalabatLocationRawDocument,
  TalabatRestaurantRawDocument,
  TalabatMenuRawDocument,
} from './talabat.types.js';

export interface RestaurantPageTransformResult {
  restaurants:
    RestaurantWriteModel[];

  restaurantLocations:
    RestaurantLocationWriteModel[];
}

export interface MenuTransformResult {
  restaurants:
    RestaurantWriteModel[];

  categories:
    MenuCategoryWriteModel[];

  items:
    MenuItemWriteModel[];
}

@Injectable()
export class TalabatAdapter {
  readonly provider =
    'talabat';

  transformLocationDocument(
    raw:
      TalabatLocationRawDocument,
  ): LocationWriteModel[] {
    const results =
      raw.payload?.results;

    if (
      !Array.isArray(
        results,
      )
    ) {
      throw new Error(
        'Location payload.results is missing',
      );
    }

    return results.map(
      (item) => {
        const parsed =
          talabatLocationSchema.parse(
            item,
          );

        return {
          provider:
            this.provider,

          providerLocationId:
            toRequiredNumber(
              parsed.location_id,
              'location_id',
            ),

          name:
            parsed.location_name
              .trim(),

          slug:
            parsed.location_slug
              .trim(),
        };
      },
    );
  }

  transformRestaurantDocument(
    raw:
      TalabatRestaurantRawDocument,
  ): RestaurantPageTransformResult {
    if (
      raw.payload
        ?.['Page Error Message']
    ) {
      throw new Error(
        raw.payload[
          'Page Error Message'
        ],
      );
    }

    if (
      raw.payload?.error
    ) {
      throw new Error(
        raw.payload.error ||
          'Unknown provider error',
      );
    }

    const results =
      raw.payload?.results;

    if (
      !Array.isArray(
        results,
      )
    ) {
      throw new Error(
        'Restaurant payload.results is missing',
      );
    }

    const restaurants:
      RestaurantWriteModel[] = [];

    const relations:
      RestaurantLocationWriteModel[] =
      [];

    for (
      const item of results
    ) {
      const parsed =
        talabatRestaurantListItemSchema.parse(
          item,
        );

      const url =
        parseTalabatRestaurantUrl(
          parsed.restaurant_url,
        );

      restaurants.push({
        provider:
          this.provider,

        providerRestaurantId:
          url.restaurantId,

        name:
          parsed.restaurant_name
            .trim(),

        canonicalUrl:
          url.canonicalUrl,
      });

      const providerLocationId =
        url.areaId ??
        toNumber(
          raw.params?.areaId,
        );

      if (
        providerLocationId !==
        undefined
      ) {
        relations.push({
          provider:
            this.provider,

          providerRestaurantId:
            url.restaurantId,

          providerLocationId,

          areaName:
            parsed.area_name
              .trim(),
        });
      }
    }

    return {
      restaurants,

      restaurantLocations:
        relations,
    };
  }

  transformMenuDocument(
    raw:
      TalabatMenuRawDocument,
  ): MenuTransformResult {
    if (
      raw.payload?.Message
    ) {
      throw new Error(
        raw.payload.Message,
      );
    }

    if (
      raw.payload?.error
    ) {
      throw new Error(
        raw.payload.error ||
          'Unknown provider error',
      );
    }

    const results =
      raw.payload?.results;

    if (
      !Array.isArray(
        results,
      )
    ) {
      throw new Error(
        'Menu payload.results is missing',
      );
    }

    const restaurants:
      RestaurantWriteModel[] = [];

    const categories:
      MenuCategoryWriteModel[] =
      [];

    const items:
      MenuItemWriteModel[] =
      [];

    for (
      const rawRestaurant
      of results
    ) {
      const parsed =
        talabatMenuRestaurantSchema.parse(
          rawRestaurant,
        );

      const
        providerRestaurantId =
          toRequiredNumber(
            parsed.outletCode,
            'outletCode',
          );

      let canonicalUrl:
        string | undefined;

      const sourceUrl =
        raw.params
          ?.restaurant_url;

      if (sourceUrl) {
        try {
          canonicalUrl =
            parseTalabatRestaurantUrl(
              sourceUrl,
            ).canonicalUrl;
        } catch {
          canonicalUrl =
            undefined;
        }
      }

      restaurants.push({
        provider:
          this.provider,

        providerRestaurantId,

        providerInternalId:
          toNumber(
            parsed.id,
          ),

        name:
          parsed.name.trim(),

        canonicalUrl,

        logoUrl:
          normalizeText(
            parsed.logo,
          ),

        latitude:
          toNumber(
            parsed.latitude,
          ),

        longitude:
          toNumber(
            parsed.longitude,
          ),

        rating:
          toNumber(
            parsed.rate,
          ),

        totalReviews:
          toNumber(
            parsed.totalReviews,
          ),

        totalRatings:
          toNumber(
            parsed.totalRatings,
          ),

        deliveryFee:
          toNumber(
            parsed.deliveryFee,
          ),

        deliveryTime:
          normalizeText(
            parsed.DeliveryTime,
          ),

        minimumOrder:
          toNumber(
            parsed[
              'Minimum Order'
            ],
          ),

        address:
          normalizeText(
            parsed[
              'Restaurant Address'
            ],
          ),

        city:
          normalizeText(
            parsed.City,
          ),

        contact:
          normalizeText(
            parsed.Contact,
          ),
      });

      for (
        const category
        of parsed.category ?? []
      ) {
        const
          providerCategoryId =
            toRequiredNumber(
              category.category_id,
              'category_id',
            );

        categories.push({
          provider:
            this.provider,

          providerRestaurantId,

          providerCategoryId,

          name:
            category.category_name
              .trim(),
        });

        for (
          const item
          of category.items ?? []
        ) {
          items.push({
            provider:
              this.provider,

            providerRestaurantId,

            providerCategoryId,

            providerItemId:
              toRequiredNumber(
                item.item_id,
                'item_id',
              ),

            name:
              item.item_name
                .trim(),

            description:
              normalizeText(
                item.description,
              ),

            price:
              toNumber(
                item.price,
              ),

            rating:
              toNumber(
                item.rating,
              ),

            imageUrl:
              normalizeText(
                item.image,
              ),
          });
        }
      }
    }

    return {
      restaurants,
      categories,
      items,
    };
  }
}