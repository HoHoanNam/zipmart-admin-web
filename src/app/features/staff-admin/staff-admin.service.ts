import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { CreateStaffInviteInput, StaffInvite } from '../../core/models/staff-invite.model';

@Injectable({ providedIn: 'root' })
export class StaffAdminService {
  private readonly http = inject(HttpClient);

  findAll(): Promise<StaffInvite[]> {
    return firstValueFrom(this.http.get<StaffInvite[]>(`${environment.apiUrl}/users/staff-invites`));
  }

  invite(input: CreateStaffInviteInput): Promise<StaffInvite> {
    return firstValueFrom(
      this.http.post<StaffInvite>(`${environment.apiUrl}/users/staff-invites`, input),
    );
  }

  revoke(id: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${environment.apiUrl}/users/staff-invites/${id}`),
    );
  }
}
