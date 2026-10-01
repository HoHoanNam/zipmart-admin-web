import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { DataTable } from '../../shared/components/data-table/data-table';
import { DataTableCellDirective } from '../../shared/components/data-table/data-table-cell.directive';
import type { DataTableColumn } from '../../shared/components/data-table/data-table.model';
import type { BulkImportCommitResult, BulkImportDryRunResult } from '../../core/models/bulk-import.model';
import { BulkImportAdminService } from './bulk-import-admin.service';

const COLUMNS: DataTableColumn[] = [
  { key: 'row', label: 'Dòng', align: 'right' },
  { key: 'field', label: 'Cột lỗi' },
  { key: 'message', label: 'Lỗi' },
];

@Component({
  selector: 'app-bulk-import-admin',
  imports: [DataTable, DataTableCellDirective],
  templateUrl: './bulk-import-admin.html',
})
export class BulkImportAdmin {
  private readonly importService = inject(BulkImportAdminService);

  readonly columns = COLUMNS;

  selectedFile: File | null = null;
  readonly validating = signal(false);
  readonly committing = signal(false);
  readonly error = signal<string | null>(null);
  readonly dryRunResult = signal<BulkImportDryRunResult | null>(null);
  readonly commitResult = signal<BulkImportCommitResult | null>(null);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    this.error.set(null);
    this.dryRunResult.set(null);
    this.commitResult.set(null);
  }

  async runDryRun(): Promise<void> {
    if (!this.selectedFile) {
      this.error.set('Chọn một file CSV trước.');
      return;
    }
    this.validating.set(true);
    this.error.set(null);
    this.commitResult.set(null);
    try {
      this.dryRunResult.set(await this.importService.dryRun(this.selectedFile));
    } catch (err) {
      this.error.set(this.extractErrorMessage(err));
    } finally {
      this.validating.set(false);
    }
  }

  async commit(): Promise<void> {
    const job = this.dryRunResult();
    if (!job) return;
    this.committing.set(true);
    this.error.set(null);
    try {
      this.commitResult.set(await this.importService.commit(job.jobId));
    } catch (err) {
      this.error.set(this.extractErrorMessage(err));
    } finally {
      this.committing.set(false);
    }
  }

  reset(): void {
    this.selectedFile = null;
    this.error.set(null);
    this.dryRunResult.set(null);
    this.commitResult.set(null);
  }

  private extractErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const flattened = this.flattenMessage((err.error as { message?: unknown } | undefined)?.message);
      if (flattened) return flattened;
    }
    return 'Đã có lỗi xảy ra. Vui lòng thử lại.';
  }

  private flattenMessage(message: unknown): string | null {
    if (typeof message === 'string') return message;
    if (Array.isArray(message)) return message.join('; ');
    if (message && typeof message === 'object' && 'message' in message) {
      return this.flattenMessage((message as { message?: unknown }).message);
    }
    return null;
  }
}
