import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

// Página HOME de la vista Asistente.
// Fase 0: hace un GET /api/health al backend para verificar end-to-end.
// Cuando arranque Fase 1 (catálogo de eventos), este componente se reemplaza.

type HealthResponse = {
  status: string;
  timestamp: string;
  database: string;
  environment: string;
};

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <header class="hero-header">
      <div class="hero-container">
        <!-- Columna de Texto -->
        <div>
          <div class="uni-badge">
            <i class="bi bi-mortarboard-fill me-1.5"></i>
            Facultad de Ingeniería · UNJu
          </div>
          <h1 class="cv-serif hero-title-text">
            Todo lo que pasa en tu facultad, organizado en un solo lugar.
          </h1>
          <p class="hero-description-text">
            Charlas, talleres y hackathons con inscripción en segundos, pase QR y gestión de cupos.
            La plataforma oficial de eventos académicos.
          </p>
          <div class="d-flex gap-3 mt-4 flex-wrap">
            <a routerLink="/eventos" class="btn-primary-accent text-decoration-none">
              Explorar eventos
              <i class="bi bi-arrow-right ms-1"></i>
            </a>
            @if (!authService.isLoggedIn()) {
              <a routerLink="/registro" class="btn-outline-accent text-decoration-none">
                Crear una cuenta
              </a>
            } @else if (authService.isAdmin()) {
              <a routerLink="/admin" class="btn-outline-accent text-decoration-none">
                <i class="bi bi-speedometer2 me-1"></i> Panel Organizador
              </a>
            }
          </div>
          <div class="d-flex gap-4 mt-4 flex-wrap text-muted small">
            <span><b class="cv-serif text-dark-blue font-md">+2.400</b> estudiantes</span>
            <span><b class="cv-serif text-dark-blue font-md">180</b> eventos / año</span>
            <span><b class="cv-serif text-dark-blue font-md">98%</b> asistencia</span>
          </div>
        </div>

        <!-- Columna del Estado de la API -->
        <div class="status-panel">
          <div class="status-header">ESTADO DEL SISTEMA</div>

          <div class="card border-0 shadow-xs rounded-3 p-3 bg-white mt-3">
            <div class="d-flex align-items-center gap-2 mb-3">
              <i
                class="bi"
                [class.bi-check-circle-fill]="health() && !error()"
                [class.bi-x-circle-fill]="error()"
                [class.bi-arrow-repeat]="loading()"
                [class.text-success]="health() && !error()"
                [class.text-danger]="error()"
                [class.text-muted]="loading()"
                [class.spin]="loading()"
                style="font-size: 1.2rem;"
              ></i>
              <h3 class="h6 mb-0 text-dark-blue fw-semibold">Operatividad</h3>
            </div>

            @if (loading()) {
              <div>
                <p class="text-muted mb-0 small">Verificando conexión...</p>
              </div>
            }
            @if (error()) {
              <div>
                <div class="alert alert-danger py-2 px-3 mb-0 small border-0 font-xs">
                  {{ error() }}
                </div>
              </div>
            }
            @if (health()) {
              <div class="d-flex flex-column gap-2 small">
                <div class="d-flex justify-content-between border-bottom pb-2 border-light">
                  <span class="text-muted">API</span>
                  <span class="fw-semibold text-dark-blue">{{ health()!.status }}</span>
                </div>
                <div class="d-flex justify-content-between border-bottom pb-2 border-light">
                  <span class="text-muted">Base de datos</span>
                  <span class="fw-semibold text-dark-blue">{{ health()!.database }}</span>
                </div>
                <div class="d-flex justify-content-between pb-0.5">
                  <span class="text-muted">Entorno</span>
                  <span class="fw-semibold text-dark-blue">{{ health()!.environment }}</span>
                </div>
              </div>
            }
          </div>

          @if (health() && !error()) {
            <div class="d-flex align-items-center gap-2 mt-3 text-success font-xs fw-semibold">
              <span class="status-pulse-dot"></span>
              Servicios listos · inscripciones abiertas
            </div>
          }
        </div>
      </div>
    </header>
  `,
  styles: [
    `
      .hero-header {
        border-bottom: 1px solid #e2e8f0;
        background: #ffffff;
      }

      .hero-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 80px 24px;
        display: grid;
        grid-template-columns: 1.15fr 0.85fr;
        gap: 48px;
        align-items: center;
      }

      @media (max-width: 768px) {
        .hero-container {
          grid-template-columns: 1fr;
          padding: 40px 24px;
          gap: 32px;
        }
      }

      .uni-badge {
        display: inline-flex;
        align-items: center;
        background: #e8f0f5;
        color: #3f6f8f;
        font-weight: 600;
        font-size: 0.775rem;
        padding: 6px 13px;
        border-radius: 7px;
        margin-bottom: 20px;
      }

      .hero-title-text {
        font-size: 2.75rem;
        line-height: 1.15;
        font-weight: 700;
        letter-spacing: -0.5px;
        margin: 0;
        color: #243c4c;
      }

      .hero-description-text {
        max-width: 520px;
        margin: 20px 0 0;
        font-size: 1.05rem;
        line-height: 1.6;
        color: #698696;
      }

      .btn-primary-accent {
        background-color: #5289ad;
        color: #ffffff;
        font-weight: 600;
        font-size: 0.925rem;
        border-radius: 8px;
        padding: 12px 24px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        transition: background 0.15s ease;

        &:hover {
          background-color: #437190;
        }
      }

      .btn-outline-accent {
        background-color: #ffffff;
        border: 1px solid #cbd8e0;
        color: #243c4c;
        font-weight: 600;
        font-size: 0.925rem;
        border-radius: 8px;
        padding: 12px 22px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        transition: all 0.15s ease;

        &:hover {
          background-color: #f8fafc;
          border-color: #acbcbf;
        }
      }

      .status-panel {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        padding: 24px;
      }

      .status-header {
        font-size: 11px;
        font-weight: 700;
        color: #94a9b6;
        letter-spacing: 0.8px;
      }

      .text-dark-blue {
        color: #243c4c !important;
      }

      .font-md {
        font-size: 1.15rem !important;
      }

      .font-xs {
        font-size: 0.8125rem !important;
      }

      .border-light {
        border-color: #f1f5f9 !important;
      }

      .status-pulse-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #22c55e;
        display: inline-block;
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0%,
        100% {
          box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.45);
        }
        50% {
          box-shadow: 0 0 0 5px rgba(34, 197, 94, 0);
        }
      }

      .spin {
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      .cv-serif {
        font-family: 'IBM Plex Serif', Georgia, serif !important;
      }
    `,
  ],
})
export class HomeComponent implements OnInit {
  private readonly api = inject(ApiService);
  protected readonly authService = inject(AuthService);

  readonly health = signal<HealthResponse | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.api.get<HealthResponse>('/health').subscribe({
      next: (res) => {
        this.health.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.message || 'No se pudo conectar al backend');
        this.loading.set(false);
      },
    });
  }
}
