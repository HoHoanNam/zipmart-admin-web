import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { AdminUser, UserRole } from '../../core/models/user.model';
import type { RoleWithPermissions } from '../../core/models/role.model';
import { RolesAdminService } from '../roles-admin/roles-admin.service';
import { UsersAdminService } from './users-admin.service';

/** System role names seeded by the RBAC migration — map 1:1 to the old binary `role` enum. */
const SYSTEM_ROLE_NAME_TO_ENUM: Record<string, UserRole> = {
  'Super Admin': 'admin',
  Customer: 'customer',
};

@Component({
  selector: 'app-users-admin',
  imports: [DatePipe, RouterLink],
  templateUrl: './users-admin.html',
})
export class UsersAdmin {
  private readonly usersService = inject(UsersAdminService);
  private readonly rolesService = inject(RolesAdminService);

  readonly users = signal<AdminUser[]>([]);
  readonly roles = signal<RoleWithPermissions[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  /** `roles` keyed by id, for O(1) lookup when rendering each row's current role name. */
  readonly rolesById = computed(() => new Map(this.roles().map((r) => [r.id, r])));

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      const [users, roles] = await Promise.all([
        this.usersService.findAll(),
        this.rolesService.findAllRoles(),
      ]);
      this.users.set(users);
      this.roles.set(roles);
    } finally {
      this.loading.set(false);
    }
  }

  /** The role name shown for a user: resolved from `roleId` when set (RBAC), falling back to the legacy binary `role` enum. */
  currentRoleName(user: AdminUser): string {
    const role = user.roleId ? this.rolesById().get(user.roleId) : undefined;
    return role?.name ?? (user.role === 'admin' ? 'admin (chưa gán RBAC)' : 'customer (chưa gán RBAC)');
  }

  async changeRole(user: AdminUser, roleId: string): Promise<void> {
    const role = this.rolesById().get(roleId);
    if (!role) return;

    this.error.set(null);

    // Only the two system roles (Super Admin/Customer) can actually be
    // persisted today — `PATCH /users/:id/role` (the only mutation endpoint
    // this controller currently exposes) writes the legacy binary `role`
    // enum column, not `roleId`. Assigning a custom role would need a new
    // backend endpoint (e.g. `PATCH /users/:id/role-id`) that doesn't exist
    // yet — Infra A's "10 controller cũ chưa đổi" list includes `users`.
    const mappedEnum = SYSTEM_ROLE_NAME_TO_ENUM[role.name];
    if (!mappedEnum) {
      this.error.set(
        `Chưa hỗ trợ gán vai trò tuỳ chỉnh "${role.name}" cho người dùng — backend chỉ có PATCH /users/:id/role (đổi giữa customer/admin), chưa có API gán roleId tuỳ chỉnh.`,
      );
      return;
    }

    await this.usersService.updateRole(user.id, mappedEnum);
    await this.load();
  }
}
