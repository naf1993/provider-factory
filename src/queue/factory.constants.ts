export const FACTORY_QUEUE =
  'provider-factory';

export const FACTORY_DLQ =
  'provider-factory-dlq';

export const FactoryJobName = {
  LOCATIONS:
    'location-batch',

  RESTAURANTS:
    'restaurant-batch',

  MENUS:
    'menu-batch',
} as const;


export const FACTORY_CONCURRENCY =
  Number(
    process.env
      .FACTORY_CONCURRENCY ??
      5,
  );