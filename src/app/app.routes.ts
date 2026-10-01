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
  {
    path: 'roles',
    canActivate: [adminAuthGuard],
    loadComponent: () => import('./features/roles-admin/roles-admin').then((m) => m.RolesAdmin),
  },
  {
    path: 'settings',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./features/settings-admin/settings-admin').then((m) => m.SettingsAdmin),
  },
  {
    path: 'audit-log',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./features/audit-log-admin/audit-log-admin').then((m) => m.AuditLogAdmin),
  },
  {
    path: 'suppliers',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./features/suppliers-admin/suppliers-admin').then((m) => m.SuppliersAdmin),
  },
  {
    path: 'purchase-orders',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./features/purchase-orders-admin/purchase-orders-admin').then(
        (m) => m.PurchaseOrdersAdmin,
      ),
  },
  {
    path: 'staff',
    canActivate: [adminAuthGuard],
    loadComponent: () => import('./features/staff-admin/staff-admin').then((m) => m.StaffAdmin),
  },
  {
    path: 'returns',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./features/returns-admin/returns-admin').then((m) => m.ReturnsAdmin),
  },
  {
    path: 'cms',
    canActivate: [adminAuthGuard],
    loadComponent: () => import('./features/cms-admin/cms-admin').then((m) => m.CmsAdmin),
  },
  {
    path: 'cms/:id',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./features/cms-admin/cms-page-editor').then((m) => m.CmsPageEditor),
  },
  {
    path: 'support',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./features/support-admin/support-admin').then((m) => m.SupportAdmin),
  },
  {
    path: 'bulk-import',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./features/bulk-import-admin/bulk-import-admin').then((m) => m.BulkImportAdmin),
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];
