import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('tripgo_token');
  const userRole = localStorage.getItem('tripgo_role');

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  const expectedRole = route.data['role'];
  if (expectedRole && userRole !== expectedRole) {
    alert('Unauthorized access');
    router.navigate([userRole === 'ADMIN' ? '/admin' : '/booking/search']);
    return false;
  }

  return true;
};