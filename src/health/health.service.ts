import {
  Inject,
  Injectable,
} from '@nestjs/common';

import {
  InjectConnection,
} from '@nestjs/mongoose';

import type {
  Connection,
} from 'mongoose';

import type {
  Redis,
} from 'ioredis';

import {
  RAW_DB_CONNECTION,
  DOMAIN_DB_CONNECTION,
} from '../database/database.module.js';

import {
  REDIS_CLIENT,
} from '../redis/redis.constants.js';

@Injectable()
export class HealthService {
  constructor(
    @InjectConnection(
      RAW_DB_CONNECTION,
    )
    private readonly rawDb:
      Connection,

    @InjectConnection(
      DOMAIN_DB_CONNECTION,
    )
    private readonly domainDb:
      Connection,

    @Inject(
      REDIS_CLIENT,
    )
    private readonly redis:
      Redis,
  ) {}

 

  async check() {
  const rawMongoUp =
    this.rawDb.readyState === 1;

  const domainMongoUp =
    this.domainDb.readyState === 1;

  let redisUp = false;

  try {
    const result =
      await this.redis.ping();

    redisUp =
      result === 'PONG';
  } catch {
    redisUp = false;
  }

  const healthy =
    rawMongoUp &&
    domainMongoUp &&
    redisUp;

  return {
    status:
      healthy
        ? 'ok'
        : 'degraded',

    services: {
      rawMongo: {
        status:
          rawMongoUp
            ? 'up'
            : 'down',
      },

      domainMongo: {
        status:
          domainMongoUp
            ? 'up'
            : 'down',
      },

      redis: {
        status:
          redisUp
            ? 'up'
            : 'down',
      },
    },

    timestamp:
      new Date().toISOString(),
  };
}
}