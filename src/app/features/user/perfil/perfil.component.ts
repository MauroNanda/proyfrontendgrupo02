import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div
      class="container py-5 min-vh-100 d-flex flex-column align-items-center justify-content-start"
    >
      <div class="profile-container w-100" style="max-width: 600px;">
        <!-- Header -->
        <div class="mb-4 text-center">
          <h1 class="h2 fw-bold text-dark-blue cv-serif mb-1">Mi Perfil</h1>
          <p class="text-muted small mb-0">Información de tu cuenta y opciones de seguridad.</p>
        </div>

        <!-- Card de Datos de Usuario -->
        <div class="card border shadow-xs rounded-4 p-4 bg-white mb-4">
          <div class="text-center pb-3 border-bottom mb-3">
            <div class="avatar-large mx-auto mb-3">
              {{ obtenerInicial(authService.currentUser()?.nombre) }}
            </div>

            <!-- Nombre (Vista / Edición) -->
            <div *ngIf="!editandoNombre()" class="mb-2">
              <h4
                class="fw-bold text-dark-blue mb-1 d-inline-flex align-items-center gap-2 justify-content-center w-100"
              >
                {{ authService.currentUser()?.nombre || 'Usuario' }}
                <button
                  (click)="iniciarEdicion()"
                  class="btn btn-link p-0 text-muted-blue hover-primary d-flex align-items-center"
                  style="border: none; background: transparent;"
                  title="Editar nombre"
                >
                  <i class="bi bi-pencil-square fs-6"></i>
                </button>
              </h4>
            </div>

            <div
              *ngIf="editandoNombre()"
              class="d-flex flex-column align-items-center gap-2 mb-3 w-100"
            >
              <input
                type="text"
                class="form-control text-center font-sm fw-semibold w-100 py-1.5 px-3"
                [(ngModel)]="nombreInput"
                placeholder="Nombre completo"
                style="max-width: 320px; border-radius: 8px;"
              />
              <div class="d-flex gap-2">
                <button (click)="guardarNombre()" class="btn btn-primary btn-sm rounded-3 px-3">
                  Guardar
                </button>
                <button
                  (click)="cancelarEdicion()"
                  class="btn btn-outline-secondary btn-sm rounded-3 px-3"
                >
                  Cancelar
                </button>
              </div>
            </div>

            <span class="badge bg-primary-subtle text-primary rounded-pill px-3 py-1 font-xxs">
              {{ authService.currentUser()?.rol | titlecase }}
            </span>
          </div>

          <div class="font-xs d-flex flex-column gap-3">
            <div>
              <span class="text-muted d-block font-xxs fw-semibold">CORREO ELECTRÓNICO</span>
              <div class="d-flex align-items-center gap-2">
                <span class="fw-semibold text-dark-blue font-sm">{{
                  mostrarCorreo()
                    ? authService.currentUser()?.email
                    : enmascararCorreo(authService.currentUser()?.email)
                }}</span>
                <button
                  (click)="toggleMostrarCorreo()"
                  class="btn btn-link p-0 text-muted-blue hover-primary d-flex align-items-center"
                  style="border: none; background: transparent;"
                  [title]="mostrarCorreo() ? 'Ocultar correo' : 'Mostrar correo'"
                >
                  <i class="bi" [ngClass]="mostrarCorreo() ? 'bi-eye-slash' : 'bi-eye'"></i>
                </button>
              </div>
            </div>
            <div *ngIf="authService.currentUser()?.username">
              <span class="text-muted d-block font-xxs fw-semibold">USUARIO DE SISTEMA</span>
              <span class="fw-semibold text-dark-blue font-sm">{{
                authService.currentUser()?.username
              }}</span>
            </div>
          </div>
        </div>

        <!-- Card de Seguridad (2FA) -->
        <div class="card border shadow-xs rounded-4 p-4 bg-white">
          <h5 class="fw-bold text-dark-blue mb-3 pb-2 border-bottom font-sm">
            <i class="bi bi-shield-lock-fill text-primary me-2"></i>Seguridad de Cuenta
          </h5>
          <div class="form-check form-switch p-0 m-0">
            <div class="d-flex align-items-center justify-content-between">
              <label
                class="form-check-label font-xs text-dark-blue fw-semibold"
                for="flexSwitch2FA"
              >
                Doble factor por email (2FA)
              </label>
              <input
                class="form-check-input ms-0"
                type="checkbox"
                id="flexSwitch2FA"
                [checked]="is2FAEnabled()"
                (change)="onToggle2FA($event)"
                style="cursor: pointer;"
              />
            </div>
            <p class="font-xxs text-muted mt-2 mb-0">
              Al activar 2FA, se te solicitará un código de un solo uso enviado a tu correo cada vez
              que inicies sesión.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .cv-serif {
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 700;
      }

      .text-dark-blue {
        color: #243c4c !important;
      }

      .font-xxs {
        font-size: 0.725rem !important;
      }

      .font-xs {
        font-size: 0.8125rem !important;
      }

      .font-sm {
        font-size: 0.875rem !important;
      }

      .avatar-large {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background-color: #5289ad;
        color: white;
        font-weight: 700;
        font-size: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 4px solid rgba(82, 137, 173, 0.1);
      }

      .card {
        border-color: #e2e8f0 !important;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02) !important;
      }

      .hover-primary:hover {
        color: #5289ad !important;
      }
    `,
  ],
})
export class PerfilComponent implements OnInit {
  protected authService = inject(AuthService);
  private toastService = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  is2FAEnabled = signal<boolean>(false);

  // Privacidad de correo
  mostrarCorreo = signal(false);

  toggleMostrarCorreo() {
    this.mostrarCorreo.update((v) => !v);
  }

  enmascararCorreo(email: string | undefined): string {
    if (!email) return '—';
    const partes = email.split('@');
    if (partes.length !== 2) return '••••••••';
    const [local, dominio] = partes;
    if (local.length <= 1) {
      return `•@${dominio}`;
    }
    return `${local.charAt(0)}${'•'.repeat(local.length - 1)}@${dominio}`;
  }

  // Edición de nombre
  editandoNombre = signal(false);
  nombreInput = '';

  ngOnInit() {
    const usuario = this.authService.currentUser();
    this.is2FAEnabled.set(!!usuario?.two_factor_enabled);
  }

  iniciarEdicion() {
    this.nombreInput = this.authService.currentUser()?.nombre || '';
    this.editandoNombre.set(true);
  }

  cancelarEdicion() {
    this.editandoNombre.set(false);
  }

  guardarNombre() {
    const nuevoNombre = this.nombreInput.trim();
    if (!nuevoNombre) {
      this.toastService.error('El nombre no puede estar vacío');
      return;
    }

    this.authService
      .actualizarPerfil(nuevoNombre)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.toastService.success(res.message);
          this.editandoNombre.set(false);
        },
        error: () => {
          // El interceptor ya muestra el mensaje de error.
        },
      });
  }

  onToggle2FA(event: Event) {
    const input = event.target as HTMLInputElement;
    const habilitar = input.checked;

    this.authService
      .configurar2FA(habilitar)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.is2FAEnabled.set(res.two_factor_enabled);
          this.toastService.success(res.message);
        },
        error: () => {
          input.checked = !habilitar;
        },
      });
  }

  obtenerInicial(nombre: string | undefined): string {
    return nombre ? nombre.charAt(0).toUpperCase() : 'U';
  }
}
