// src/domain/menu-categories/menu-category.module.ts

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
  MenuCategory,
  MenuCategorySchema,
} from './menu-category.schema.js';

import {
  MenuCategoryRepository,
} from './menu-category.repository.js';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name:
            MenuCategory.name,

          schema:
            MenuCategorySchema,
        },
      ],
      DOMAIN_DB_CONNECTION,
    ),
  ],

  providers: [
    MenuCategoryRepository,
  ],

  exports: [
    MenuCategoryRepository,
  ],
})
export class MenuCategoryModule {}