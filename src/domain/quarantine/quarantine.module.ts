import {
  Module,
} from '@nestjs/common';

import {
  MongooseModule,
} from '@nestjs/mongoose';

import {
  DOMAIN_DB_CONNECTION,
} from '../../database/database.module.js';

import {
  Quarantine,
  QuarantineSchema,
} from './quarantine.schema.js';

import {
  QuarantineRepository,
} from './quarantine.repository.js';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name:
            Quarantine.name,
          schema:
            QuarantineSchema,
        },
      ],
      DOMAIN_DB_CONNECTION,
    ),
  ],

  providers: [
    QuarantineRepository,
  ],

  exports: [
    QuarantineRepository,
  ],
})
export class QuarantineModule {}