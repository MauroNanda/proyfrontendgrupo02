import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

// Interceptor de Errores.
// Captura respuestas fallidas (4xx/5xx), maneja expiración de sesión (401)
// y notifica el error usando ToastService.

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let mensajeError = 'Ha ocurrido un error inesperado';

      if (error.status === 401) {
        mensajeError = 'Sesión expirada o no autorizada';
        const isAuthAttempt = req.url.includes('/auth/login') || req.url.includes('/auth/registro');
        if (!isAuthAttempt) {
          authService.logout();
        } else {
          mensajeError = error.error?.error?.message || 'Credenciales inválidas';
        }
      } else if (error.error && error.error.error && error.error.error.message) {
        // Formato estándar de errores del backend: { error: { message: "..." } }
        mensajeError = error.error.error.message;
      } else if (error.message) {
        mensajeError = error.message;
      }

      toastService.error(mensajeError);

      return throwError(() => error);
    }),
  );
};
