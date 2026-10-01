import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  CreateScheduledReportInput,
  ScheduledReport,
  UpdateScheduledReportInput,
} from '../../core/models/scheduled-report.model';

@Injectable({ providedIn: 'root' })
export class ScheduledReportsService {
  private readonly http = inject(HttpClient);

  findAll(): Promise<ScheduledReport[]> {
    return firstValueFrom(
      this.http.get<ScheduledReport[]>(`${environment.apiUrl}/reports/scheduled`),
    );
  }

  create(input: CreateScheduledReportInput): Promise<ScheduledReport> {
    return firstValueFrom(
      this.http.post<ScheduledReport>(`${environment.apiUrl}/reports/scheduled`, input),
    );
  }

  update(id: string, input: UpdateScheduledReportInput): Promise<ScheduledReport> {
    return firstValueFrom(
      this.http.patch<ScheduledReport>(`${environment.apiUrl}/reports/scheduled/${id}`, input),
    );
  }

  remove(id: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${environment.apiUrl}/reports/scheduled/${id}`),
    );
  }
}
