import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PopupService } from './shared/popup.service';

export const authGuard: CanActivateFn = (route, state) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  if (isAuthenticated) return true;
  const router = inject(Router);
  const popup = inject(PopupService);
  popup.show('Please log in to access your cart.', {
    type: 'error',
    durationMs: 2500,
  });
  router.navigate(['/home']);
  return false;
};
