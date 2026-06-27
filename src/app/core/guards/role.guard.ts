import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

// Role guard — esqueleto (Fase 0).
// Protege las rutas /admin/* verificando que el usuario tenga rol ORGANIZADOR.
// Tarea T-01-3 lo completa con la lógica real conectada al AuthService.

export const roleGuard: CanActivateFn = (_route, _state) => {
  const _router = inject(Router);
  // TODO (T-01-3): const rol = inject(AuthService).rol();
  // if (rol !== 'ORGANIZADOR') { router.navigateByUrl('/'); return false; }
  return true;
};
