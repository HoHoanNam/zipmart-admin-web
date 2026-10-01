import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ResolveReturnRequestInput, ReturnRequest } from '../../core/models/return-request.model';

@Injectable({ providedIn: 'root' })
export class ReturnsAdminService {
  private readonly http = inject(HttpClient);

  findAll(): Promise<ReturnRequest[]> {
    return firstValueFrom(this.http.get<ReturnRequest[]>(`${environment.apiUrl}/returns`));
  }

  resolve(id: string, input: ResolveReturnRequestInput): Promise<ReturnRequest> {
    return firstValueFrom(
      this.http.patch<ReturnRequest>(`${environment.apiUrl}/returns/${id}/resolve`, input),
    );
  }
}
