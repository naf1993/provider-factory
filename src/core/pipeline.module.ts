// src/core/pipeline/pipeline.module.ts

import {
  Module,
} from '@nestjs/common';

import {
  PipelineService,
} from './pipeline.service.js';

import { TalabatModule } from '../providers/talabat/talabat.module.js';


import { LocationModule } from '../domain/locations/location.module.js';

import { RestaurantModule } from '../domain/restaurants/repository.module.js';

import { RestaurantLocationModule } from '../domain/restaurant-locations/restaurant-locations.module.js';
import { PipelineController } from './pipeline.controller.js';

import { MenuCategoryModule } from '../domain/menu-categories/menu-categroy.module.js';

import { MenuItemModule } from '../domain/menu-items/menu-item.module.js';
import { QuarantineModule } from '../domain/quarantine/quarantine.module.js';

import { RunModule } from '../domain/runs/run.module.js';

@Module({
  imports: [
    TalabatModule,
    LocationModule,
    RestaurantModule,
    RestaurantLocationModule,
    MenuCategoryModule,
    MenuItemModule,
    QuarantineModule,
    RunModule
  ],

    controllers: [
    PipelineController,
  ],

  providers: [
    PipelineService,
  ],

  exports: [
    PipelineService,
  ],
})
export class PipelineModule {}