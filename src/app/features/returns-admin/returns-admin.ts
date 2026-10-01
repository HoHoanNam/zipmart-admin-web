import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataTable } from '../../shared/components/data-table/data-table';
import { DataTableCellDirective } from '../../shared/components/data-table/data-table-cell.directive';
import type { DataTableColumn } from '../../shared/components/data-table/data-table.model';
import { Modal } from '../../shared/components/modal/modal';
import type { ReturnRequest, ReturnStatus } from '../../core/models/return-request.model';
import { ReturnsAdminService } from './returns-admin.service';

const COLUMNS: DataTableColumn[] = [
  { key: 'createdAt', label: 'Ngày yêu cầu' },
  { key: 'orderId', label: 'Đơn hàng' },
  { key: 'reason', label: 'Lý do' },
  { key: 'note', label: 'Ghi chú' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'refundAmount', label: 'Số tiền hoàn', align: 'right' },
  { key: 'actions', label: '', align: 'right' },
];

const REASON_LABELS: Record<string, string> = {
  defective: 'Hàng lỗi',
  wrong_item: 'Giao sai sản phẩm',
  not_as_described: 'Không giống mô tả',
  changed_mind: 'Đổi ý',
  other: 'Khác',
};

const STATUS_LABELS: Record<string, string> = {
  requested: 'Chờ xử lý',
  approved: 'Đã duyệt',
  rejected: 'Đã từ chối',
  refunded: 'Đã hoàn tiền',
  completed: 'Hoàn tất (thủ công)',
};

@Component({
  selector: 'app-returns-admin',
  imports: [FormsModule, DatePipe, DecimalPipe, DataTable, DataTableCellDirective, Modal],
  templateUrl: './returns-admin.html',
})
export class ReturnsAdmin {
  private readonly returnsService = inject(ReturnsAdminService);

  readonly columns = COLUMNS;
  readonly reasonLabels = REASON_LABELS;
  readonly statusLabels = STATUS_LABELS;

  readonly returns = signal<ReturnRequest[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  statusFilter: ReturnStatus | '' = '';
  readonly filtered = computed(() => {
    const filter = this.statusFilter;
    const list = this.returns();
    return filter ? list.filter((r) => r.status === filter) : list;
  });

  readonly resolving = signal<ReturnRequest | null>(null);
  resolveAction: 'approve' | 'reject' = 'approve';
  resolveNote = '';

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      this.returns.set(await this.returnsService.findAll());
    } finally {
      this.loading.set(false);
    }
  }

  reasonLabel(reason: string): string {
    return REASON_LABELS[reason] ?? reason;
  }

  statusLabel(status: string): string {
    return STATUS_LABELS[status] ?? status;
  }

  startResolve(returnRequest: ReturnRequest): void {
    this.error.set(null);
    this.resolveAction = 'approve';
    this.resolveNote = '';
    this.resolving.set(returnRequest);
  }

  closeResolve(): void {
    this.resolving.set(null);
  }

  async confirmResolve(): Promise<void> {
    const returnRequest = this.resolving();
    if (!returnRequest) return;
    this.saving.set(true);
    this.error.set(null);
    try {
      await this.returnsService.resolve(returnRequest.id, {
        action: this.resolveAction,
        note: this.resolveNote || undefined,
      });
      this.resolving.set(null);
      await this.load();
    } catch (err) {
      this.error.set(this.extractErrorMessage(err));
    } finally {
      this.saving.set(false);
    }
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
