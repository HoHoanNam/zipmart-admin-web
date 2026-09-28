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

export interface RevenueReportDay {
  date: string;
  orderCount: number;
  revenue: number;
}

export interface RevenueReport {
  from: string;
  to: string;
  days: RevenueReportDay[];
  totalOrders: number;
  totalRevenue: number;
}

export interface TopSellingProduct {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface OrdersCsvExport {
  filename: string;
  csv: string;
}
