import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { BulkImportCommitResult, BulkImportDryRunResult } from '../../core/models/bulk-import.model';

@Injectable({ providedIn: 'root' })
export class BulkImportAdminService {
  private readonly http = inject(HttpClient);

  dryRun(file: File): Promise<BulkImportDryRunResult> {
    const formData = new FormData();
    formData.append('file', file);
    // No explicit Content-Type header — the browser sets the multipart
    // boundary itself; HttpClient would break the upload if we forced it.
    return firstValueFrom(
      this.http.post<BulkImportDryRunResult>(
        `${environment.apiUrl}/products/import/dry-run`,
        formData,
      ),
    );
  }

  commit(jobId: string): Promise<BulkImportCommitResult> {
    return firstValueFrom(
      this.http.post<BulkImportCommitResult>(
        `${environment.apiUrl}/products/import/${jobId}/commit`,
        {},
      ),
    );
  }
}
