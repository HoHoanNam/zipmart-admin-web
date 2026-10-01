import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataTable } from '../../shared/components/data-table/data-table';
import { DataTableCellDirective } from '../../shared/components/data-table/data-table-cell.directive';
import type { DataTableColumn } from '../../shared/components/data-table/data-table.model';
import { Modal } from '../../shared/components/modal/modal';
import type { CreateSupplierInput, Supplier } from '../../core/models/supplier.model';
import { SuppliersAdminService } from './suppliers-admin.service';

const EMPTY_FORM: CreateSupplierInput = {
  name: '',
  contactName: '',
  phoneNumber: '',
  email: '',
  address: '',
};

const COLUMNS: DataTableColumn[] = [
  { key: 'name', label: 'Tên nhà cung cấp' },
  { key: 'contactName', label: 'Người liên hệ' },
  { key: 'phoneNumber', label: 'Điện thoại' },
  { key: 'email', label: 'Email' },
  { key: 'createdAt', label: 'Ngày tạo' },
  { key: 'actions', label: '', align: 'right' },
];

@Component({
  selector: 'app-suppliers-admin',
  imports: [FormsModule, DatePipe, DataTable, DataTableCellDirective, Modal],
  templateUrl: './suppliers-admin.html',
})
export class SuppliersAdmin {
  private readonly suppliersService = inject(SuppliersAdminService);

  readonly columns = COLUMNS;
  readonly suppliers = signal<Supplier[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly editingId = signal<string | null>(null);
  readonly form = signal<CreateSupplierInput>({ ...EMPTY_FORM });

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      this.suppliers.set(await this.suppliersService.findAll());
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

  startEdit(supplier: Supplier): void {
    this.form.set({
      name: supplier.name,
      contactName: supplier.contactName ?? '',
      phoneNumber: supplier.phoneNumber ?? '',
      email: supplier.email ?? '',
      address: supplier.address ?? '',
    });
    this.error.set(null);
    this.editingId.set(supplier.id);
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  updateForm<K extends keyof CreateSupplierInput>(key: K, value: CreateSupplierInput[K]): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  async save(): Promise<void> {
    this.saving.set(true);
    this.error.set(null);
    try {
      const f = this.form();
      const id = this.editingId();
      if (id && id !== 'new') {
        await this.suppliersService.update(id, f);
      } else {
        await this.suppliersService.create(f);
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
    if (!confirm('Xoá nhà cung cấp này?')) return;
    await this.suppliersService.remove(id);
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
