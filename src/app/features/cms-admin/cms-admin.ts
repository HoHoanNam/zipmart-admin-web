import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataTable } from '../../shared/components/data-table/data-table';
import { DataTableCellDirective } from '../../shared/components/data-table/data-table-cell.directive';
import type { DataTableColumn } from '../../shared/components/data-table/data-table.model';
import { Modal } from '../../shared/components/modal/modal';
import type { CmsPage } from '../../core/models/cms-page.model';
import { CmsAdminService } from './cms-admin.service';

const COLUMNS: DataTableColumn[] = [
  { key: 'title', label: 'Tiêu đề' },
  { key: 'slug', label: 'Slug' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'updatedAt', label: 'Cập nhật lúc' },
  { key: 'actions', label: '', align: 'right' },
];

@Component({
  selector: 'app-cms-admin',
  imports: [FormsModule, DatePipe, DataTable, DataTableCellDirective, Modal],
  templateUrl: './cms-admin.html',
})
export class CmsAdmin {
  private readonly cmsService = inject(CmsAdminService);
  private readonly router = inject(Router);

  readonly columns = COLUMNS;
  readonly pages = signal<CmsPage[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly creating = signal(false);
  slug = '';
  title = '';

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      this.pages.set(await this.cmsService.findAll());
    } finally {
      this.loading.set(false);
    }
  }

  edit(page: CmsPage): void {
    void this.router.navigate(['/cms', page.id]);
  }

  startCreate(): void {
    this.error.set(null);
    this.slug = '';
    this.title = '';
    this.creating.set(true);
  }

  closeCreate(): void {
    this.creating.set(false);
  }

  async save(): Promise<void> {
    if (!this.slug.trim() || !this.title.trim()) {
      this.error.set('Nhập slug và tiêu đề.');
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    try {
      const page = await this.cmsService.create({
        slug: this.slug.trim(),
        title: this.title.trim(),
        content: '<p></p>',
      });
      this.creating.set(false);
      void this.router.navigate(['/cms', page.id]);
    } catch (err) {
      this.error.set(this.extractErrorMessage(err));
    } finally {
      this.saving.set(false);
    }
  }

  async remove(page: CmsPage): Promise<void> {
    if (!confirm(`Xoá trang "${page.title}"?`)) return;
    await this.cmsService.remove(page.id);
    await this.load();
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
