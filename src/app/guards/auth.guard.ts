// guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../users/services/user.service';

export const authGuard: CanActivateFn = (route, state) => {
  const userSvc = inject(UserService);
  const router  = inject(Router);

  if (userSvc.isAuthenticated()) {
    return true;
  }

  // Redirect to login, preserve the intended destination
  return router.createUrlTree(['/users/login'], {
    queryParams: { returnUrl: state.url }
  });
};

// Admin-only guard
export const adminGuard: CanActivateFn = (route, state) => {
  const userSvc = inject(UserService);
  const router  = inject(Router);
  const user    = userSvc.authUser();

  if (user?.role === 'admin') return true;

  return router.createUrlTree(['/users/dashboard']);
};
