import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginCredentials, RegistroCredentials, Usuario } from '../types';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private apiUrl = `${environment.apiUrl}/auth`;

  // Estado de autenticación. Ya NO existe el signal `token`: el JWT vive en una
  // cookie httpOnly que el JS no puede leer (esa es la protección contra XSS).
  // La sesión se deriva de si hay un `usuario` cargado.
  readonly currentUser = signal<Usuario | null>(null);

  readonly isLoggedIn = computed(() => !!this.currentUser());
  readonly isAdmin = computed(() => this.currentUser()?.rol === 'ORGANIZADOR');

  constructor() {
    this.cargarSesion();
  }

  /**
   * Inicia sesión con email y contraseña. La cookie httpOnly la setea el backend;
   * acá solo guardamos el usuario. Si la respuesta pide 2FA todavía no hay sesión.
   */
  login(credenciales: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credenciales).pipe(
      tap((res) => {
        if (res.usuario) this.guardarSesion(res);
      }),
    );
  }

  /**
   * Registra un nuevo usuario.
   */
  registro(datos: RegistroCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/registro`, datos).pipe(
      tap((res) => {
        if (res.usuario) this.guardarSesion(res);
      }),
    );
  }

  /**
   * Cierra la sesión: le pide al backend que borre la cookie httpOnly (el front
   * no puede borrarla por sí mismo) y limpia el estado local pase lo que pase.
   */
  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({ error: () => {} });
    localStorage.removeItem('usuario');
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  /**
   * Redirige según rol tras login o registro exitoso.
   */
  redirigirPostAuth(returnUrl?: string | null): void {
    if (returnUrl && returnUrl !== '/login' && returnUrl !== '/registro') {
      this.router.navigateByUrl(returnUrl);
      return;
    }

    if (this.isAdmin()) {
      this.router.navigate(['/admin']);
      return;
    }

    this.router.navigate(['/']);
  }

  /**
   * Guarda el usuario (dato no sensible) como caché para el próximo arranque.
   * El token NO se guarda: viaja solo en la cookie httpOnly.
   */
  private guardarSesion(auth: AuthResponse): void {
    localStorage.setItem('usuario', JSON.stringify(auth.usuario));
    this.currentUser.set(auth.usuario);
  }

  /**
   * Arranque: restaura el usuario cacheado (UI instantánea, guards síncronos) y
   * revalida la sesión real pidiendo /perfil. Si la cookie venció o no existe,
   * el 401 lo maneja el errorInterceptor (hace logout).
   */
  private cargarSesion(): void {
    const usuarioStr = localStorage.getItem('usuario');
    if (!usuarioStr) return;
    try {
      this.currentUser.set(JSON.parse(usuarioStr) as Usuario);
      this.cargarPerfil().subscribe({ error: () => {} }); // revalidación en 2do plano
    } catch {
      localStorage.removeItem('usuario');
    }
  }

  /**
   * Verifica el código 2FA enviado por el usuario.
   */
  verificar2FA(email: string, codigo: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/2fa/verify`, { email, codigo }).pipe(
      tap((res) => {
        if (res.usuario) this.guardarSesion(res);
      }),
    );
  }

  /**
   * Pide el perfil al backend (autenticado por la cookie) y puebla currentUser.
   * Se usa al arrancar y tras el login con Google (el callback no devuelve usuario).
   */
  cargarPerfil(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/perfil`).pipe(
      tap((usuario) => {
        localStorage.setItem('usuario', JSON.stringify(usuario));
        this.currentUser.set(usuario);
      }),
    );
  }

  /**
   * Configura el estado del 2FA (activar/desactivar).
   */
  configurar2FA(habilitar: boolean): Observable<{ message: string; two_factor_enabled: boolean }> {
    return this.http.post<{ message: string; two_factor_enabled: boolean }>(
      `${this.apiUrl}/2fa/config`,
      { habilitar },
    );
  }

  /**
   * Actualiza los datos del perfil (nombre).
   */
  actualizarPerfil(nombre: string): Observable<{ message: string; usuario: Usuario }> {
    return this.http
      .put<{ message: string; usuario: Usuario }>(`${this.apiUrl}/perfil`, { nombre })
      .pipe(
        tap((res) => {
          if (res.usuario) {
            localStorage.setItem('usuario', JSON.stringify(res.usuario));
            this.currentUser.set(res.usuario);
          }
        }),
      );
  }
}
