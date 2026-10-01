import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { CreateRoleInput, Permission, RoleWithPermissions } from '../../core/models/role.model';

@Injectable({ providedIn: 'root' })
export class RolesAdminService {
  private readonly http = inject(HttpClient);

  findAllRoles(): Promise<RoleWithPermissions[]> {
    return firstValueFrom(this.http.get<RoleWithPermissions[]>(`${environment.apiUrl}/roles`));
  }

  findAllPermissions(): Promise<Permission[]> {
    return firstValueFrom(this.http.get<Permission[]>(`${environment.apiUrl}/permissions`));
  }

  createRole(input: CreateRoleInput): Promise<RoleWithPermissions> {
    return firstValueFrom(
      this.http.post<RoleWithPermissions>(`${environment.apiUrl}/roles`, input),
    );
  }

  updateRolePermissions(roleId: string, permissionKeys: string[]): Promise<RoleWithPermissions> {
    return firstValueFrom(
      this.http.patch<RoleWithPermissions>(`${environment.apiUrl}/roles/${roleId}/permissions`, {
        permissionKeys,
      }),
    );
  }
}
