

import { Injectable, NotFoundException } from '@nestjs/common';

import { randomUUID } from 'node:crypto';

import { RunRepository } from '../domain/runs/run.repository.js';

import { FactoryDispatcher } from '../queue/factory.dispatcher.js';

import { QuarantineRepository } from '../domain/quarantine/quarantine.repository.js';


@Injectable()
export class RunsService {
  constructor(
    private readonly runs: RunRepository,

    private readonly dispatcher: FactoryDispatcher,
     private readonly quarantine:
    QuarantineRepository,
) {}

  async createRun() {
    const runId = randomUUID();

    await this.runs.create(runId);

    await this.runs.markRunning(runId);

    try {
      const dispatchResult = await this.dispatcher.dispatchRun(runId);
      await this.runs.setExpectedJobs(runId, dispatchResult.totalJobs);

      return {
        runId,

        status: 'RUNNING',

        jobsQueued: dispatchResult.totalJobs,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      await this.runs.markFailed(runId, message);

      throw error;
    }
  }

  async getRun(runId: string) {
    const run = await this.runs.findByRunId(runId);

    if (!run) {
      throw new NotFoundException(`Run ${runId} not found`);
    }

    return run;
  }


  async getRunErrors(
  runId: string,
  page = 1,
  limit = 20,
) {
  const run =
    await this.runs
      .findByRunId(
        runId,
      );

  if (!run) {
    throw new NotFoundException(
      `Run ${runId} not found`,
    );
  }

  return this.quarantine
    .findByRunId(
      runId,
      page,
      limit,
    );
}

}
