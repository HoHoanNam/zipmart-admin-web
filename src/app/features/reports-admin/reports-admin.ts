import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { RevenueReport, TopSellingProduct } from '../../core/models/analytics.model';
import { AnalyticsService } from '../analytics/analytics.service';

@Component({
  selector: 'app-reports-admin',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './reports-admin.html',
})
export class ReportsAdmin {
  private readonly analyticsService = inject(AnalyticsService);

  readonly report = signal<RevenueReport | null>(null);
  readonly topProducts = signal<TopSellingProduct[]>([]);
  readonly loading = signal(true);
  readonly exporting = signal(false);

  /** Empty = let the backend default to the trailing 30 days. */
  from = '';
  to = '';

  readonly maxDayRevenue = computed(() =>
    Math.max(1, ...(this.report()?.days.map((day) => day.revenue) ?? [])),
  );

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const range = { from: this.from || undefined, to: this.to || undefined };
      const [report, topProducts] = await Promise.all([
        this.analyticsService.getRevenueReport(range),
        this.analyticsService.getTopProducts(range),
      ]);
      this.report.set(report);
      this.topProducts.set(topProducts);
    } finally {
      this.loading.set(false);
    }
  }

  async exportCsv(): Promise<void> {
    this.exporting.set(true);
    try {
      const range = { from: this.from || undefined, to: this.to || undefined };
      const { filename, csv } = await this.analyticsService.getOrdersCsvExport(range);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
    } finally {
      this.exporting.set(false);
    }
  }
}
