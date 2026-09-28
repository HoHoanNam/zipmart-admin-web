import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import type { AdminOrder, OrderStatus } from '../../core/models/order.model';
import { VndCurrencyPipe } from '../../shared/pipes/vnd-currency.pipe';
import { OrdersAdminService } from './orders-admin.service';

const STATUSES: OrderStatus[] = ['pending', 'paid', 'shipped', 'completed', 'cancelled'];

@Component({
  selector: 'app-orders-admin',
  imports: [DatePipe, VndCurrencyPipe],
  templateUrl: './orders-admin.html',
})
export class OrdersAdmin {
  private readonly ordersService = inject(OrdersAdminService);

  readonly orders = signal<AdminOrder[]>([]);
  readonly loading = signal(true);
  readonly statuses = STATUSES;

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      this.orders.set(await this.ordersService.findAll());
    } finally {
      this.loading.set(false);
    }
  }

  async changeStatus(order: AdminOrder, status: string): Promise<void> {
    const note = prompt('Ghi chú vận chuyển cho lần cập nhật này (không bắt buộc):');
    await this.ordersService.updateStatus(order.id, status as OrderStatus, note?.trim() || undefined);
    await this.load();
  }
}
