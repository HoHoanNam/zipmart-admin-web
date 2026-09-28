import type { Routes } from '@angular/router';
import { adminAuthGuard } from './core/auth/admin-auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
  },
  {
    path: 'dashboard',
    canActivate: [adminAuthGuard],
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'products',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./features/products-admin/products-admin').then((m) => m.ProductsAdmin),
  },
  {
    path: 'orders',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./features/orders-admin/orders-admin').then((m) => m.OrdersAdmin),
  },
  {
    path: 'users',
    canActivate: [adminAuthGuard],
    loadComponent: () => import('./features/users-admin/users-admin').then((m) => m.UsersAdmin),
  },
  {
    path: 'categories',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./features/categories-admin/categories-admin').then((m) => m.CategoriesAdmin),
  },
  {
    path: 'coupons',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./features/coupons-admin/coupons-admin').then((m) => m.CouponsAdmin),
  },
  {
    path: 'reviews',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./features/reviews-admin/reviews-admin').then((m) => m.ReviewsAdmin),
  },
  {
    path: 'banners',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./features/banners-admin/banners-admin').then((m) => m.BannersAdmin),
  },
  {
    path: 'notifications',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./features/notifications-admin/notifications-admin').then(
        (m) => m.NotificationsAdmin,
      ),
  },
  {
    path: 'analytics',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./features/analytics/analytics-page').then((m) => m.AnalyticsPage),
  },
  {
    path: 'inventory',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./features/inventory-admin/inventory-admin').then((m) => m.InventoryAdmin),
  },
  {
    path: 'reports',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./features/reports-admin/reports-admin').then((m) => m.ReportsAdmin),
  },
  {
    path: 'profile',
    canActivate: [adminAuthGuard],
    loadComponent: () => import('./features/profile/profile').then((m) => m.Profile),
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];
