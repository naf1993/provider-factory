import {
  Module,
} from '@nestjs/common';

import {
  TalabatAdapter,
} from './talabat.adapter.js';

@Module({
  providers: [
    TalabatAdapter,
  ],

  exports: [
    TalabatAdapter,
  ],
})
export class TalabatModule {}