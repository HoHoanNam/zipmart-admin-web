import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Permission, RoleWithPermissions } from '../../core/models/role.model';
import { RolesAdminService } from './roles-admin.service';

@Component({
  selector: 'app-roles-admin',
  imports: [FormsModule],
  templateUrl: './roles-admin.html',
})
export class RolesAdmin {
  private readonly rolesService = inject(RolesAdminService);

  readonly roles = signal<RoleWithPermissions[]>([]);
  readonly permissions = signal<Permission[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly savingRoleId = signal<string | null>(null);
  readonly creating = signal(false);
  newRoleName = '';

  /** Pending checkbox state per role, keyed by roleId → Set of permission keys. Diverges from `roles()` until Save is pressed. */
  private readonly pendingByRole = signal<Record<string, Set<string>>>({});

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      const [roles, permissions] = await Promise.all([
        this.rolesService.findAllRoles(),
        this.rolesService.findAllPermissions(),
      ]);
      this.roles.set(roles);
      this.permissions.set(permissions);
      this.pendingByRole.set(
        Object.fromEntries(roles.map((role) => [role.id, new Set(role.permissionKeys)])),
      );
    } finally {
      this.loading.set(false);
    }
  }

  isChecked(roleId: string, key: string): boolean {
    return this.pendingByRole()[roleId]?.has(key) ?? false;
  }

  toggle(role: RoleWithPermissions, key: string): void {
    if (role.isSystem) return;
    this.pendingByRole.update((map) => {
      const next = { ...map };
      const set = new Set(next[role.id] ?? []);
      if (set.has(key)) set.delete(key);
      else set.add(key);
      next[role.id] = set;
      return next;
    });
  }

  isDirty(role: RoleWithPermissions): boolean {
    const pending = this.pendingByRole()[role.id];
    if (!pending) return false;
    const original = new Set(role.permissionKeys);
    if (pending.size !== original.size) return true;
    for (const key of pending) {
      if (!original.has(key)) return true;
    }
    return false;
  }

  async save(role: RoleWithPermissions): Promise<void> {
    this.savingRoleId.set(role.id);
    this.error.set(null);
    try {
      const keys = Array.from(this.pendingByRole()[role.id] ?? []);
      const updated = await this.rolesService.updateRolePermissions(role.id, keys);
      this.roles.update((list) => list.map((r) => (r.id === role.id ? updated : r)));
      this.pendingByRole.update((map) => ({ ...map, [role.id]: new Set(updated.permissionKeys) }));
    } catch (err) {
      this.error.set(this.extractErrorMessage(err));
    } finally {
      this.savingRoleId.set(null);
    }
  }

  async createRole(): Promise<void> {
    const name = this.newRoleName.trim();
    if (!name) return;
    this.creating.set(true);
    this.error.set(null);
    try {
      await this.rolesService.createRole({ name });
      this.newRoleName = '';
      await this.load();
    } catch (err) {
      this.error.set(this.extractErrorMessage(err));
    } finally {
      this.creating.set(false);
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
