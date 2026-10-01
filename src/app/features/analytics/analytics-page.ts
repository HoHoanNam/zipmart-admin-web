import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { EngagementSummary, RevenueReport, TopSellingProduct } from '../../core/models/analytics.model';
import { AnalyticsService } from './analytics.service';
import { RevenueChart } from './revenue-chart';
import { TopProductsChart } from './top-products-chart';

const EVENT_LABELS: Record<string, string> = {
  view: 'Lượt xem',
  click: 'Lượt nhấp',
  add_to_cart: 'Thêm giỏ hàng',
  purchase: 'Đã mua',
};

type GroupBy = 'day' | 'week' | 'month';

@Component({
  selector: 'app-analytics-page',
  imports: [FormsModule, RevenueChart, TopProductsChart],
  templateUrl: './analytics-page.html',
})
export class AnalyticsPage {
  private readonly analyticsService = inject(AnalyticsService);

  readonly summary = signal<EngagementSummary | null>(null);
  readonly loading = signal(true);

  readonly revenueReport = signal<RevenueReport | null>(null);
  readonly topProducts = signal<TopSellingProduct[]>([]);
  readonly chartsLoading = signal(true);

  /** Empty = let the backend default the range. */
  from = '';
  to = '';
  groupBy: GroupBy = 'day';

  readonly eventRows = computed(() => {
    const counts = this.summary()?.eventCounts ?? {};
    const max = Math.max(1, ...Object.values(counts));
    return Object.entries(counts).map(([type, count]) => ({
      type,
      label: EVENT_LABELS[type] ?? type,
      count,
      percent: (count / max) * 100,
    }));
  });

  constructor() {
    void this.load();
    void this.loadCharts();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      this.summary.set(await this.analyticsService.getEngagement());
    } finally {
      this.loading.set(false);
    }
  }

  async loadCharts(): Promise<void> {
    this.chartsLoading.set(true);
    try {
      const range = { from: this.from || undefined, to: this.to || undefined, groupBy: this.groupBy };
      const [revenueReport, topProducts] = await Promise.all([
        this.analyticsService.getRevenueReport(range),
        this.analyticsService.getTopProducts(range),
      ]);
      this.revenueReport.set(revenueReport);
      this.topProducts.set(topProducts.slice(0, 10));
    } finally {
      this.chartsLoading.set(false);
    }
  }
}
