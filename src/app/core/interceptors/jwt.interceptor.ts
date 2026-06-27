import { HttpInterceptorFn } from '@angular/common/http';

// Interceptor JWT — esqueleto (Fase 0).
// Tarea T-01-3 lo completa: leer token de localStorage / signal del AuthService
// y agregarlo en el header Authorization: Bearer <token>.

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // TODO (T-01-3): leer token desde AuthService.token() y clonar request con header.
  // const token = inject(AuthService).token();
  // if (token) {
  //   req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  // }
  return next(req);
};
