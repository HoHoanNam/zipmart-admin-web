import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { CreatePurchaseOrderInput, PurchaseOrder } from '../../core/models/purchase-order.model';

@Injectable({ providedIn: 'root' })
export class PurchaseOrdersAdminService {
  private readonly http = inject(HttpClient);

  findAll(): Promise<PurchaseOrder[]> {
    return firstValueFrom(this.http.get<PurchaseOrder[]>(`${environment.apiUrl}/purchase-orders`));
  }

  create(input: CreatePurchaseOrderInput): Promise<PurchaseOrder> {
    return firstValueFrom(
      this.http.post<PurchaseOrder>(`${environment.apiUrl}/purchase-orders`, input),
    );
  }

  /** Marks the PO received: backend adds each line's quantity to `Product.stock` and writes a `stock_movements` row per line (reusing the existing table, per the plan doc — not a new one). */
  receive(id: string): Promise<PurchaseOrder> {
    return firstValueFrom(
      this.http.post<PurchaseOrder>(`${environment.apiUrl}/purchase-orders/${id}/receive`, {}),
    );
  }

  cancel(id: string): Promise<PurchaseOrder> {
    return firstValueFrom(
      this.http.post<PurchaseOrder>(`${environment.apiUrl}/purchase-orders/${id}/cancel`, {}),
    );
  }
}
