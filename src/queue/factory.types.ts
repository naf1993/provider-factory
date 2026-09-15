export type SourceCollection =
  | 'locations'
  | 'restaurants'
  | 'menus';

export interface FactoryBatchJob {
  runId: string;

  provider: string;

  sourceCollection:
    SourceCollection;

  documentIds:
    string[];

  batchNumber:
    number;
}