// src/domain/menu-items/menu-item.module.ts

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
  MenuItem,
  MenuItemSchema,
} from './menu-item.schema.js';

import {
  MenuItemRepository,
} from './menu-item.repository.js';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name:
            MenuItem.name,

          schema:
            MenuItemSchema,
        },
      ],
      DOMAIN_DB_CONNECTION,
    ),
  ],

  providers: [
    MenuItemRepository,
  ],

  exports: [
    MenuItemRepository,
  ],
})
export class MenuItemModule {}