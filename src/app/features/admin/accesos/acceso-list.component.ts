import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Acceso, AccesoService } from '../../../core/services/acceso.service';

@Component({
  selector: 'app-acceso-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4 px-3 px-md-4">
      <!-- Encabezado -->
      <div class="mb-4">
        <h1 class="h4 fw-bold text-dark-blue cv-serif mb-1">Historial de Accesos</h1>
        <p class="text-muted font-sm mb-0">
          Registro de inicios de sesión y registros (últimos 100).
        </p>
      </div>

      <div class="card border shadow-xs rounded-4 overflow-hidden">
        <!-- Cargando -->
        <div *ngIf="cargando()" class="text-center py-5 text-muted font-sm">
          <span class="spinner-border spinner-border-sm me-2" role="status"></span>
          Cargando accesos...
        </div>

        <!-- Error -->
        <div *ngIf="!cargando() && error()" class="text-center py-5 text-muted font-sm">
          <i class="bi bi-exclamation-triangle d-block fs-4 mb-2"></i>
          No se pudo cargar el historial.
          <div class="mt-3">
            <button class="btn btn-sm btn-outline-primary rounded-3" (click)="cargar()">
              Reintentar
            </button>
          </div>
        </div>

        <!-- Vacío -->
        <div
          *ngIf="!cargando() && !error() && accesos().length === 0"
          class="text-center py-5 text-muted font-sm"
        >
          <i class="bi bi-clock-history d-block fs-4 mb-2"></i>
          Todavía no hay accesos registrados.
        </div>

        <!-- Listado -->
        <div *ngIf="!cargando() && !error() && accesos().length > 0">
          <!-- Cabecera (solo desktop) -->
          <div
            class="row mx-0 py-2 px-4 bg-light-gray border-bottom font-xs fw-bold text-muted text-uppercase tracking-wider d-none d-lg-flex"
          >
            <div class="col-lg-4 ps-0">Usuario</div>
            <div class="col-lg-3">Fecha</div>
            <div class="col-lg-2">IP</div>
            <div class="col-lg-2">Dispositivo</div>
            <div class="col-lg-1 text-end pe-0">Estado</div>
          </div>

          <!-- Filas -->
          <div
            *ngFor="let acceso of accesos()"
            class="row mx-0 py-3 px-4 border-bottom align-items-lg-center table-row"
          >
            <!-- Usuario -->
            <div class="col-12 col-lg-4 ps-lg-0 mb-2 mb-lg-0">
              <span class="fw-semibold text-dark-blue font-sm">{{
                acceso.usuario?.nombre || 'Usuario eliminado'
              }}</span>
              <div class="text-muted font-xxs mt-0.5">{{ acceso.usuario?.email || '—' }}</div>
            </div>

            <!-- Fecha -->
            <div class="col-6 col-lg-3 font-xs text-muted mb-2 mb-lg-0">
              <span class="d-lg-none text-uppercase fw-semibold font-xxs d-block">Fecha</span>
              {{ acceso.fecha | date: 'dd/MM/yyyy HH:mm' }} hs
            </div>

            <!-- IP -->
            <div class="col-6 col-lg-2 font-xs text-muted mb-2 mb-lg-0">
              <span class="d-lg-none text-uppercase fw-semibold font-xxs d-block">IP</span>
              {{ acceso.ip || '—' }}
            </div>

            <!-- Dispositivo -->
            <div class="col-6 col-lg-2 font-xs text-muted mb-2 mb-lg-0">
              <span class="d-lg-none text-uppercase fw-semibold font-xxs d-block">Dispositivo</span>
              <span class="d-inline-block text-truncate w-100" [title]="acceso.user_agent || ''">
                {{ acceso.user_agent || '—' }}
              </span>
            </div>

            <!-- Estado -->
            <div class="col-6 col-lg-1 text-lg-end pe-lg-0 mb-2 mb-lg-0">
              <span class="d-lg-none text-uppercase fw-semibold font-xxs d-block text-muted"
                >Estado</span
              >
              <span
                class="badge rounded-pill px-2 py-1 font-xxs fw-semibold"
                [ngClass]="
                  acceso.exitoso ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'
                "
              >
                {{ acceso.exitoso ? 'Éxito' : 'Fallido' }}
              </span>
            </div>
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
        color: var(--cv-text) !important;
      }

      .bg-light-gray {
        background-color: var(--cv-hover) !important;
      }

      .shadow-xs {
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
      }

      .card {
        border-color: var(--cv-border) !important;
      }

      .font-sm {
        font-size: 0.875rem !important;
      }

      .font-xs {
        font-size: 0.8125rem !important;
      }

      .font-xxs {
        font-size: 0.725rem !important;
      }

      .tracking-wider {
        letter-spacing: 0.06em;
      }

      .table-row {
        transition: background-color 0.15s ease;
      }

      .table-row:hover {
        background-color: var(--cv-hover) !important;
      }
    `,
  ],
})
export class AccesoListComponent implements OnInit {
  private accesoService = inject(AccesoService);
  private destroyRef = inject(DestroyRef);

  accesos = signal<Acceso[]>([]);
  cargando = signal(true);
  error = signal(false);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(false);

    this.accesoService
      .listar(100)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.accesos.set(data);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set(true);
          this.cargando.set(false);
        },
      });
  }
}
