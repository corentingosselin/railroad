import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getCurrentAccount().pipe(
    map((account) => {
      if (account) {
        return true;
      } else {
        router.navigate(['/login']);
        return false;
      }
    })
  );
};
