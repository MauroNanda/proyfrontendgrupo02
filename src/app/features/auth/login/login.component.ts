import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="container auth-wrapper">
      <div class="card auth-card">
        <div class="card-body p-4 p-md-5">
          <h1 class="auth-title">Ingresar</h1>
          <p class="auth-subtitle">Accede a tu cuenta de Convoca</p>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
            <div class="mb-3">
              <label for="email" class="form-label">Correo electrónico</label>
              <input
                id="email"
                type="email"
                class="form-control"
                formControlName="email"
                autocomplete="email"
                [class.is-invalid]="emailInvalid"
                aria-describedby="emailError"
              />
              @if (emailInvalid) {
                <div id="emailError" class="invalid-feedback">
                  @if (form.controls.email.errors?.['required']) {
                    El correo es obligatorio
                  } @else if (form.controls.email.errors?.['email']) {
                    Ingresa un correo válido
                  }
                </div>
              }
            </div>

            <div class="mb-4">
              <label for="password" class="form-label">Contraseña</label>
              <input
                id="password"
                type="password"
                class="form-control"
                formControlName="password"
                autocomplete="current-password"
                [class.is-invalid]="passwordInvalid"
                aria-describedby="passwordError"
              />
              @if (passwordInvalid) {
                <div id="passwordError" class="invalid-feedback">La contraseña es obligatoria</div>
              }
            </div>

            <button type="submit" class="btn btn-primary w-100" [disabled]="loading()">
              @if (loading()) {
                <span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                Ingresando...
              } @else {
                Ingresar
              }
            </button>
          </form>

          <p class="text-center mt-4 mb-0 small text-muted">
            ¿No tienes cuenta?
            <a routerLink="/registro" class="auth-link">Registrarme</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-wrapper {
        max-width: 440px;
        padding: 2rem 0 3rem;
      }

      .auth-card {
        border: none;
        box-shadow: 0 4px 24px rgba(36, 60, 76, 0.08);
      }

      .auth-title {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 0.25rem;
      }

      .auth-subtitle {
        color: #698696;
        margin-bottom: 1.5rem;
      }

      .auth-link {
        font-weight: 500;
      }
    `,
  ],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  get emailInvalid(): boolean {
    const c = this.form.controls.email;
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
        next: () => {
          this.toastService.success('Sesión iniciada correctamente');
          this.authService.redirigirPostAuth(returnUrl);
        },
      });
  }
}
