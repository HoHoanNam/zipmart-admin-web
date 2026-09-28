import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Coupon } from '../../core/models/coupon.model';
import { CouponsAdminService } from './coupons-admin.service';

/** Optional numeric/date fields as strings ('' = unset) — mirrors the `originalPrice` pattern already used in `products-admin`. */
interface CouponForm {
  code: string;
  discountPercent: number;
  active: boolean;
  expiresAt: string;
  usageLimit: string;
  minOrderAmount: string;
  perUserLimit: string;
}

const EMPTY_FORM: CouponForm = {
  code: '',
  discountPercent: 10,
  active: true,
  expiresAt: '',
  usageLimit: '',
  minOrderAmount: '',
  perUserLimit: '',
};

@Component({
  selector: 'app-coupons-admin',
  imports: [FormsModule, DatePipe, DecimalPipe],
  templateUrl: './coupons-admin.html',
})
export class CouponsAdmin {
  private readonly couponsService = inject(CouponsAdminService);

  readonly coupons = signal<Coupon[]>([]);
  readonly loading = signal(true);
  /** 'new' = creating, a coupon id = editing that coupon, null = form closed — same pattern as `categories-admin`/`banners-admin`. */
  readonly editingId = signal<string | null>(null);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly form = signal<CouponForm>({ ...EMPTY_FORM });

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      this.coupons.set(await this.couponsService.findAll());
    } finally {
      this.loading.set(false);
    }
  }

  isCreating(): boolean {
    return this.editingId() === 'new';
  }

  startCreate(): void {
    this.form.set({ ...EMPTY_FORM });
    this.error.set(null);
    this.editingId.set('new');
  }

  startEdit(coupon: Coupon): void {
    this.form.set({
      code: coupon.code,
      discountPercent: Number(coupon.discountPercent),
      active: coupon.active,
      expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : '',
      usageLimit: coupon.usageLimit !== null ? String(coupon.usageLimit) : '',
      minOrderAmount: coupon.minOrderAmount !== null ? String(Number(coupon.minOrderAmount)) : '',
      perUserLimit: coupon.perUserLimit !== null ? String(coupon.perUserLimit) : '',
    });
    this.error.set(null);
    this.editingId.set(coupon.id);
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  updateForm<K extends keyof CouponForm>(key: K, value: CouponForm[K]): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  async save(): Promise<void> {
    this.saving.set(true);
    this.error.set(null);
    try {
      const f = this.form();
      const id = this.editingId();
      if (id && id !== 'new') {
        // Editing: an emptied field means "clear it" (explicit `null`), not
        // "leave unchanged" — the form always reflects the coupon's full
        // state, so what's on screen at save time is what the coupon
        // should end up as.
        await this.couponsService.update(id, {
          discountPercent: f.discountPercent,
          active: f.active,
          expiresAt: f.expiresAt ? new Date(f.expiresAt).toISOString() : null,
          usageLimit: f.usageLimit ? Number(f.usageLimit) : null,
          minOrderAmount: f.minOrderAmount ? Number(f.minOrderAmount) : null,
          perUserLimit: f.perUserLimit ? Number(f.perUserLimit) : null,
        });
      } else {
        await this.couponsService.create({
          code: f.code,
          discountPercent: f.discountPercent,
          active: f.active,
          expiresAt: f.expiresAt ? new Date(f.expiresAt).toISOString() : undefined,
          usageLimit: f.usageLimit ? Number(f.usageLimit) : undefined,
          minOrderAmount: f.minOrderAmount ? Number(f.minOrderAmount) : undefined,
          perUserLimit: f.perUserLimit ? Number(f.perUserLimit) : undefined,
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

  async toggleActive(coupon: Coupon): Promise<void> {
    await this.couponsService.update(coupon.id, { active: !coupon.active });
    await this.load();
  }

  async remove(id: string): Promise<void> {
    if (!confirm('Xoá mã giảm giá này?')) return;
    await this.couponsService.remove(id);
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
