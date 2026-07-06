import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { InscripcionService } from '../../../core/services/inscripcion.service';
import { ExportService } from '../../../core/services/export.service';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container py-5 min-vh-100">
      <!-- Header -->
      <div class="mb-4">
        <h1 class="h2 fw-bold text-dark-blue cv-serif mb-1">Mi Perfil</h1>
        <p class="text-muted small mb-0">Gestioná tu cuenta, seguridad e inscripciones.</p>
      </div>

      <div class="row g-4">
        <!-- Columna Izquierda: Información de Usuario y Seguridad -->
        <div class="col-12 col-lg-4">
          <!-- Card de Datos de Usuario -->
          <div class="card border shadow-xs rounded-4 p-4 bg-white mb-4">
            <div class="text-center pb-3 border-bottom mb-3">
              <div class="avatar-large mx-auto mb-3">
                {{ obtenerInicial(authService.currentUser()?.nombre) }}
              </div>
              <h5 class="fw-bold text-dark-blue mb-1">
                {{ authService.currentUser()?.nombre || 'Usuario' }}
              </h5>
              <span class="badge bg-primary-subtle text-primary rounded-pill px-3 py-1 font-xxs">
                {{ authService.currentUser()?.rol | titlecase }}
              </span>
            </div>

            <div class="font-xs d-flex flex-column gap-2">
              <div>
                <span class="text-muted d-block font-xxs">CORREO ELECTRÓNICO</span>
                <span class="fw-semibold text-dark-blue">{{
                  authService.currentUser()?.email
                }}</span>
              </div>
              <div>
                <span class="text-muted d-block font-xxs">USUARIO DE SISTEMA</span>
                <span class="fw-semibold text-dark-blue">{{
                  authService.currentUser()?.username || '—'
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
                <label class="form-check-label font-xs text-dark-blue" for="flexSwitch2FA">
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
                Al activar 2FA, se te solicitará un código de un solo uso enviado a tu correo cada
                vez que inicies sesión.
              </p>
            </div>
          </div>
        </div>

        <!-- Columna Derecha: Mis Inscripciones -->
        <div class="col-12 col-lg-8">
          <div class="card border shadow-xs rounded-4 p-4 bg-white h-100">
            <h4 class="fw-bold text-dark-blue mb-4 pb-2 border-bottom font-md">
              <i class="bi bi-ticket-detailed-fill text-primary me-2"></i>Mis Inscripciones
            </h4>

            <!-- Spinner de carga -->
            <div *ngIf="cargandoInscripciones()" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="text-muted small mt-2">Cargando tus inscripciones...</p>
            </div>

            <!-- Empty State -->
            <div
              *ngIf="!cargandoInscripciones() && inscripciones().length === 0"
              class="text-center py-5"
            >
              <i class="bi bi-calendar-x text-muted opacity-50 display-6"></i>
              <p class="text-muted small mt-3 mb-3">No estás inscripto en ningún evento todavía.</p>
              <a routerLink="/eventos" class="btn btn-primary btn-sm rounded-pill px-4">
                Explorar Catálogo
              </a>
            </div>

            <!-- Listado de Inscripciones -->
            <div
              *ngIf="!cargandoInscripciones() && inscripciones().length > 0"
              class="d-flex flex-column gap-3"
            >
              <div
                *ngFor="let ins of inscripciones()"
                class="card border p-3 bg-white rounded-4 hover-shadow"
              >
                <div class="d-flex justify-content-between align-items-start gap-2 mb-3">
                  <div>
                    <h5 class="h6 fw-bold text-dark-blue mb-1">{{ ins.evento.titulo }}</h5>
                    <div class="d-flex flex-column gap-1 text-muted font-xs">
                      <span>
                        <i class="bi bi-calendar-event text-primary me-1.5"></i>
                        {{ ins.evento.fecha | date: 'dd/MM/yyyy HH:mm' }} hs
                      </span>
                      <span>
                        <i class="bi bi-geo-alt text-primary me-1.5"></i>
                        {{ ins.evento.ubicacion }}
                      </span>
                    </div>
                  </div>

                  <!-- Badge de estado -->
                  <div [ngSwitch]="ins.estado">
                    <span
                      *ngSwitchCase="'CONFIRMADO'"
                      class="badge bg-success-subtle text-success rounded-pill px-2.5 py-1 font-xxs"
                    >
                      Confirmado
                    </span>
                    <span
                      *ngSwitchCase="'ESPERA'"
                      class="badge bg-warning-subtle text-warning rounded-pill px-2.5 py-1 font-xxs"
                    >
                      Lista de Espera
                    </span>
                    <span
                      *ngSwitchCase="'ASISTIO'"
                      class="badge bg-info-subtle text-info rounded-pill px-2.5 py-1 font-xxs"
                    >
                      Asistió
                    </span>
                    <span
                      *ngSwitchCase="'CANCELADO'"
                      class="badge bg-danger-subtle text-danger rounded-pill px-2.5 py-1 font-xxs"
                    >
                      Cancelado
                    </span>
                  </div>
                </div>

                <!-- Acciones de la inscripción -->
                <div class="d-flex justify-content-between align-items-center border-top pt-3">
                  <div>
                    <!-- Link al detalle del evento -->
                    <a
                      [routerLink]="['/eventos', ins.eventoId]"
                      class="text-decoration-none font-xs fw-semibold"
                    >
                      Ver detalle <i class="bi bi-arrow-right font-xxs"></i>
                    </a>
                  </div>

                  <div class="d-flex gap-2">
                    <!-- Botón Ver Pase (Confirmado o Asistió) -->
                    <button
                      *ngIf="ins.estado === 'CONFIRMADO' || ins.estado === 'ASISTIO'"
                      class="btn btn-sm btn-outline-primary rounded-3 font-xs"
                      (click)="abrirModalPase(ins)"
                    >
                      <i class="bi bi-qr-code-scan me-1"></i> Ver Pase
                    </button>

                    <!-- Botón Cancelar (CONFIRMADO o ESPERA en fecha futura) -->
                    <button
                      *ngIf="
                        (ins.estado === 'CONFIRMADO' || ins.estado === 'ESPERA') &&
                        esFechaFutura(ins.evento.fecha)
                      "
                      class="btn btn-sm btn-outline-danger rounded-3 font-xs"
                      [disabled]="cancelandoId() === ins.eventoId"
                      (click)="cancelarInscripcion(ins.eventoId)"
                    >
                      <i class="bi bi-x-circle me-1"></i> Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Pase de Acceso -->
    <div class="custom-modal-backdrop" *ngIf="mostrarModalPase()" (click)="cerrarModalPase()">
      <div
        class="custom-modal-content card p-4 border shadow-lg"
        (click)="$event.stopPropagation()"
      >
        <div class="d-flex align-items-center justify-content-between border-bottom pb-2 mb-3">
          <h5 class="fw-bold text-dark-blue mb-0">Mi Pase de Acceso</h5>
          <button class="btn btn-close" (click)="cerrarModalPase()"></button>
        </div>

        <div *ngIf="selectedInscripcion() as ins" class="text-center">
          <div class="ticket-border p-3 rounded-4 bg-light mb-3">
            <h5 class="fw-bold text-dark-blue text-truncate mb-2" [title]="ins.evento.titulo">
              {{ ins.evento.titulo }}
            </h5>
            <p class="font-xs text-muted mb-1">
              <i class="bi bi-calendar-event me-1"></i> {{ ins.evento.fecha | date: 'dd/MM/yyyy' }}
            </p>
            <p class="font-xs text-muted mb-3">
              <i class="bi bi-geo-alt me-1"></i> {{ ins.evento.ubicacion }}
            </p>

            <div class="bg-white p-3 rounded-3 d-inline-block border shadow-xs">
              <img
                [src]="selectedQrDataUrl()"
                alt="Código QR de Acceso"
                class="img-fluid"
                style="max-width: 180px;"
              />
            </div>
            <div class="font-xxs text-muted mt-2">ID: {{ ins.id }}</div>
          </div>

          <div class="d-flex gap-2">
            <button class="btn btn-primary btn-sm flex-grow-1" (click)="descargarPdf(ins)">
              <i class="bi bi-file-earmark-pdf me-1"></i> Descargar PDF
            </button>
            <button class="btn btn-outline-secondary btn-sm" (click)="cerrarModalPase()">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Elemento oculto/temporal para capturar el ticket PDF -->
    <div
      *ngIf="selectedInscripcion() as ins"
      style="position: absolute; left: -9999px; top: -9999px;"
    >
      <div
        id="ticket-capture"
        class="bg-white p-4 border rounded-4 shadow-sm"
        style="width: 380px; font-family: sans-serif; color: #1a2e38;"
      >
        <div class="text-center border-bottom pb-3 mb-3">
          <h4 class="fw-bold mb-1" style="color: #243c4c;">Convoca</h4>
          <span class="badge rounded-pill bg-primary px-3 py-1 font-xxs">PASE DE ACCESO</span>
        </div>
        <div class="mb-3">
          <h5 class="fw-bold text-dark mb-2">{{ ins.evento.titulo }}</h5>
          <div class="small text-muted mb-1">
            <i class="bi bi-calendar-event me-2"></i
            >{{ ins.evento.fecha | date: 'dd/MM/yyyy HH:mm' }} hs
          </div>
          <div class="small text-muted">
            <i class="bi bi-geo-alt me-2"></i>{{ ins.evento.ubicacion }}
          </div>
        </div>
        <div class="text-center bg-light p-3 rounded-3 mb-3 border">
          <img [src]="selectedQrDataUrl()" alt="QR Code" style="width: 180px; height: 180px;" />
          <div class="font-xxs text-muted mt-2">ID: {{ ins.id }}</div>
        </div>
        <div class="text-center text-muted small">
          Presentá este código QR en la entrada del evento.
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .avatar-large {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background-color: rgba(82, 137, 173, 0.7);
        color: white;
        font-weight: 700;
        font-size: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid rgba(82, 137, 173, 0.1);
      }

      .hover-shadow {
        transition:
          transform 0.15s ease,
          box-shadow 0.15s ease;
      }
      .hover-shadow:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(26, 46, 56, 0.08) !important;
      }

      .custom-modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(26, 46, 56, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        backdrop-filter: blur(4px);
      }

      .custom-modal-content {
        width: 100%;
        max-width: 400px;
        border-radius: 16px;
        background: white;
        animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }

      @keyframes scaleUp {
        from {
          transform: scale(0.95);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }

      .ticket-border {
        border: 2px dashed #acbcbf;
      }
    `,
  ],
})
export class PerfilComponent implements OnInit {
  protected authService = inject(AuthService);
  private toastService = inject(ToastService);
  private inscripcionService = inject(InscripcionService);
  private exportService = inject(ExportService);
  private destroyRef = inject(DestroyRef);

  is2FAEnabled = signal<boolean>(false);
  inscripciones = signal<any[]>([]);
  cargandoInscripciones = signal(true);
  cancelandoId = signal<string | null>(null);

  // Modal de pase
  mostrarModalPase = signal(false);
  selectedInscripcion = signal<any | null>(null);
  selectedQrDataUrl = signal<string>('');

  ngOnInit() {
    const usuario = this.authService.currentUser();
    this.is2FAEnabled.set(!!usuario?.two_factor_enabled);
    this.cargarInscripciones();
  }

  cargarInscripciones() {
    this.cargandoInscripciones.set(true);
    this.inscripcionService
      .obtenerMisInscripciones()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.inscripciones.set(data);
          this.cargandoInscripciones.set(false);
        },
        error: () => {
          this.toastService.error('Error al cargar tus inscripciones');
          this.cargandoInscripciones.set(false);
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
          this.toastService.error('No se pudo actualizar la configuración');
          input.checked = !habilitar;
        },
      });
  }

  cancelarInscripcion(eventoId: string) {
    if (!confirm('¿Estás seguro de que deseas cancelar esta inscripción?')) {
      return;
    }

    this.cancelandoId.set(eventoId);
    this.inscripcionService
      .cancelar(eventoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.success('Inscripción cancelada.');
          this.cancelandoId.set(null);
          this.cargarInscripciones();
        },
        error: (err) => {
          this.toastService.error(
            err.error?.error?.message || 'No se pudo cancelar la inscripción',
          );
          this.cancelandoId.set(null);
        },
      });
  }

  abrirModalPase(ins: any) {
    this.selectedInscripcion.set(ins);
    this.mostrarModalPase.set(true);

    if (ins.qr_token) {
      QRCode.toDataURL(ins.qr_token, { width: 200, margin: 1 })
        .then((url: string) => {
          this.selectedQrDataUrl.set(url);
        })
        .catch((err: unknown) => {
          console.error('Error generando QR de ticket:', err);
          this.selectedQrDataUrl.set('');
        });
    } else {
      this.selectedQrDataUrl.set('');
    }
  }

  cerrarModalPase() {
    this.mostrarModalPase.set(false);
    this.selectedInscripcion.set(null);
    this.selectedQrDataUrl.set('');
  }

  descargarPdf(ins: any) {
    const eventTitle = ins.evento.titulo || 'pase_acceso';
    setTimeout(() => {
      this.exportService.descargarPdf(
        'ticket-capture',
        `ticket_${eventTitle.toLowerCase().replace(/\s+/g, '_')}`,
      );
      this.toastService.success('Pase descargado en PDF');
    }, 150);
  }

  obtenerInicial(nombre: string | undefined): string {
    return nombre ? nombre.charAt(0).toUpperCase() : 'U';
  }

  esFechaFutura(fechaISO: string | undefined): boolean {
    if (!fechaISO) return false;
    return new Date(fechaISO) > new Date();
  }
}
