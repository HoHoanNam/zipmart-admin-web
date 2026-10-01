import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { AuditLog, AuditLogFilter } from '../../core/models/audit-log.model';

@Injectable({ providedIn: 'root' })
export class AuditLogAdminService {
  private readonly http = inject(HttpClient);

  findAll(filter: AuditLogFilter): Promise<AuditLog[]> {
    const params: Record<string, string> = {};
    if (filter.actor) params['actor'] = filter.actor;
    if (filter.entityType) params['entityType'] = filter.entityType;
    if (filter.from) params['from'] = filter.from;
    if (filter.to) params['to'] = filter.to;
    return firstValueFrom(this.http.get<AuditLog[]>(`${environment.apiUrl}/audit-logs`, { params }));
  }
}
