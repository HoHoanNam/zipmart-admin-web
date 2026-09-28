import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Product } from '../../core/models/product.model';
import type { StockMovement } from '../../core/models/stock-movement.model';
import { ProductsAdminService } from '../products-admin/products-admin.service';
import { InventoryAdminService } from './inventory-admin.service';

@Component({
  selector: 'app-inventory-admin',
  imports: [FormsModule],
  templateUrl: './inventory-admin.html',
})
export class InventoryAdmin {
  private readonly inventoryService = inject(InventoryAdminService);
  private readonly productsAdminService = inject(ProductsAdminService);

  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly lowStockOnly = signal(false);
  readonly error = signal<string | null>(null);

  /** Which product row currently has its adjust/history panel expanded — null = all collapsed. */
  readonly expandedId = signal<string | null>(null);
  readonly adjustChange = signal<number | null>(null);
  readonly adjustReason = signal('');
  readonly saving = signal(false);
  readonly movements = signal<StockMovement[]>([]);

  readonly lowStockThreshold = (product: Product): number => product.lowStockThreshold ?? 10;
  readonly isLowStock = (product: Product): boolean => product.stock < this.lowStockThreshold(product);

  constructor() {
    void this.load();
  }

  async toggleLowStockOnly(): Promise<void> {
    this.lowStockOnly.update((v) => !v);
    await this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      this.products.set(
        this.lowStockOnly()
          ? await this.inventoryService.findLowStock()
          : (await this.productsAdminService.findAll({ limit: 100 })).items,
      );
    } finally {
      this.loading.set(false);
    }
  }

  async toggleExpand(product: Product): Promise<void> {
    if (this.expandedId() === product.id) {
      this.expandedId.set(null);
      return;
    }
    this.expandedId.set(product.id);
    this.adjustChange.set(null);
    this.adjustReason.set('');
    this.error.set(null);
    this.movements.set(await this.inventoryService.findMovements(product.id));
  }

  async submitAdjustment(product: Product): Promise<void> {
    const change = this.adjustChange();
    const reason = this.adjustReason().trim();
    if (!change || !reason) return;

    this.saving.set(true);
    this.error.set(null);
    try {
      await this.inventoryService.adjustStock(product.id, change, reason);
      this.movements.set(await this.inventoryService.findMovements(product.id));
      this.adjustChange.set(null);
      this.adjustReason.set('');
      await this.load();
    } catch (err) {
      this.error.set(this.extractErrorMessage(err));
    } finally {
      this.saving.set(false);
    }
  }

  async updateThreshold(product: Product, value: string): Promise<void> {
    const threshold = value.trim() ? Number(value) : null;
    await this.inventoryService.updateThreshold(product.id, threshold);
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
