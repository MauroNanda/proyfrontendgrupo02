import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  template: `<div class="p-5 text-center">Validando acceso...</div>`,
})
export class OAuthCallbackComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    // El backend manda el token en el fragment (#token=...), NO en la query:
    // el fragment no viaja al servidor, así que no queda en logs de acceso ni
    // en el header Referer. (El flujo con 2FA no llega acá: redirige a /auth/2fa.)
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const token = hash.get('token');
    const error = hash.get('error');

    if (error || !token) {
      this.router.navigate(['/login'], { queryParams: error ? { error } : {} });
      return;
    }

    // El callback solo trae el token; pedimos el perfil para poblar currentUser
    // (sin esto la UI no muestra nombre/rol y el guard de admin no funciona).
    this.authService.guardarToken(token);
    this.authService
      .cargarPerfil()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.authService.redirigirPostAuth(),
        error: () => this.router.navigate(['/']),
      });
  }
}
