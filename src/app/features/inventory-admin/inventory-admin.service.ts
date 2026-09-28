import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { Product } from '../../core/models/product.model';
import type { StockMovement } from '../../core/models/stock-movement.model';

@Injectable({ providedIn: 'root' })
export class InventoryAdminService {
  private readonly http = inject(HttpClient);

  findLowStock(): Promise<Product[]> {
    return firstValueFrom(this.http.get<Product[]>(`${environment.apiUrl}/products/low-stock`));
  }

  adjustStock(productId: string, change: number, reason: string): Promise<Product> {
    return firstValueFrom(
      this.http.post<Product>(`${environment.apiUrl}/products/${productId}/stock-adjust`, {
        change,
        reason,
      }),
    );
  }

  findMovements(productId: string): Promise<StockMovement[]> {
    return firstValueFrom(
      this.http.get<StockMovement[]>(`${environment.apiUrl}/products/${productId}/stock-movements`),
    );
  }

  updateThreshold(productId: string, threshold: number | null): Promise<Product> {
    return firstValueFrom(
      this.http.patch<Product>(
        `${environment.apiUrl}/products/${productId}/low-stock-threshold`,
        { threshold },
      ),
    );
  }
}
