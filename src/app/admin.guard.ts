import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AdminAuthService } from './services/admin-auth.service';
import { PopupService } from './shared/popup.service';

export const adminGuard: CanActivateFn = () => {
  const adminAuth = inject(AdminAuthService);
  if (adminAuth.isAdmin()) {
    return true;
  }
  const router = inject(Router);
  const popup = inject(PopupService);
  popup.show('Admin access only. Please log in.', {
    type: 'error',
    durationMs: 2200,
  });
  return router.parseUrl('/admin-login') as UrlTree;
};
