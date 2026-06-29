import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { finalize } from 'rxjs';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  if (!password || !confirm) return null;
  return password === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="container auth-wrapper">
      <div class="card auth-card">
        <div class="card-body p-4 p-md-5">
          <h1 class="auth-title">Crear cuenta</h1>
          <p class="auth-subtitle">Registrate para inscribirte en eventos</p>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
            <div class="mb-3">
              <label for="nombre" class="form-label">Nombre completo</label>
              <input
                id="nombre"
                type="text"
                class="form-control"
                formControlName="nombre"
                autocomplete="name"
                [class.is-invalid]="nombreInvalid"
              />
              @if (nombreInvalid) {
                <div class="invalid-feedback">El nombre es obligatorio</div>
              }
            </div>

            <div class="mb-3">
              <label for="email" class="form-label">Correo electrónico</label>
              <input
                id="email"
                type="email"
                class="form-control"
                formControlName="email"
                autocomplete="email"
                [class.is-invalid]="emailInvalid"
              />
              @if (emailInvalid) {
                <div class="invalid-feedback">
                  @if (form.controls.email.errors?.['required']) {
                    El correo es obligatorio
                  } @else if (form.controls.email.errors?.['email']) {
                    Ingresa un correo válido
                  }
                </div>
              }
            </div>

            <div class="mb-3">
              <label for="password" class="form-label">Contraseña</label>
              <input
                id="password"
                type="password"
                class="form-control"
                formControlName="password"
                autocomplete="new-password"
                [class.is-invalid]="passwordInvalid"
              />
              @if (passwordInvalid) {
                <div class="invalid-feedback">
                  @if (form.controls.password.errors?.['required']) {
                    La contraseña es obligatoria
                  } @else if (form.controls.password.errors?.['minlength']) {
                    Mínimo 8 caracteres
                  }
                </div>
              }
            </div>

            <div class="mb-4">
              <label for="confirmPassword" class="form-label">Confirmar contraseña</label>
              <input
                id="confirmPassword"
                type="password"
                class="form-control"
                formControlName="confirmPassword"
                autocomplete="new-password"
                [class.is-invalid]="confirmInvalid"
              />
              @if (confirmInvalid) {
                <div class="invalid-feedback">
                  @if (form.controls.confirmPassword.errors?.['required']) {
                    Confirma tu contraseña
                  } @else if (form.errors?.['passwordMismatch']) {
                    Las contraseñas no coinciden
                  }
                </div>
              }
            </div>

            <button type="submit" class="btn btn-primary w-100" [disabled]="loading()">
              @if (loading()) {
                <span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                Registrando...
              } @else {
                Registrarme
              }
            </button>
          </form>

          <p class="text-center mt-4 mb-0 small text-muted">
            ¿Ya tienes cuenta?
            <a routerLink="/login" class="auth-link">Ingresar</a>
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
export class RegistroComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  readonly loading = signal(false);

  readonly form = this.fb.nonNullable.group(
    {
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatch },
  );

  get nombreInvalid(): boolean {
    const c = this.form.controls.nombre;
    return c.invalid && (c.dirty || c.touched);
  }

  get emailInvalid(): boolean {
    const c = this.form.controls.email;
    return c.invalid && (c.dirty || c.touched);
  }

  get passwordInvalid(): boolean {
    const c = this.form.controls.password;
    return c.invalid && (c.dirty || c.touched);
  }

  get confirmInvalid(): boolean {
    const c = this.form.controls.confirmPassword;
    const mismatch = this.form.errors?.['passwordMismatch'] && c.touched;
    return (c.invalid && (c.dirty || c.touched)) || mismatch;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { nombre, email, password } = this.form.getRawValue();

    this.authService
      .registro({ nombre, email, password })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.toastService.success('Cuenta creada correctamente');
          this.authService.redirigirPostAuth();
        },
      });
  }
}
