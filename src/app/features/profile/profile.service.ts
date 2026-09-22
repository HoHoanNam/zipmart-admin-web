import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  AdminUser,
  ChangePasswordPayload,
  UpdateProfilePayload,
} from '../../core/models/user.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);

  getMe(): Promise<AdminUser> {
    return firstValueFrom(this.http.get<AdminUser>(`${environment.apiUrl}/users/me`));
  }

  updateMe(payload: UpdateProfilePayload): Promise<AdminUser> {
    return firstValueFrom(this.http.patch<AdminUser>(`${environment.apiUrl}/users/me`, payload));
  }

  changePassword(payload: ChangePasswordPayload): Promise<{ success: boolean }> {
    return firstValueFrom(
      this.http.patch<{ success: boolean }>(`${environment.apiUrl}/auth/change-password`, payload),
    );
  }
}
