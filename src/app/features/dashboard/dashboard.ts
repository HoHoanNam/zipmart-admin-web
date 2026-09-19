import { Component, inject, signal } from '@angular/core';
import type { DashboardSummary } from '../../core/models/analytics.model';
import { VndCurrencyPipe } from '../../shared/pipes/vnd-currency.pipe';
import { AnalyticsService } from '../analytics/analytics.service';

@Component({
  selector: 'app-dashboard',
  imports: [VndCurrencyPipe],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly analyticsService = inject(AnalyticsService);

  readonly summary = signal<DashboardSummary | null>(null);
  readonly loading = signal(true);

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      this.summary.set(await this.analyticsService.getDashboard());
    } finally {
      this.loading.set(false);
    }
  }
}
