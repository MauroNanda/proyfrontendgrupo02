import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, Usuario } from '../types';

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
  login(credenciales: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credenciales).pipe(
      tap((res) => this.guardarSesion(res))
    );
  }

  /**
   * Registra un nuevo usuario.
   */
  registro(datos: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/registro`, datos).pipe(
      tap((res) => this.guardarSesion(res))
    );
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
}
