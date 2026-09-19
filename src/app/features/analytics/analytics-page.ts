import { Component, computed, inject, signal } from '@angular/core';
import type { EngagementSummary } from '../../core/models/analytics.model';
import { AnalyticsService } from './analytics.service';

const EVENT_LABELS: Record<string, string> = {
  view: 'Lượt xem',
  click: 'Lượt nhấp',
  add_to_cart: 'Thêm giỏ hàng',
  purchase: 'Đã mua',
};

@Component({
  selector: 'app-analytics-page',
  templateUrl: './analytics-page.html',
})
export class AnalyticsPage {
  private readonly analyticsService = inject(AnalyticsService);

  readonly summary = signal<EngagementSummary | null>(null);
  readonly loading = signal(true);

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
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      this.summary.set(await this.analyticsService.getEngagement());
    } finally {
      this.loading.set(false);
    }
  }
}
