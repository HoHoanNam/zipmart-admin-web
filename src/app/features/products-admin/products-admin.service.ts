import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { CreateProductInput, Product, ProductPage } from '../../core/models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductsAdminService {
  private readonly http = inject(HttpClient);

  findAll(params: { search?: string; page?: number; limit?: number } = {}): Promise<ProductPage> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    query.set('page', String(params.page ?? 1));
    query.set('limit', String(params.limit ?? 20));

    return firstValueFrom(
      this.http.get<ProductPage>(`${environment.apiUrl}/products?${query.toString()}`),
    );
  }

  create(input: CreateProductInput): Promise<Product> {
    return firstValueFrom(this.http.post<Product>(`${environment.apiUrl}/products`, input));
  }

  update(id: string, input: Partial<CreateProductInput>): Promise<Product> {
    return firstValueFrom(
      this.http.patch<Product>(`${environment.apiUrl}/products/${id}`, input),
    );
  }

  remove(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${environment.apiUrl}/products/${id}`));
  }
}
