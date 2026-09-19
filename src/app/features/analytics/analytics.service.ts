import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { DashboardSummary, EngagementSummary } from '../../core/models/analytics.model';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly http = inject(HttpClient);

  getDashboard(): Promise<DashboardSummary> {
    return firstValueFrom(
      this.http.get<DashboardSummary>(`${environment.apiUrl}/analytics/dashboard`),
    );
  }

  getEngagement(): Promise<EngagementSummary> {
    return firstValueFrom(
      this.http.get<EngagementSummary>(`${environment.apiUrl}/analytics/engagement`),
    );
  }
}
