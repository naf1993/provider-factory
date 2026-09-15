import {
  ConfigService,
} from '@nestjs/config';


import {
  Redis,
} from 'ioredis';

import {
  REDIS_CLIENT,
} from './redis.constants.js';

export const redisProvider = {
  provide:
    REDIS_CLIENT,

  inject: [
    ConfigService,
  ],

  useFactory: (
    config:
      ConfigService,
  ) => {
    return new Redis({
      host:
        config.getOrThrow<string>(
          'redis.host',
        ),

      port:
        config.getOrThrow<number>(
          'redis.port',
        ),

      maxRetriesPerRequest:
        null,
    });
  },
};