export interface BulkImportRowError {
  row: number;
  field?: string;
  message: string;
}

export interface BulkImportDryRunResult {
  jobId: string;
  totalRows: number;
  validRows: number;
  errors: BulkImportRowError[];
}

export interface BulkImportCommitResult {
  created: number;
  updated: number;
  failed: number;
}
