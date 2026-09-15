import {
  Global,
  Module,
} from '@nestjs/common';

import {
  redisProvider,
} from './redis.provider.js';

import {
  REDIS_CLIENT,
} from './redis.constants.js';

@Global()
@Module({
  providers: [
    redisProvider,
  ],

  exports: [
    REDIS_CLIENT,
  ],
})
export class RedisModule {}