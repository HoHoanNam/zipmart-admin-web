import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataTable } from '../../shared/components/data-table/data-table';
import { DataTableCellDirective } from '../../shared/components/data-table/data-table-cell.directive';
import type { DataTableColumn } from '../../shared/components/data-table/data-table.model';
import { Modal } from '../../shared/components/modal/modal';
import type { RoleWithPermissions } from '../../core/models/role.model';
import type { StaffInvite } from '../../core/models/staff-invite.model';
import { RolesAdminService } from '../roles-admin/roles-admin.service';
import { StaffAdminService } from './staff-admin.service';

const COLUMNS: DataTableColumn[] = [
  { key: 'email', label: 'Email' },
  { key: 'roleName', label: 'Vai trò mời' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'createdAt', label: 'Ngày mời' },
  { key: 'expiresAt', label: 'Hết hạn' },
  { key: 'actions', label: '', align: 'right' },
];

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ chấp nhận',
  accepted: 'Đã chấp nhận',
  expired: 'Hết hạn',
  revoked: 'Đã thu hồi',
};

@Component({
  selector: 'app-staff-admin',
  imports: [FormsModule, DatePipe, DataTable, DataTableCellDirective, Modal],
  templateUrl: './staff-admin.html',
})
export class StaffAdmin {
  private readonly staffService = inject(StaffAdminService);
  private readonly rolesService = inject(RolesAdminService);

  readonly columns = COLUMNS;
  readonly statusLabels = STATUS_LABELS;

  readonly invites = signal<StaffInvite[]>([]);
  readonly roles = signal<RoleWithPermissions[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly busyId = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  readonly inviting = signal(false);
  email = '';
  roleId = '';

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      const [invites, roles] = await Promise.all([
        this.staffService.findAll(),
        this.rolesService.findAllRoles(),
      ]);
      this.invites.set(invites);
      this.roles.set(roles.filter((r) => r.name !== 'Customer'));
    } finally {
      this.loading.set(false);
    }
  }

  statusLabel(status: string): string {
    return STATUS_LABELS[status] ?? status;
  }

  roleName(invite: StaffInvite): string {
    return invite.roleName ?? this.roles().find((r) => r.id === invite.roleId)?.name ?? invite.roleId;
  }

  startInvite(): void {
    this.error.set(null);
    this.email = '';
    this.roleId = this.roles()[0]?.id ?? '';
    this.inviting.set(true);
  }

  closeInvite(): void {
    this.inviting.set(false);
  }

  async sendInvite(): Promise<void> {
    if (!this.email.trim() || !this.roleId) {
      this.error.set('Nhập email và chọn vai trò.');
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    try {
      await this.staffService.invite({ email: this.email.trim(), roleId: this.roleId });
      this.inviting.set(false);
      await this.load();
    } catch (err) {
      this.error.set(this.extractErrorMessage(err));
    } finally {
      this.saving.set(false);
    }
  }

  async revoke(invite: StaffInvite): Promise<void> {
    if (!confirm(`Thu hồi lời mời gửi tới ${invite.email}?`)) return;
    this.busyId.set(invite.id);
    try {
      await this.staffService.revoke(invite.id);
      await this.load();
    } finally {
      this.busyId.set(null);
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
