import { Component, computed, input } from '@angular/core';
import type { ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import type { TopSellingProduct } from '../../core/models/analytics.model';

/** Horizontal bar chart of top-selling products by revenue. */
@Component({
  selector: 'app-top-products-chart',
  imports: [BaseChartDirective],
  templateUrl: './top-products-chart.html',
})
export class TopProductsChart {
  readonly products = input<TopSellingProduct[]>([]);

  readonly chartType = 'bar' as const;

  readonly heightPx = computed(() => Math.max(160, this.products().length * 36));

  readonly chartData = computed<ChartData<'bar'>>(() => {
    const products = this.products();
    return {
      labels: products.map((p) => p.productName),
      datasets: [
        {
          label: 'Doanh thu',
          data: products.map((p) => Number(p.totalRevenue)),
          backgroundColor: '#4f46e5',
          borderRadius: 4,
        },
      ],
    };
  });

  readonly chartOptions: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { callback: (value) => Number(value).toLocaleString('vi-VN') },
      },
    },
  };
}
