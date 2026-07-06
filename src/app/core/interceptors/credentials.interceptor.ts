import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

// Reemplaza al jwtInterceptor: el token ya no viaja en un header Bearer sino en
// una cookie httpOnly que setea el backend. withCredentials hace que el navegador
// adjunte esa cookie en cada request a la API (se acota a apiUrl para no mandar
// credenciales a hosts de terceros).
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith(environment.apiUrl)) {
    req = req.clone({ withCredentials: true });
  }
  return next(req);
};
