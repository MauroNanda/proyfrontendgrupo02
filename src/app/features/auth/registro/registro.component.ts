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
      <div class="card auth-card border shadow-xs rounded-4">
        <div class="card-body p-4 p-md-5">
          <h1 class="auth-title cv-serif">Crear cuenta</h1>
          <p class="auth-subtitle">Registrate para inscribirte en eventos</p>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
            <div class="mb-3">
              <label for="nombre" class="form-label font-xs fw-semibold text-muted"
                >Nombre completo</label
              >
              <input
                id="nombre"
                type="text"
                class="form-control rounded-3 py-2 font-sm"
                formControlName="nombre"
                autocomplete="name"
                [class.is-invalid]="nombreInvalid"
              />
              @if (nombreInvalid) {
                <div class="invalid-feedback">El nombre es obligatorio</div>
              }
            </div>

            <div class="mb-3">
              <label for="username" class="form-label font-xs fw-semibold text-muted"
                >Nombre de usuario</label
              >
              <input
                id="username"
                type="text"
                class="form-control rounded-3 py-2 font-sm"
                formControlName="username"
                autocomplete="username"
                placeholder="Ej: jperez"
                [class.is-invalid]="usernameInvalid"
              />
              <div class="form-text font-xxs text-muted mt-1">
                Con esto vas a ingresar al sistema.
              </div>
              @if (usernameInvalid) {
                <div class="invalid-feedback">
                  @if (form.controls.username.errors?.['required']) {
                    El nombre de usuario es obligatorio
                  } @else if (form.controls.username.errors?.['minlength']) {
                    Mínimo 3 caracteres
                  } @else if (form.controls.username.errors?.['pattern']) {
                    Solo letras, números y guiones bajos
                  }
                </div>
              }
            </div>

            <div class="mb-3">
              <label for="email" class="form-label font-xs fw-semibold text-muted"
                >Correo electrónico</label
              >
              <input
                id="email"
                type="email"
                class="form-control rounded-3 py-2 font-sm"
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
              <label for="password" class="form-label font-xs fw-semibold text-muted"
                >Contraseña</label
              >
              <input
                id="password"
                type="password"
                class="form-control rounded-3 py-2 font-sm"
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
              <label for="confirmPassword" class="form-label font-xs fw-semibold text-muted"
                >Confirmar contraseña</label
              >
              <input
                id="confirmPassword"
                type="password"
                class="form-control rounded-3 py-2 font-sm"
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

            <button
              type="submit"
              class="btn btn-primary w-100 py-2 rounded-3 fw-semibold font-sm"
              [disabled]="loading()"
            >
              @if (loading()) {
                <span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                Registrando...
              } @else {
                Registrarme
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
            class="btn btn-outline-secondary w-100 py-2 rounded-3 d-flex align-items-center justify-content-center gap-2 font-sm fw-semibold bg-white border-light text-dark-blue shadow-xs"
          >
            <i class="bi bi-google text-danger"></i>
            Registrarse con Google
          </button>

          <p class="text-center mt-4 mb-0 font-xs text-muted">
            ¿Ya tienes cuenta?
            <a routerLink="/login" class="auth-link font-xs text-decoration-none">Ingresar</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-wrapper {
        max-width: 440px;
        padding: 3rem 0 4rem;
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
export class RegistroComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  readonly loading = signal(false);

  readonly form = this.fb.nonNullable.group(
    {
      nombre: ['', Validators.required],
      username: [
        '',
        [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9_]+$/)],
      ],
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

  get usernameInvalid(): boolean {
    const c = this.form.controls.username;
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
    const { nombre, username, email, password } = this.form.getRawValue();

    this.authService
      .registro({ nombre, username, email, password })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.toastService.success('Cuenta creada correctamente');
          this.authService.redirigirPostAuth();
        },
      });
  }
}
