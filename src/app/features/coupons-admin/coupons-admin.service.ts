import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { Coupon, CreateCouponInput, UpdateCouponInput } from '../../core/models/coupon.model';

@Injectable({ providedIn: 'root' })
export class CouponsAdminService {
  private readonly http = inject(HttpClient);

  findAll(): Promise<Coupon[]> {
    return firstValueFrom(this.http.get<Coupon[]>(`${environment.apiUrl}/coupons`));
  }

  create(input: CreateCouponInput): Promise<Coupon> {
    return firstValueFrom(this.http.post<Coupon>(`${environment.apiUrl}/coupons`, input));
  }

  update(id: string, input: UpdateCouponInput): Promise<Coupon> {
    return firstValueFrom(this.http.patch<Coupon>(`${environment.apiUrl}/coupons/${id}`, input));
  }

  remove(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${environment.apiUrl}/coupons/${id}`));
  }
}
