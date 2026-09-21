import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Coupon, CreateCouponInput } from '../../core/models/coupon.model';
import { CouponsAdminService } from './coupons-admin.service';

const EMPTY_FORM: CreateCouponInput = { code: '', discountPercent: 10, active: true };

@Component({
  selector: 'app-coupons-admin',
  imports: [FormsModule, DatePipe],
  templateUrl: './coupons-admin.html',
})
export class CouponsAdmin {
  private readonly couponsService = inject(CouponsAdminService);

  readonly coupons = signal<Coupon[]>([]);
  readonly loading = signal(true);
  readonly creating = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly form = signal<CreateCouponInput>({ ...EMPTY_FORM });

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

  startCreate(): void {
    this.form.set({ ...EMPTY_FORM });
    this.error.set(null);
    this.creating.set(true);
  }

  cancelCreate(): void {
    this.creating.set(false);
  }

  updateForm<K extends keyof CreateCouponInput>(key: K, value: CreateCouponInput[K]): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  async save(): Promise<void> {
    this.saving.set(true);
    this.error.set(null);
    try {
      await this.couponsService.create(this.form());
      this.creating.set(false);
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
