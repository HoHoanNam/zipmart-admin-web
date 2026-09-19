import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { CreateProductInput, Product } from '../../core/models/product.model';
import { VndCurrencyPipe } from '../../shared/pipes/vnd-currency.pipe';
import { ProductsAdminService } from './products-admin.service';

const EMPTY_FORM: CreateProductInput = { name: '', price: '0', stock: 0 };

@Component({
  selector: 'app-products-admin',
  imports: [FormsModule, VndCurrencyPipe],
  templateUrl: './products-admin.html',
})
export class ProductsAdmin {
  private readonly productsService = inject(ProductsAdminService);

  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly editingId = signal<string | null>(null);
  readonly form = signal<CreateProductInput>({ ...EMPTY_FORM });
  readonly saving = signal(false);

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      const page = await this.productsService.findAll({ limit: 100 });
      this.products.set(page.items);
    } finally {
      this.loading.set(false);
    }
  }

  startCreate(): void {
    this.editingId.set('new');
    this.form.set({ ...EMPTY_FORM });
  }

  startEdit(product: Product): void {
    this.editingId.set(product.id);
    this.form.set({
      name: product.name,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId,
    });
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  async save(): Promise<void> {
    this.saving.set(true);
    try {
      const id = this.editingId();
      if (id && id !== 'new') {
        await this.productsService.update(id, this.form());
      } else {
        await this.productsService.create(this.form());
      }
      this.editingId.set(null);
      await this.load();
    } finally {
      this.saving.set(false);
    }
  }

  async remove(id: string): Promise<void> {
    if (!confirm('Xoá sản phẩm này?')) return;
    await this.productsService.remove(id);
    await this.load();
  }

  updateForm<K extends keyof CreateProductInput>(key: K, value: CreateProductInput[K]): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }
}
