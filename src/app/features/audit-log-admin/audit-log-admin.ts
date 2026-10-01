import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataTable } from '../../shared/components/data-table/data-table';
import { DataTableCellDirective } from '../../shared/components/data-table/data-table-cell.directive';
import type { DataTableColumn } from '../../shared/components/data-table/data-table.model';
import { Modal } from '../../shared/components/modal/modal';
import type { AuditLog } from '../../core/models/audit-log.model';
import { AuditLogAdminService } from './audit-log-admin.service';

/** Entities audited per the plan (`@Audit(...)` gắn lên 10 controller admin hiện có). */
const ENTITY_TYPES = [
  'product',
  'coupon',
  'notification',
  'order',
  'review',
  'category',
  'banner',
  'upload',
  'user',
];

const COLUMNS: DataTableColumn[] = [
  { key: 'createdAt', label: 'Thời gian' },
  { key: 'actorEmail', label: 'Người thực hiện' },
  { key: 'action', label: 'Hành động' },
  { key: 'entityType', label: 'Đối tượng' },
  { key: 'entityId', label: 'ID đối tượng' },
  { key: 'metadata', label: '', align: 'right' },
];

@Component({
  selector: 'app-audit-log-admin',
  imports: [FormsModule, DatePipe, DataTable, DataTableCellDirective, Modal],
  templateUrl: './audit-log-admin.html',
})
export class AuditLogAdmin {
  private readonly auditService = inject(AuditLogAdminService);

  readonly columns = COLUMNS;
  readonly entityTypes = ENTITY_TYPES;

  readonly logs = signal<AuditLog[]>([]);
  readonly loading = signal(true);
  readonly viewing = signal<AuditLog | null>(null);

  actor = '';
  entityType = '';
  from = '';
  to = '';

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      this.logs.set(
        await this.auditService.findAll({
          actor: this.actor || undefined,
          entityType: this.entityType || undefined,
          from: this.from || undefined,
          to: this.to || undefined,
        }),
      );
    } finally {
      this.loading.set(false);
    }
  }

  resetFilters(): void {
    this.actor = '';
    this.entityType = '';
    this.from = '';
    this.to = '';
    void this.load();
  }

  view(log: AuditLog): void {
    this.viewing.set(log);
  }

  closeView(): void {
    this.viewing.set(null);
  }

  metadataJson(log: AuditLog | null): string {
    return log?.metadata ? JSON.stringify(log.metadata, null, 2) : '—';
  }
}
