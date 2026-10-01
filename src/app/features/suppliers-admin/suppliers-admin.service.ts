import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { CreateSupplierInput, Supplier, UpdateSupplierInput } from '../../core/models/supplier.model';

@Injectable({ providedIn: 'root' })
export class SuppliersAdminService {
  private readonly http = inject(HttpClient);

  findAll(): Promise<Supplier[]> {
    return firstValueFrom(this.http.get<Supplier[]>(`${environment.apiUrl}/suppliers`));
  }

  create(input: CreateSupplierInput): Promise<Supplier> {
    return firstValueFrom(this.http.post<Supplier>(`${environment.apiUrl}/suppliers`, input));
  }

  update(id: string, input: UpdateSupplierInput): Promise<Supplier> {
    return firstValueFrom(
      this.http.patch<Supplier>(`${environment.apiUrl}/suppliers/${id}`, input),
    );
  }

  remove(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${environment.apiUrl}/suppliers/${id}`));
  }
}
