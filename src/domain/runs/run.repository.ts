// src/domain/runs/run.repository.ts

import {
  Injectable,
} from '@nestjs/common';

import {
  InjectModel,
} from '@nestjs/mongoose';

import type {
  Model,
} from 'mongoose';

import {
  DOMAIN_DB_CONNECTION,
} from '../../database/database.module.js';

import {
  Run,
  RunDocument,
  RunStatus,
} from './run.schema.js';

@Injectable()
export class RunRepository {
  constructor(
    @InjectModel(
      Run.name,
      DOMAIN_DB_CONNECTION,
    )
    private readonly model:
      Model<RunDocument>,
  ) {}

  async create(
    runId: string,
  ) {
    return this.model.create({
      runId,

      provider:
        'talabat',

      status:
        RunStatus.PENDING,
    });
  }

  async markRunning(
    runId: string,
  ) {
    return this.model.updateOne(
      {
        runId,
      },
      {
        $set: {
          status:
            RunStatus.RUNNING,

          startedAt:
            new Date(),
        },
      },
    );
  }

 async markCompleted(
  runId: string,
  durationMs: number,
) {
  return this.model.updateOne(
    {
      runId,
    },
    {
      $set: {
        status:
          RunStatus.COMPLETED,

        currentStage:
          'completed',

        completedAt:
          new Date(),

        durationMs,
      },
    },
  );
}

  async markFailed(
    runId: string,
    error: string,
  ) {
    return this.model.updateOne(
      {
        runId,
      },
      {
        $set: {
          status:
            RunStatus.FAILED,

          completedAt:
            new Date(),

          lastError:
            error,
        },
      },
    );
  }

  async incrementCounters(
    runId: string,
    counters: {
      read?: number;
      transformed?: number;
      written?: number;
      skipped?: number;
      failed?: number;
    },
  ) {
    const increment:
      Record<string, number> = {};

    if (counters.read) {
      increment[
        'counters.read'
      ] = counters.read;
    }

    if (
      counters.transformed
    ) {
      increment[
        'counters.transformed'
      ] =
        counters.transformed;
    }

    if (counters.written) {
      increment[
        'counters.written'
      ] =
        counters.written;
    }

    if (counters.skipped) {
      increment[
        'counters.skipped'
      ] =
        counters.skipped;
    }

    if (counters.failed) {
      increment[
        'counters.failed'
      ] =
        counters.failed;
    }

    if (
      Object.keys(
        increment,
      ).length === 0
    ) {
      return;
    }

    return this.model.updateOne(
      {
        runId,
      },
      {
        $inc:
          increment,
      },
    );
  }

  async setStage(
    runId: string,
    stage: string,
  ) {
    return this.model.updateOne(
      {
        runId,
      },
      {
        $set: {
          currentStage:
            stage,
        },
      },
    );
  }

  async findByRunId(
    runId: string,
  ) {
    return this.model
      .findOne({
        runId,
      })
      .lean();
  }


  async setExpectedJobs(
  runId: string,
  expectedJobs: number,
) {
  return this.model.updateOne(
    {
      runId,
    },
    {
      $set: {
        expectedJobs,
      },
    },
  );
}


async incrementCompletedJobs(
  runId: string,
) {
  return this.model.findOneAndUpdate(
    {
      runId,
    },
    {
      $inc: {
        completedJobs: 1,
      },
    },
    {
      new: true,
    },
  );
}


async incrementFailedJobs(
  runId: string,
) {
  return this.model.findOneAndUpdate(
    {
      runId,
    },
    {
      $inc: {
        failedJobs: 1,
      },
    },
    {
      new: true,
    },
  );
}


async markCompletedWithErrors(
  runId: string,
  durationMs: number,
) {
  return this.model.updateOne(
    {
      runId,
    },
    {
      $set: {
        status:
          RunStatus
            .COMPLETED_WITH_ERRORS,

        currentStage:
          'completed',

        completedAt:
          new Date(),

        durationMs,
      },
    },
  );
}




}