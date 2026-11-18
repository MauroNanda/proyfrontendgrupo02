import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Protege la navegacion; la API debe volver a verificar la sesion en cada operacion.
  if (authService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    // Conserva la pantalla solicitada para volver despues del login.
    queryParams: { returnUrl: state.url },
  });
};
