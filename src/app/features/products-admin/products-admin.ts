import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Category } from '../../core/models/category.model';
import type { CreateProductInput, Product, VariantInput } from '../../core/models/product.model';
import { VndCurrencyPipe } from '../../shared/pipes/vnd-currency.pipe';
import { CategoriesService } from './categories.service';
import { ProductsAdminService } from './products-admin.service';
import { UploadsService } from './uploads.service';

const MAX_IMAGES = 5;

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;
// keep in sync with apparel-attributes.dto.ts (backend-nest)
// and product-detail.ts (frontend-web)

const EMPTY_FORM: CreateProductInput = {
  name: '',
  price: '0',
  originalPrice: '',
  stock: 0,
  categoryId: null,
  images: [],
  attributes: {},
};

interface DimensionsForm {
  length: string;
  width: string;
  height: string;
}

const EMPTY_DIMENSIONS: DimensionsForm = { length: '', width: '', height: '' };

@Component({
  selector: 'app-products-admin',
  imports: [FormsModule, VndCurrencyPipe],
  templateUrl: './products-admin.html',
})
export class ProductsAdmin {
  private readonly productsService = inject(ProductsAdminService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly uploadsService = inject(UploadsService);

  readonly products = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly loading = signal(true);
  readonly editingId = signal<string | null>(null);
  readonly form = signal<CreateProductInput>({ ...EMPTY_FORM });
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly uploadingCount = signal(0);

  /** Free-form key-value rows for `attributes.specs` (electronics only). */
  readonly specRows = signal<{ key: string; value: string }[]>([]);
  /** Comma-separated text for `attributes.allergens` (food only). */
  readonly allergensText = signal('');
  /** `attributes.dimensionsCm` (household only). */
  readonly dimensions = signal<DimensionsForm>({ ...EMPTY_DIMENSIONS });
  /** Fixed size options for `attributes.sizes` (apparel only). */
  readonly sizeOptions = SIZE_OPTIONS;
  /** Which of `sizeOptions` are toggled on for `attributes.sizes` (apparel only). */
  readonly selectedSizes = signal<string[]>([]);
  /** Rows for `attributes.colors` / `attributes.colorImages` (apparel only). */
  readonly colorRows = signal<{ name: string; imageUrl: string | null }[]>([]);

  /** Real per-size/color price+stock — opt-in, coexists with the cosmetic colorRows/sizeOptions above. */
  readonly variantsEnabled = signal(false);
  readonly variantRows = signal<VariantInput[]>([]);

  readonly selectedCategory = computed<Category | null>(() => {
    const id = this.form().categoryId;
    return this.categories().find((c) => c.id === id) ?? null;
  });

  constructor() {
    void this.load();
    void this.loadCategories();
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

  private async loadCategories(): Promise<void> {
    this.categories.set(await this.categoriesService.getAll());
  }

  categoryName(product: Product): string {
    return this.categories().find((c) => c.id === product.categoryId)?.name ?? '—';
  }

  startCreate(): void {
    this.editingId.set('new');
    this.form.set({ ...EMPTY_FORM, images: [] });
    this.resetAttributeState();
    this.error.set(null);
  }

  startEdit(product: Product): void {
    this.editingId.set(product.id);
    this.form.set({
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice ?? '',
      stock: product.stock,
      categoryId: product.categoryId,
      brand: product.brand ?? undefined,
      description: product.description ?? undefined,
      images: [...product.images],
      weightGrams: product.weightGrams ?? undefined,
      attributes: { ...product.attributes },
    });
    const category = this.categories().find((c) => c.id === product.categoryId);
    this.populateAttributeState(category?.slug, product.attributes);
    this.variantsEnabled.set((product.variants?.length ?? 0) > 0);
    this.variantRows.set(
      (product.variants ?? []).map((v) => ({
        size: v.size ?? '',
        color: v.color ?? '',
        sku: v.sku,
        price: v.price ?? '',
        stock: v.stock,
      })),
    );
    this.error.set(null);
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.error.set(null);
  }

  onCategoryChange(categoryId: string): void {
    this.form.update((f) => ({ ...f, categoryId, attributes: {} }));
    this.resetAttributeState();
  }

  private resetAttributeState(): void {
    this.specRows.set([]);
    this.allergensText.set('');
    this.dimensions.set({ ...EMPTY_DIMENSIONS });
    this.selectedSizes.set([]);
    this.colorRows.set([]);
    this.variantsEnabled.set(false);
    this.variantRows.set([]);
  }

  addVariantRow(): void {
    this.variantRows.update((rows) => [...rows, { size: '', color: '', sku: '', price: '', stock: 0 }]);
  }

  updateVariantRow<K extends keyof VariantInput>(index: number, field: K, value: VariantInput[K]): void {
    this.variantRows.update((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  }

  removeVariantRow(index: number): void {
    this.variantRows.update((rows) => rows.filter((_, i) => i !== index));
  }

  private populateAttributeState(slug: string | undefined, attributes: Record<string, unknown>): void {
    this.specRows.set(
      slug === 'electronics' && attributes['specs']
        ? Object.entries(attributes['specs'] as Record<string, string>).map(([key, value]) => ({
            key,
            value,
          }))
        : [],
    );

    this.allergensText.set(
      slug === 'food' && Array.isArray(attributes['allergens'])
        ? (attributes['allergens'] as string[]).join(', ')
        : '',
    );

    const dims =
      slug === 'household'
        ? (attributes['dimensionsCm'] as { length: number; width: number; height: number } | undefined)
        : undefined;
    this.dimensions.set({
      length: dims?.length !== undefined ? String(dims.length) : '',
      width: dims?.width !== undefined ? String(dims.width) : '',
      height: dims?.height !== undefined ? String(dims.height) : '',
    });

    this.selectedSizes.set(
      slug === 'apparel' && Array.isArray(attributes['sizes'])
        ? (attributes['sizes'] as string[]).filter((size) =>
            (SIZE_OPTIONS as readonly string[]).includes(size),
          )
        : [],
    );

    const colorImages =
      slug === 'apparel' ? (attributes['colorImages'] as Record<string, string> | undefined) : undefined;
    this.colorRows.set(
      slug === 'apparel' && Array.isArray(attributes['colors'])
        ? (attributes['colors'] as string[]).map((name) => ({
            name,
            imageUrl: colorImages?.[name] ?? null,
          }))
        : [],
    );
  }

  updateForm<K extends keyof CreateProductInput>(key: K, value: CreateProductInput[K]): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  updateAttribute(key: string, value: unknown): void {
    this.form.update((f) => ({ ...f, attributes: { ...f.attributes, [key]: value } }));
  }

  addSpecRow(): void {
    this.specRows.update((rows) => [...rows, { key: '', value: '' }]);
  }

  updateSpecRow(index: number, field: 'key' | 'value', value: string): void {
    this.specRows.update((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  }

  removeSpecRow(index: number): void {
    this.specRows.update((rows) => rows.filter((_, i) => i !== index));
  }

  updateDimension(field: keyof DimensionsForm, value: string): void {
    this.dimensions.update((d) => ({ ...d, [field]: value }));
  }

  toggleSize(size: string): void {
    this.selectedSizes.update((sizes) =>
      sizes.includes(size) ? sizes.filter((s) => s !== size) : [...sizes, size],
    );
  }

  addColorRow(): void {
    this.colorRows.update((rows) => [...rows, { name: '', imageUrl: null }]);
  }

  updateColorRow(index: number, field: 'name' | 'imageUrl', value: string): void {
    this.colorRows.update((rows) =>
      rows.map((row, i) =>
        i === index ? { ...row, [field]: field === 'imageUrl' ? value || null : value } : row,
      ),
    );
  }

  removeColorRow(index: number): void {
    this.colorRows.update((rows) => rows.filter((_, i) => i !== index));
  }

  async onFilesSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    input.value = '';
    if (files.length === 0) return;

    const remainingSlots = MAX_IMAGES - this.form().images.length;
    const filesToUpload = files.slice(0, remainingSlots);
    if (files.length > filesToUpload.length) {
      this.error.set(`Chỉ được tối đa ${MAX_IMAGES} ảnh — một số ảnh đã bị bỏ qua.`);
    }

    for (const file of filesToUpload) {
      this.uploadingCount.update((n) => n + 1);
      try {
        const { url } = await this.uploadsService.upload(file);
        this.form.update((f) => ({ ...f, images: [...f.images, url] }));
      } catch (err) {
        this.error.set(this.extractErrorMessage(err));
      } finally {
        this.uploadingCount.update((n) => n - 1);
      }
    }
  }

  removeImage(index: number): void {
    this.form.update((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  }

  async save(): Promise<void> {
    this.error.set(null);
    this.saving.set(true);
    try {
      const payload: CreateProductInput = {
        ...this.form(),
        originalPrice: this.form().originalPrice?.trim() ? this.form().originalPrice : undefined,
        attributes: this.buildAttributesForSave(),
        variants: this.variantsEnabled()
          ? this.variantRows().map((v) => ({
              size: v.size?.trim() || undefined,
              color: v.color?.trim() || undefined,
              sku: v.sku.trim(),
              price: v.price?.toString().trim() ? v.price : undefined,
              stock: v.stock,
            }))
          : undefined,
      };
      const id = this.editingId();
      if (id && id !== 'new') {
        await this.productsService.update(id, payload);
      } else {
        await this.productsService.create(payload);
      }
      this.editingId.set(null);
      await this.load();
    } catch (err) {
      this.error.set(this.extractErrorMessage(err));
    } finally {
      this.saving.set(false);
    }
  }

  private buildAttributesForSave(): Record<string, unknown> {
    const base = { ...this.form().attributes };
    const slug = this.selectedCategory()?.slug;

    if (slug === 'electronics') {
      const specs = Object.fromEntries(
        this.specRows()
          .filter((row) => row.key.trim().length > 0)
          .map((row) => [row.key.trim(), row.value]),
      );
      return { ...base, specs: Object.keys(specs).length > 0 ? specs : undefined };
    }

    if (slug === 'food') {
      const allergens = this.allergensText()
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      return { ...base, allergens: allergens.length > 0 ? allergens : undefined };
    }

    if (slug === 'apparel') {
      const colors = this.colorRows().filter((row) => row.name.trim().length > 0);
      const colorImages = Object.fromEntries(
        colors
          .filter((row): row is { name: string; imageUrl: string } => !!row.imageUrl)
          .map((row) => [row.name.trim(), row.imageUrl]),
      );
      return {
        ...base,
        sizes: this.selectedSizes(),
        colors: colors.map((row) => row.name.trim()),
        colorImages: Object.keys(colorImages).length > 0 ? colorImages : undefined,
      };
    }

    if (slug === 'household') {
      const { length, width, height } = this.dimensions();
      if (length && width && height) {
        return {
          ...base,
          dimensionsCm: { length: Number(length), width: Number(width), height: Number(height) },
        };
      }
      return { ...base, dimensionsCm: undefined };
    }

    return base;
  }

  async remove(id: string): Promise<void> {
    if (!confirm('Xoá sản phẩm này?')) return;
    await this.productsService.remove(id);
    await this.load();
  }

  private extractErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error as { message?: unknown } | undefined;
      const flattened = this.flattenErrorMessage(body?.message);
      if (flattened) return flattened;
    }
    return 'Đã có lỗi xảy ra. Vui lòng thử lại.';
  }

  /**
   * Nest's error body shape is inconsistent depending on how the exception was
   * thrown: a plain string, an array of validator messages, or (due to the
   * global HttpExceptionFilter re-wrapping `exception.getResponse()`) a
   * nested `{ message: string | string[] }` object. Handle all 3.
   */
  private flattenErrorMessage(message: unknown): string | null {
    if (typeof message === 'string') return message;
    if (Array.isArray(message)) return message.join('; ');
    if (message && typeof message === 'object' && 'message' in message) {
      return this.flattenErrorMessage((message as { message?: unknown }).message);
    }
    return null;
  }
}
