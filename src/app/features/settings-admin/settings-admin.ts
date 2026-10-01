import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataTable } from '../../shared/components/data-table/data-table';
import { DataTableCellDirective } from '../../shared/components/data-table/data-table-cell.directive';
import type { DataTableColumn } from '../../shared/components/data-table/data-table.model';
import { Modal } from '../../shared/components/modal/modal';
import type { Setting } from '../../core/models/setting.model';
import { SettingsAdminService } from './settings-admin.service';

const LABELS: Record<string, string> = {
  shipping_fee: 'Phí vận chuyển (₫)',
  vat_rate: 'Thuế VAT (%)',
  payment_gateway_enabled: 'Cổng thanh toán online',
};

const COLUMNS: DataTableColumn[] = [
  { key: 'key', label: 'Khoá cấu hình' },
  { key: 'value', label: 'Giá trị hiện tại' },
  { key: 'updatedAt', label: 'Cập nhật lúc' },
  { key: 'actions', label: '', align: 'right' },
];

@Component({
  selector: 'app-settings-admin',
  imports: [FormsModule, DatePipe, DataTable, DataTableCellDirective, Modal],
  templateUrl: './settings-admin.html',
})
export class SettingsAdmin {
  private readonly settingsService = inject(SettingsAdminService);

  readonly columns = COLUMNS;
  readonly labels = LABELS;

  readonly settings = signal<Setting[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly saving = signal(false);

  readonly editing = signal<Setting | null>(null);
  /** Bound to the modal's input(s) — string for text/number/JSON, coerced on save based on the setting's inferred type. */
  editValue = '';
  editBoolValue = false;

  readonly isBooleanSetting = computed(() => typeof this.editing()?.value === 'boolean');
  readonly isNumberSetting = computed(() => typeof this.editing()?.value === 'number');

  constructor() {
    void this.load();
  }

  labelFor(key: string): string {
    return LABELS[key] ?? key;
  }

  displayValue(value: unknown): string {
    if (typeof value === 'boolean') return value ? 'Đã bật / đã cấu hình' : 'Đã tắt / chưa cấu hình';
    if (typeof value === 'object' && value !== null) return JSON.stringify(value);
    return String(value);
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      this.settings.set(await this.settingsService.findAll());
    } finally {
      this.loading.set(false);
    }
  }

  startEdit(setting: Setting): void {
    this.error.set(null);
    this.editing.set(setting);
    if (typeof setting.value === 'boolean') {
      this.editBoolValue = setting.value;
    } else if (typeof setting.value === 'object' && setting.value !== null) {
      this.editValue = JSON.stringify(setting.value, null, 2);
    } else {
      this.editValue = String(setting.value);
    }
  }

  closeEdit(): void {
    this.editing.set(null);
  }

  async save(): Promise<void> {
    const setting = this.editing();
    if (!setting) return;
    this.saving.set(true);
    this.error.set(null);
    try {
      const value = this.parseValueForSave(setting);
      await this.settingsService.update(setting.key, value);
      this.editing.set(null);
      await this.load();
    } catch (err) {
      this.error.set(this.extractErrorMessage(err));
    } finally {
      this.saving.set(false);
    }
  }

  private parseValueForSave(setting: Setting): unknown {
    if (typeof setting.value === 'boolean') return this.editBoolValue;
    if (typeof setting.value === 'number') {
      const num = Number(this.editValue);
      if (Number.isNaN(num)) throw new Error('Giá trị phải là số.');
      return num;
    }
    if (typeof setting.value === 'object' && setting.value !== null) {
      try {
        return JSON.parse(this.editValue);
      } catch {
        throw new Error('JSON không hợp lệ.');
      }
    }
    return this.editValue;
  }

  private extractErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const flattened = this.flattenMessage((err.error as { message?: unknown } | undefined)?.message);
      if (flattened) return flattened;
    }
    if (err instanceof Error) return err.message;
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
