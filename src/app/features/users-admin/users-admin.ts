import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import type { AdminUser, UserRole } from '../../core/models/user.model';
import { UsersAdminService } from './users-admin.service';

const ROLES: UserRole[] = ['customer', 'admin'];

@Component({
  selector: 'app-users-admin',
  imports: [DatePipe],
  templateUrl: './users-admin.html',
})
export class UsersAdmin {
  private readonly usersService = inject(UsersAdminService);

  readonly users = signal<AdminUser[]>([]);
  readonly loading = signal(true);
  readonly roles = ROLES;

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      this.users.set(await this.usersService.findAll());
    } finally {
      this.loading.set(false);
    }
  }

  async changeRole(user: AdminUser, role: string): Promise<void> {
    await this.usersService.updateRole(user.id, role as UserRole);
    await this.load();
  }
}
