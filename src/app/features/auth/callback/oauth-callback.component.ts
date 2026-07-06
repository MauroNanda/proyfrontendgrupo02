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
    // El backend ya dejó la cookie httpOnly en su redirect 302; acá solo
    // preguntamos "¿quién soy?" (con la cookie) para poblar currentUser.
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const error = hash.get('error');

    if (error) {
      this.router.navigate(['/login'], { queryParams: { error } });
      return;
    }

    this.authService
      .cargarPerfil()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.authService.redirigirPostAuth(),
        error: () => this.router.navigate(['/login'], { queryParams: { error: 'oauth' } }),
      });
  }
}
