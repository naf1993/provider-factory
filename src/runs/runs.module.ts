// src/runs/runs.module.ts

import {
  Module,
} from '@nestjs/common';

import {
  RunsController,
} from './runs.controller.js';

import {
  RunsService,
} from './runs.service.js';

import {
  RunModule,
} from '../domain/runs/run.module.js';

import {
  QueueModule,
} from '../queue/queue.module.js';
import { QuarantineModule } from '../domain/quarantine/quarantine.module.js';

@Module({
  imports: [
    RunModule,
    QueueModule,
    QuarantineModule
  ],

  controllers: [
    RunsController,
  ],

  providers: [
    RunsService,
  ],
})
export class RunsModule {}