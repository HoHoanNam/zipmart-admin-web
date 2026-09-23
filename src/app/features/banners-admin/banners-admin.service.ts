import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { Banner, CreateBannerInput, UpdateBannerInput } from '../../core/models/banner.model';

@Injectable({ providedIn: 'root' })
export class BannersAdminService {
  private readonly http = inject(HttpClient);

  findAll(): Promise<Banner[]> {
    return firstValueFrom(this.http.get<Banner[]>(`${environment.apiUrl}/banners/admin`));
  }

  create(input: CreateBannerInput): Promise<Banner> {
    return firstValueFrom(this.http.post<Banner>(`${environment.apiUrl}/banners`, input));
  }

  update(id: string, input: UpdateBannerInput): Promise<Banner> {
    return firstValueFrom(this.http.patch<Banner>(`${environment.apiUrl}/banners/${id}`, input));
  }

  remove(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${environment.apiUrl}/banners/${id}`));
  }
}
