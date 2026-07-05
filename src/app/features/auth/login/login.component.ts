import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="container auth-wrapper">
      <div class="card auth-card border shadow-xs rounded-4">
        <div class="card-body p-4 p-md-5">
          <h1 class="auth-title cv-serif">Ingresar</h1>
          <p class="auth-subtitle">Accede a tu cuenta de Convoca</p>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
            <div class="mb-3">
              <label for="username" class="form-label font-xs fw-semibold text-muted"
                >Usuario</label
              >
              <input
                id="username"
                type="text"
                class="form-control rounded-3 py-2 font-sm"
                formControlName="username"
                autocomplete="username"
                placeholder="Ej: admin"
                [class.is-invalid]="usernameInvalid"
                aria-describedby="usernameError"
              />
              @if (usernameInvalid) {
                <div id="usernameError" class="invalid-feedback">El usuario es obligatorio</div>
              }
            </div>

            <div class="mb-4">
              <label for="password" class="form-label font-xs fw-semibold text-muted"
                >Contraseña</label
              >
              <input
                id="password"
                type="password"
                class="form-control rounded-3 py-2 font-sm"
                formControlName="password"
                autocomplete="current-password"
                [class.is-invalid]="passwordInvalid"
                aria-describedby="passwordError"
              />
              @if (passwordInvalid) {
                <div id="passwordError" class="invalid-feedback">La contraseña es obligatoria</div>
              }
            </div>

            <button
              type="submit"
              class="btn btn-primary w-100 py-2 rounded-3 fw-semibold font-sm"
              [disabled]="loading()"
            >
              @if (loading()) {
                <span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                Ingresando...
              } @else {
                Ingresar
              }
            </button>
          </form>

          <!-- Divider -->
          <div class="d-flex align-items-center my-4">
            <hr class="flex-grow-1 text-muted opacity-25 m-0" />
            <span class="mx-2 font-xxs text-muted text-uppercase tracking-wider">o</span>
            <hr class="flex-grow-1 text-muted opacity-25 m-0" />
          </div>

          <!-- Google OAuth Button -->
          <button
            type="button"
            (click)="iniciarGoogle()"
            class="btn btn-outline-secondary w-100 py-2 rounded-3 d-flex align-items-center justify-content-center gap-2 font-sm fw-semibold bg-white border-light text-dark-blue shadow-xs"
          >
            <i class="bi bi-google text-danger"></i>
            Iniciar sesión con Google
          </button>

          <p class="text-center mt-4 mb-0 font-xs text-muted">
            ¿No tienes cuenta?
            <a routerLink="/registro" class="auth-link font-xs text-decoration-none">Registrarme</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-wrapper {
        max-width: 440px;
        padding: 4rem 0 5rem;
      }

      .auth-card {
        border-color: #e2e8f0 !important;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
        background-color: #ffffff;
      }

      .auth-title {
        font-family: 'IBM Plex Serif', Georgia, serif !important;
        font-size: 1.75rem;
        font-weight: 700;
        margin-bottom: 0.25rem;
        color: #243c4c;
      }

      .auth-subtitle {
        color: #698696;
        font-size: 0.875rem;
        margin-bottom: 1.5rem;
      }

      .auth-link {
        font-weight: 600;
        color: #5289ad;
        &:hover {
          color: #437190;
        }
      }

      .font-xs {
        font-size: 0.8125rem !important;
      }

      .font-xxs {
        font-size: 0.725rem !important;
      }

      .font-sm {
        font-size: 0.875rem !important;
      }

      .text-dark-blue {
        color: #1a2e38 !important;
      }

      .shadow-xs {
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
      }

      .border-light {
        border-color: #e2e8f0 !important;
      }

      .form-control {
        border: 1px solid #cbd5e1;
        transition:
          border-color 0.15s ease,
          box-shadow 0.15s ease;
        &:focus {
          border-color: #5289ad;
          box-shadow: 0 0 0 3px rgba(82, 137, 173, 0.15);
        }
      }

      .btn-primary {
        background-color: #5289ad;
        border-color: #5289ad;
        &:hover {
          background-color: #437190;
          border-color: #437190;
        }
      }

      .cv-serif {
        font-family: 'IBM Plex Serif', Georgia, serif !important;
      }
    `,
  ],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(false);

  readonly form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  get usernameInvalid(): boolean {
    const c = this.form.controls.username;
    return c.invalid && (c.dirty || c.touched);
  }

  get passwordInvalid(): boolean {
    const c = this.form.controls.password;
    return c.invalid && (c.dirty || c.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    this.authService
      .login(this.form.getRawValue())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res: any) => {
          if (res.requiere2FA) {
            localStorage.setItem('login_email', this.form.value.username!);
            this.toastService.info('Se ha enviado un código a tu correo');
            this.router.navigate(['/auth/2fa']); // Redirigimos al componente 2FA
            return;
          }
          this.toastService.success('Sesión iniciada correctamente');
          this.authService.redirigirPostAuth(returnUrl);
        },
      });
  }

  iniciarGoogle(): void {
    window.location.href = 'http://localhost:3000/api/auth/google';
  }
}
