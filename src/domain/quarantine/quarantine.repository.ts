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
  Quarantine,
  QuarantineDocument,
} from './quarantine.schema.js';

export interface QuarantineWriteModel {
  runId: string;
  provider: string;
  sourceCollection: string;
  sourceDocumentId?: string;
  stage: string;
  reason: string;
  rawDocument?: Record<
    string,
    unknown
  >;
}

@Injectable()
export class QuarantineRepository {
  constructor(
    @InjectModel(
      Quarantine.name,
      DOMAIN_DB_CONNECTION,
    )
    private readonly model:
      Model<QuarantineDocument>,
  ) {}

  async create(
    record:
      QuarantineWriteModel,
  ) {
    return this.model.create(
      record,
    );
  }


  async findByRunId(
  runId: string,
  page = 1,
  limit = 20,
) {
  const safePage =
    Math.max(page, 1);

  const safeLimit =
    Math.min(
      Math.max(limit, 1),
      100,
    );

  const skip =
    (safePage - 1) *
    safeLimit;

  const [
    items,
    total,
  ] =
    await Promise.all([
      this.model
        .find({
          runId,
        })
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(safeLimit)
        .lean(),

      this.model
        .countDocuments({
          runId,
        }),
    ]);

  return {
    items,

    pagination: {
      page:
        safePage,

      limit:
        safeLimit,

      total,

      totalPages:
        Math.ceil(
          total /
            safeLimit,
        ),
    },
  };
}



}