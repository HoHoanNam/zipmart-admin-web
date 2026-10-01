import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { Setting } from '../../core/models/setting.model';

@Injectable({ providedIn: 'root' })
export class SettingsAdminService {
  private readonly http = inject(HttpClient);

  findAll(): Promise<Setting[]> {
    return firstValueFrom(this.http.get<Setting[]>(`${environment.apiUrl}/settings`));
  }

  update(key: string, value: unknown): Promise<Setting> {
    return firstValueFrom(
      this.http.patch<Setting>(`${environment.apiUrl}/settings/${key}`, { value }),
    );
  }
}
