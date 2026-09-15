export default () => ({
  app: {
    port:
      Number(
        process.env.PORT,
      ) || 3000,

    environment:
      process.env.NODE_ENV,
  },

  database: {
    rawUri:
      process.env
        .RAW_MONGODB_URI,

    domainUri:
      process.env
        .DOMAIN_MONGODB_URI,
  },

  redis: {
    host:
      process.env.REDIS_HOST,

    port:
      Number(
        process.env.REDIS_PORT,
      ),
  },

  factory: {
    batchSize:
      Number(
        process.env
          .FACTORY_BATCH_SIZE,
      ),

    concurrency:
      Number(
        process.env
          .FACTORY_CONCURRENCY,
      ),
  },
});