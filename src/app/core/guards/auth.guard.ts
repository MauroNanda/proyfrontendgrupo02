import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

// Auth guard — esqueleto (Fase 0).
// Tarea T-01-3 lo completa: verificar si hay usuario logueado en AuthService.
// Si no hay sesión, redirigir a /login.

export const authGuard: CanActivateFn = (_route, _state) => {
  const _router = inject(Router);
  // TODO (T-01-3): const isLogged = inject(AuthService).isLoggedIn();
  // if (!isLogged) { router.navigateByUrl('/login'); return false; }
  return true;
};
