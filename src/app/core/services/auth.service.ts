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

  // Signals para estado de autenticación
  readonly currentUser = signal<Usuario | null>(null);
  readonly token = signal<string | null>(null);

  // Signals computadas
  readonly isLoggedIn = computed(() => !!this.token());
  readonly isAdmin = computed(() => this.currentUser()?.rol === 'ORGANIZADOR');

  constructor() {
    this.cargarSesion();
  }

  /**
   * Inicia sesión con email y contraseña.
   */
  login(credenciales: LoginCredentials): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, credenciales)
      .pipe(tap((res) => this.guardarSesion(res)));
  }

  /**
   * Registra un nuevo usuario.
   */
  registro(datos: RegistroCredentials): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/registro`, datos)
      .pipe(tap((res) => this.guardarSesion(res)));
  }

  /**
   * Cierra la sesión activa.
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.token.set(null);
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
   * Guarda los datos de sesión en localStorage y actualiza los signals.
   */
  private guardarSesion(auth: AuthResponse): void {
    localStorage.setItem('token', auth.token);
    localStorage.setItem('usuario', JSON.stringify(auth.usuario));
    this.token.set(auth.token);
    this.currentUser.set(auth.usuario);
  }

  /**
   * Carga los datos de sesión almacenados al arrancar el servicio.
   */
  private cargarSesion(): void {
    const token = localStorage.getItem('token');
    const usuarioStr = localStorage.getItem('usuario');

    if (token && usuarioStr) {
      try {
        const usuario = JSON.parse(usuarioStr) as Usuario;
        this.token.set(token);
        this.currentUser.set(usuario);
      } catch (err) {
        console.error('Error cargando sesión persistida:', err);
        this.logout();
      }
    }
  }

  /**
   * Verifica el código 2FA enviado por el usuario.
   */
  verificar2FA(email: string, codigo: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/2fa/verify`, { email, codigo })
      .pipe(tap((res) => this.guardarSesion(res)));
  }

  /**
   * Guarda el token de Google tras el callback.
   */
  guardarToken(token: string): void {
    // Si tu respuesta del callback incluye el usuario, deberías obtenerlo también aquí
    localStorage.setItem('token', token);
    this.token.set(token);
    // Nota: Si el backend envía el usuario en el callback, deberías guardarlo aquí
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
}
