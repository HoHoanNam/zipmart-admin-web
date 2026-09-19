import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { AdminOrder, OrderStatus } from '../../core/models/order.model';

@Injectable({ providedIn: 'root' })
export class OrdersAdminService {
  private readonly http = inject(HttpClient);

  findAll(): Promise<AdminOrder[]> {
    return firstValueFrom(this.http.get<AdminOrder[]>(`${environment.apiUrl}/orders/admin`));
  }

  updateStatus(id: string, status: OrderStatus): Promise<AdminOrder> {
    return firstValueFrom(
      this.http.patch<AdminOrder>(`${environment.apiUrl}/orders/${id}/status`, { status }),
    );
  }
}
