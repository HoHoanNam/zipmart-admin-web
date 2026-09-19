import type { Product } from './product.model';

export interface DashboardSummary {
  todayOrderCount: number;
  todayRevenue: number;
  totalUsers: number;
  totalProducts: number;
  lowStockProducts: Product[];
}

export interface TopViewedProduct {
  product: Product;
  viewCount: number;
}

export interface EngagementSummary {
  eventCounts: Record<string, number>;
  topViewed: TopViewedProduct[];
}
