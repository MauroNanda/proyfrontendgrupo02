import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthResponse } from '../../../core/types';
import { environment } from '../../../../environments/environment';
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
            class="btn btn-outline-secondary w-100 py-2 rounded-3 d-flex align-items-center justify-content-center gap-2 font-sm fw-semibold bg-body-tertiary border-light text-dark-blue shadow-xs"
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
        border-color: var(--cv-border) !important;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
        background-color: var(--cv-card);
      }

      .auth-title {
        font-family: 'IBM Plex Serif', Georgia, serif !important;
        font-size: 1.75rem;
        font-weight: 700;
        margin-bottom: 0.25rem;
        color: var(--cv-text);
      }

      .auth-subtitle {
        color: var(--cv-text-muted);
        font-size: 0.875rem;
        margin-bottom: 1.5rem;
      }

      .auth-link {
        font-weight: 600;
        color: var(--cv-primary);
        &:hover {
          color: var(--cv-primary-hover);
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
        color: var(--cv-text) !important;
      }

      .shadow-xs {
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
      }

      .border-light {
        border-color: var(--cv-border) !important;
      }

      .form-control {
        border: 1px solid var(--cv-border-strong);
        transition:
          border-color 0.15s ease,
          box-shadow 0.15s ease;
        &:focus {
          border-color: var(--cv-primary);
          box-shadow: 0 0 0 3px rgba(82, 137, 173, 0.15);
        }
      }

      .btn-primary {
        background-color: var(--cv-primary);
        border-color: var(--cv-primary);
        &:hover {
          background-color: var(--cv-primary-hover);
          border-color: var(--cv-primary-hover);
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
  private readonly destroyRef = inject(DestroyRef);

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
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (res: AuthResponse) => {
          if (res.requiere2FA) {
            // sessionStorage (no localStorage): el email queda solo en la pestaña.
            sessionStorage.setItem('login_email', res.email ?? this.form.value.username!);
            this.toastService.info('Se ha enviado un código a tu correo');
            this.router.navigate(['/auth/2fa']); // Redirigimos al componente 2FA
            return;
          }
          this.toastService.success('Sesión iniciada correctamente');
          this.authService.redirigirPostAuth(returnUrl);
        },
        error: () =>
          this.toastService.error('No pudimos iniciar sesión. Revisá tu usuario y contraseña.'),
      });
  }

  iniciarGoogle(): void {
    // Base del backend desde environment (no hardcodear host/protocolo).
    window.location.href = `${environment.apiUrl}/auth/google`;
  }
}
