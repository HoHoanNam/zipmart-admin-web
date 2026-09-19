import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { AdminUser, UserRole } from '../../core/models/user.model';

@Injectable({ providedIn: 'root' })
export class UsersAdminService {
  private readonly http = inject(HttpClient);

  findAll(): Promise<AdminUser[]> {
    return firstValueFrom(this.http.get<AdminUser[]>(`${environment.apiUrl}/users`));
  }

  updateRole(id: string, role: UserRole): Promise<AdminUser> {
    return firstValueFrom(
      this.http.patch<AdminUser>(`${environment.apiUrl}/users/${id}/role`, { role }),
    );
  }
}
