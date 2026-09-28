import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Category } from '../../core/models/category.model';
import { CategoriesService } from '../products-admin/categories.service';

interface CategoryForm {
  name: string;
  slug: string;
  imageUrl: string;
}

const EMPTY_FORM: CategoryForm = { name: '', slug: '', imageUrl: '' };

@Component({
  selector: 'app-categories-admin',
  imports: [FormsModule, DatePipe],
  templateUrl: './categories-admin.html',
})
export class CategoriesAdmin {
  private readonly categoriesService = inject(CategoriesService);

  readonly categories = signal<Category[]>([]);
  readonly loading = signal(true);
  /** 'new' = creating, a category id = editing that category, null = form closed. */
  readonly editingId = signal<string | null>(null);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly form = signal<CategoryForm>({ ...EMPTY_FORM });

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      this.categories.set(await this.categoriesService.getAll());
    } finally {
      this.loading.set(false);
    }
  }

  startCreate(): void {
    this.form.set({ ...EMPTY_FORM });
    this.error.set(null);
    this.editingId.set('new');
  }

  startEdit(category: Category): void {
    this.form.set({ name: category.name, slug: category.slug, imageUrl: category.imageUrl ?? '' });
    this.error.set(null);
    this.editingId.set(category.id);
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  updateForm<K extends keyof CategoryForm>(key: K, value: CategoryForm[K]): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  isCreating(): boolean {
    return this.editingId() === 'new';
  }

  async save(): Promise<void> {
    this.saving.set(true);
    this.error.set(null);
    try {
      const id = this.editingId();
      const { name, slug, imageUrl } = this.form();
      if (id && id !== 'new') {
        await this.categoriesService.update(id, {
          name: name.trim(),
          imageUrl: imageUrl.trim() || undefined,
        });
      } else {
        await this.categoriesService.create({
          name: name.trim(),
          slug: slug.trim() || undefined,
          imageUrl: imageUrl.trim() || undefined,
        });
      }
      this.editingId.set(null);
      await this.load();
    } catch (err) {
      this.error.set(this.extractErrorMessage(err));
    } finally {
      this.saving.set(false);
    }
  }

  async remove(id: string): Promise<void> {
    if (!confirm('Xoá danh mục này?')) return;
    this.error.set(null);
    try {
      await this.categoriesService.remove(id);
      await this.load();
    } catch (err) {
      this.error.set(this.extractErrorMessage(err));
    }
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
