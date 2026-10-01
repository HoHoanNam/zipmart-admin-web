import { Component, computed, input } from '@angular/core';
import type { ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import type { RevenueReport } from '../../core/models/analytics.model';

/** Line chart of `RevenueReport.days` (revenue per bucket — daily/weekly/monthly depending on `groupBy`). */
@Component({
  selector: 'app-revenue-chart',
  imports: [BaseChartDirective],
  templateUrl: './revenue-chart.html',
})
export class RevenueChart {
  readonly report = input<RevenueReport | null>(null);

  readonly chartType = 'line' as const;

  readonly chartData = computed<ChartData<'line'>>(() => {
    const days = this.report()?.days ?? [];
    return {
      labels: days.map((d) => d.date),
      datasets: [
        {
          label: 'Doanh thu',
          data: days.map((d) => Number(d.revenue)),
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.15)',
          tension: 0.3,
          fill: true,
        },
      ],
    };
  });

  readonly chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (value) => Number(value).toLocaleString('vi-VN') },
      },
    },
  };
}
