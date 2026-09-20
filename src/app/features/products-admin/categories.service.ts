import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { Category } from '../../core/models/category.model';

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
}
