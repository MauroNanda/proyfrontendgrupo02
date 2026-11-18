import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (_route, _state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // isAdmin significa ORGANIZADOR; ocultar una pantalla no reemplaza los permisos del servidor.
  if (authService.isAdmin()) {
    return true;
  }

  return router.createUrlTree(['/']);
};
