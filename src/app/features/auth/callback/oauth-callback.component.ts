import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  template: `<div class="p-5 text-center">Validando acceso...</div>`,
})
export class OAuthCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit() {
    // Captura el token que viene de la URL (ej: /auth/callback?token=XYZ)
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.authService.guardarToken(token); // Este método lo debes tener en tu AuthService
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
