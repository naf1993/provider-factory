import {
  Controller,
  Post,
} from '@nestjs/common';

import {
  PipelineService,
} from './pipeline.service.js';

@Controller('pipeline')
export class PipelineController {
  constructor(
    private readonly pipeline:
      PipelineService,
  ) {}

  @Post('run')
  run() {
    return this.pipeline
      .processAll();
  }
}