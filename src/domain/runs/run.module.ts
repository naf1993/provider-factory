// src/domain/runs/run.module.ts

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
  Run,
  RunSchema,
} from './run.schema.js';

import {
  RunRepository,
} from './run.repository.js';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name:
            Run.name,

          schema:
            RunSchema,
        },
      ],
      DOMAIN_DB_CONNECTION,
    ),
  ],

  providers: [
    RunRepository,
  ],

  exports: [
    RunRepository,
  ],
})
export class RunModule {}