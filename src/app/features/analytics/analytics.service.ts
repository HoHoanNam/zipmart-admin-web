import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  DashboardSummary,
  EngagementSummary,
  OrdersCsvExport,
  RevenueReport,
  TopSellingProduct,
} from '../../core/models/analytics.model';

export interface ReportRangeParams {
  from?: string;
  to?: string;
  /**
   * Sent even though the backend's `groupBy` support for
   * `/analytics/revenue-report` may not be live yet (Infra A doc note) — an
   * extra unrecognized query param is harmless, and the response is still
   * consumed as a flat `days` array either way (daily buckets if the
   * backend ignores it).
   */
  groupBy?: 'day' | 'week' | 'month';
}

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

  getRevenueReport(range: ReportRangeParams): Promise<RevenueReport> {
    return firstValueFrom(
      this.http.get<RevenueReport>(`${environment.apiUrl}/analytics/revenue-report`, {
        params: this.toHttpParams(range),
      }),
    );
  }

  getTopProducts(range: ReportRangeParams): Promise<TopSellingProduct[]> {
    return firstValueFrom(
      this.http.get<TopSellingProduct[]>(`${environment.apiUrl}/analytics/top-products`, {
        params: this.toHttpParams(range),
      }),
    );
  }

  getOrdersCsvExport(range: ReportRangeParams): Promise<OrdersCsvExport> {
    return firstValueFrom(
      this.http.get<OrdersCsvExport>(`${environment.apiUrl}/analytics/export/orders`, {
        params: this.toHttpParams(range),
      }),
    );
  }

  private toHttpParams(range: ReportRangeParams): Record<string, string> {
    const params: Record<string, string> = {};
    if (range.from) params['from'] = range.from;
    if (range.to) params['to'] = range.to;
    if (range.groupBy) params['groupBy'] = range.groupBy;
    return params;
  }
}
