import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuillEditorComponent } from 'ngx-quill';
import { DataTable } from '../../shared/components/data-table/data-table';
import { DataTableCellDirective } from '../../shared/components/data-table/data-table-cell.directive';
import type { DataTableColumn } from '../../shared/components/data-table/data-table.model';
import type { CmsPage, CmsPageVersion } from '../../core/models/cms-page.model';
import { CmsAdminService } from './cms-admin.service';

const VERSION_COLUMNS: DataTableColumn[] = [
  { key: 'createdAt', label: 'Thời gian lưu' },
  { key: 'createdByUserId', label: 'Người sửa' },
  { key: 'actions', label: '', align: 'right' },
];

@Component({
  selector: 'app-cms-page-editor',
  imports: [FormsModule, DatePipe, QuillEditorComponent, DataTable, DataTableCellDirective],
  templateUrl: './cms-page-editor.html',
})
export class CmsPageEditor {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cmsService = inject(CmsAdminService);

  readonly versionColumns = VERSION_COLUMNS;

  readonly page = signal<CmsPage | null>(null);
  readonly versions = signal<CmsPageVersion[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly restoringId = signal<string | null>(null);

  title = '';
  slug = '';
  content = '';

  private readonly pageId = this.route.snapshot.paramMap.get('id') ?? '';

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      const [page, versions] = await Promise.all([
        this.cmsService.findOne(this.pageId),
        this.cmsService.findVersions(this.pageId),
      ]);
      this.page.set(page);
      this.versions.set(versions);
      this.title = page.title;
      this.slug = page.slug;
      this.content = page.currentContent ?? versions.find((v) => v.id === page.currentVersionId)?.content ?? '';
    } finally {
      this.loading.set(false);
    }
  }

  async saveMeta(): Promise<void> {
    this.error.set(null);
    this.saving.set(true);
    try {
      const updated = await this.cmsService.update(this.pageId, {
        title: this.title.trim(),
        slug: this.slug.trim(),
      });
      this.page.set(updated);
    } catch (err) {
      this.error.set(this.extractErrorMessage(err));
    } finally {
      this.saving.set(false);
    }
  }

  async saveContent(): Promise<void> {
    this.error.set(null);
    this.saving.set(true);
    try {
      await this.cmsService.createVersion(this.pageId, { content: this.content });
      await this.load();
    } catch (err) {
      this.error.set(this.extractErrorMessage(err));
    } finally {
      this.saving.set(false);
    }
  }

  async togglePublish(): Promise<void> {
    const page = this.page();
    if (!page) return;
    this.error.set(null);
    try {
      const updated = await this.cmsService.update(this.pageId, {
        status: page.status === 'published' ? 'draft' : 'published',
      });
      this.page.set(updated);
    } catch (err) {
      this.error.set(this.extractErrorMessage(err));
    }
  }

  async restore(version: CmsPageVersion): Promise<void> {
    if (!confirm('Khôi phục nội dung từ phiên bản này? Sẽ tạo một phiên bản mới với nội dung này.')) {
      return;
    }
    this.restoringId.set(version.id);
    try {
      await this.cmsService.restoreVersion(this.pageId, version.id);
      await this.load();
    } finally {
      this.restoringId.set(null);
    }
  }

  back(): void {
    void this.router.navigate(['/cms']);
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
