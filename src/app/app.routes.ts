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
    path: 'coupons',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./features/coupons-admin/coupons-admin').then((m) => m.CouponsAdmin),
  },
  {
    path: 'analytics',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./features/analytics/analytics-page').then((m) => m.AnalyticsPage),
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];
