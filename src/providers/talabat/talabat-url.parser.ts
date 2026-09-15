// src/providers/talabat/talabat-url.parser.ts

export interface ParsedTalabatRestaurantUrl {
  restaurantId: number;

  areaId?: number;

  canonicalUrl: string;
}

export function parseTalabatRestaurantUrl(
  value: string,
): ParsedTalabatRestaurantUrl {
  const url =
    new URL(value);

  const match =
    url.pathname.match(
      /\/restaurant\/(\d+)\//,
    );

  if (!match) {
    throw new Error(
      'Invalid Talabat restaurant URL',
    );
  }

  const restaurantId =
    Number(match[1]);

  if (
    !Number.isFinite(
      restaurantId,
    )
  ) {
    throw new Error(
      'Invalid Talabat restaurant ID',
    );
  }

  const areaRaw =
    url.searchParams.get(
      'aid',
    );

  let areaId:
    number | undefined;

  if (areaRaw) {
    const parsed =
      Number(areaRaw);

    if (
      Number.isFinite(
        parsed,
      )
    ) {
      areaId =
        parsed;
    }
  }

  url.searchParams.delete(
    'aid',
  );

  return {
    restaurantId,

    areaId,

    canonicalUrl:
      url.toString(),
  };
}