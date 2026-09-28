import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '../../core/models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly http = inject(HttpClient);
  private readonly categoriesSignal = signal<Category[] | null>(null);
  private loadPromise: Promise<Category[]> | null = null;

  async getAll(): Promise<Category[]> {
    const cached = this.categoriesSignal();
    if (cached) return cached;

    this.loadPromise ??= firstValueFrom(
      this.http.get<Category[]>(`${environment.apiUrl}/categories`),
    ).then((categories) => {
      this.categoriesSignal.set(categories);
      return categories;
    });
    return this.loadPromise;
  }

  /** Clears the cache and re-fetches — call after create/update/remove so the products-admin category dropdown (which uses `getAll()`) reflects the change without a page reload. */
  async refresh(): Promise<Category[]> {
    this.categoriesSignal.set(null);
    this.loadPromise = null;
    return this.getAll();
  }

  async create(input: CreateCategoryInput): Promise<Category> {
    const category = await firstValueFrom(
      this.http.post<Category>(`${environment.apiUrl}/categories`, input),
    );
    await this.refresh();
    return category;
  }

  async update(id: string, input: UpdateCategoryInput): Promise<Category> {
    const category = await firstValueFrom(
      this.http.patch<Category>(`${environment.apiUrl}/categories/${id}`, input),
    );
    await this.refresh();
    return category;
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${environment.apiUrl}/categories/${id}`));
    await this.refresh();
  }
}
