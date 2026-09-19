import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AdminAuthService } from './admin-auth.service';

/**
 * UX-adjacent check only. If the JWT isn't `role: admin`, every admin
 * endpoint on zipmart-backend-nest still rejects with 403 via `RolesGuard`
 * — this guard just avoids flashing admin UI at a non-admin account before
 * that 403 comes back.
 */
export const adminAuthGuard: CanActivateFn = () => {
  const authService = inject(AdminAuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.isAdmin()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
