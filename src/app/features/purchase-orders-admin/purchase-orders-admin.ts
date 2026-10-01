import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataTable } from '../../shared/components/data-table/data-table';
import { DataTableCellDirective } from '../../shared/components/data-table/data-table-cell.directive';
import type { DataTableColumn } from '../../shared/components/data-table/data-table.model';
import { Modal } from '../../shared/components/modal/modal';
import type { Product } from '../../core/models/product.model';
import type { CreatePurchaseOrderItemInput, PurchaseOrder } from '../../core/models/purchase-order.model';
import type { Supplier } from '../../core/models/supplier.model';
import { ProductsAdminService } from '../products-admin/products-admin.service';
import { SuppliersAdminService } from '../suppliers-admin/suppliers-admin.service';
import { PurchaseOrdersAdminService } from './purchase-orders-admin.service';

const COLUMNS: DataTableColumn[] = [
  { key: 'id', label: 'Mã đơn' },
  { key: 'supplierName', label: 'Nhà cung cấp' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'totalAmount', label: 'Tổng giá trị', align: 'right' },
  { key: 'createdAt', label: 'Ngày tạo' },
  { key: 'actions', label: '', align: 'right' },
];

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ nhận hàng',
  received: 'Đã nhận hàng',
  cancelled: 'Đã huỷ',
};

interface LineItemForm {
  productId: string;
  quantity: number;
  unitCost: string;
}

@Component({
  selector: 'app-purchase-orders-admin',
  imports: [FormsModule, DatePipe, DecimalPipe, DataTable, DataTableCellDirective, Modal],
  templateUrl: './purchase-orders-admin.html',
})
export class PurchaseOrdersAdmin {
  private readonly purchaseOrdersService = inject(PurchaseOrdersAdminService);
  private readonly suppliersService = inject(SuppliersAdminService);
  private readonly productsService = inject(ProductsAdminService);

  readonly columns = COLUMNS;
  readonly statusLabels = STATUS_LABELS;

  readonly orders = signal<PurchaseOrder[]>([]);
  readonly suppliers = signal<Supplier[]>([]);
  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly busyId = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  readonly creating = signal(false);
  supplierId = '';
  lines = signal<LineItemForm[]>([{ productId: '', quantity: 1, unitCost: '' }]);

  readonly estimatedTotal = computed(() =>
    this.lines().reduce((sum, line) => sum + line.quantity * Number(line.unitCost || 0), 0),
  );

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      const [orders, suppliers, productPage] = await Promise.all([
        this.purchaseOrdersService.findAll(),
        this.suppliersService.findAll(),
        this.productsService.findAll({ limit: 200 }),
      ]);
      this.orders.set(orders);
      this.suppliers.set(suppliers);
      this.products.set(productPage.items);
    } finally {
      this.loading.set(false);
    }
  }

  statusLabel(status: string): string {
    return STATUS_LABELS[status] ?? status;
  }

  supplierName(order: PurchaseOrder): string {
    return order.supplierName ?? this.suppliers().find((s) => s.id === order.supplierId)?.name ?? '—';
  }

  startCreate(): void {
    this.error.set(null);
    this.supplierId = '';
    this.lines.set([{ productId: '', quantity: 1, unitCost: '' }]);
    this.creating.set(true);
  }

  closeCreate(): void {
    this.creating.set(false);
  }

  addLine(): void {
    this.lines.update((list) => [...list, { productId: '', quantity: 1, unitCost: '' }]);
  }

  removeLine(index: number): void {
    this.lines.update((list) => list.filter((_, i) => i !== index));
  }

  updateLine<K extends keyof LineItemForm>(index: number, key: K, value: LineItemForm[K]): void {
    this.lines.update((list) =>
      list.map((line, i) => (i === index ? { ...line, [key]: value } : line)),
    );
  }

  async save(): Promise<void> {
    this.error.set(null);
    const items: CreatePurchaseOrderItemInput[] = this.lines()
      .filter((line) => line.productId && line.quantity > 0)
      .map((line) => ({ productId: line.productId, quantity: line.quantity, unitCost: line.unitCost || '0' }));

    if (!this.supplierId || items.length === 0) {
      this.error.set('Chọn nhà cung cấp và ít nhất 1 dòng sản phẩm hợp lệ.');
      return;
    }

    this.saving.set(true);
    try {
      await this.purchaseOrdersService.create({ supplierId: this.supplierId, items });
      this.creating.set(false);
      await this.load();
    } catch (err) {
      this.error.set(this.extractErrorMessage(err));
    } finally {
      this.saving.set(false);
    }
  }

  async receive(order: PurchaseOrder): Promise<void> {
    if (!confirm(`Xác nhận đã nhận hàng cho đơn nhập #${order.id.slice(0, 8)}? Thao tác này sẽ cộng tồn kho.`)) {
      return;
    }
    this.busyId.set(order.id);
    try {
      await this.purchaseOrdersService.receive(order.id);
      await this.load();
    } finally {
      this.busyId.set(null);
    }
  }

  async cancel(order: PurchaseOrder): Promise<void> {
    if (!confirm('Huỷ đơn nhập hàng này?')) return;
    this.busyId.set(order.id);
    try {
      await this.purchaseOrdersService.cancel(order.id);
      await this.load();
    } finally {
      this.busyId.set(null);
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
