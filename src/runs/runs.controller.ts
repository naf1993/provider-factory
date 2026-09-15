

import {
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';

import {
  RunsService,
} from './runs.service.js';



@Controller('runs')
export class RunsController {
  constructor(
    private readonly runsService:
      RunsService,
  ) {}

  @Post()
  createRun() {
    return this.runsService
      .createRun();
  }

  @Get(':id/errors')
  getRunErrors(
    @Param('id')
    runId: string,

    @Query('page')
    page?: string,

    @Query('limit')
    limit?: string,
  ) {
    return this.runsService
      .getRunErrors(
        runId,
        page
          ? Number(page)
          : 1,
        limit
          ? Number(limit)
          : 20,
      );
  }

  @Get(':id')
  getRun(
    @Param('id')
    runId: string,
  ) {
    return this.runsService
      .getRun(
        runId,
      );
  }
}