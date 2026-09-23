import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Banner, CreateBannerInput } from '../../core/models/banner.model';
import { BannersAdminService } from './banners-admin.service';

const EMPTY_FORM: CreateBannerInput = {
  imageUrl: '',
  headline: '',
  subtext: '',
  ctaLabel: '',
  ctaLink: '',
  sortOrder: 0,
  active: true,
};

@Component({
  selector: 'app-banners-admin',
  imports: [FormsModule, DatePipe],
  templateUrl: './banners-admin.html',
})
export class BannersAdmin {
  private readonly bannersService = inject(BannersAdminService);

  readonly banners = signal<Banner[]>([]);
  readonly loading = signal(true);
  /** 'new' = creating, a banner id = editing that banner, null = form closed. */
  readonly editingId = signal<string | null>(null);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly form = signal<CreateBannerInput>({ ...EMPTY_FORM });

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      this.banners.set(await this.bannersService.findAll());
    } finally {
      this.loading.set(false);
    }
  }

  startCreate(): void {
    this.form.set({ ...EMPTY_FORM });
    this.error.set(null);
    this.editingId.set('new');
  }

  startEdit(banner: Banner): void {
    this.form.set({
      imageUrl: banner.imageUrl,
      headline: banner.headline,
      subtext: banner.subtext ?? '',
      ctaLabel: banner.ctaLabel ?? '',
      ctaLink: banner.ctaLink ?? '',
      sortOrder: banner.sortOrder,
      active: banner.active,
    });
    this.error.set(null);
    this.editingId.set(banner.id);
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  updateForm<K extends keyof CreateBannerInput>(key: K, value: CreateBannerInput[K]): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  async save(): Promise<void> {
    this.saving.set(true);
    this.error.set(null);
    try {
      const id = this.editingId();
      if (id && id !== 'new') {
        await this.bannersService.update(id, this.form());
      } else {
        await this.bannersService.create(this.form());
      }
      this.editingId.set(null);
      await this.load();
    } catch (err) {
      this.error.set(this.extractErrorMessage(err));
    } finally {
      this.saving.set(false);
    }
  }

  async toggleActive(banner: Banner): Promise<void> {
    await this.bannersService.update(banner.id, { active: !banner.active });
    await this.load();
  }

  async remove(id: string): Promise<void> {
    if (!confirm('Xoá banner này?')) return;
    await this.bannersService.remove(id);
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
