import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { timeout } from 'rxjs';
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
            <span><i class="bi bi-qr-code-scan text-primary me-1.5"></i> Acreditación por QR</span>
            <span
              ><i class="bi bi-hourglass-split text-primary me-1.5"></i> Lista de espera
              automática</span
            >
            <span><i class="bi bi-bell text-primary me-1.5"></i> Avisos al instante</span>
          </div>
        </div>

        <!-- Columna del Calendario Académico Ilustrativo -->
        <div class="calendar-preview-panel">
          <div class="calendar-widget-card animate-fade-in">
            <!-- Encabezado del widget -->
            <div
              class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-light"
            >
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-calendar-event text-primary fs-5"></i>
                <span class="widget-title-text fw-bold text-dark-blue">Próximos Eventos</span>
              </div>
              <span
                class="badge bg-primary-subtle text-primary rounded-pill px-2.5 py-1 font-xxs fw-semibold"
              >
                Agenda Activa
              </span>
            </div>

            <!-- Lista de eventos ilustrativos -->
            <div class="d-flex flex-column gap-3">
              <!-- Evento 1 -->
              <div
                class="event-item-widget d-flex align-items-center gap-3 py-2 px-2.5 rounded-3 bg-light-hover"
              >
                <!-- Date column (clean typography, no nested borders) -->
                <div
                  class="text-center flex-shrink-0 d-flex flex-column justify-content-center"
                  style="width: 50px;"
                >
                  <span
                    class="text-primary-accent fw-bold text-uppercase"
                    style="font-size: 0.65rem; letter-spacing: 1px;"
                    >Ago</span
                  >
                  <span class="fw-bold text-dark-blue fs-4 lh-1 mt-0.5">10</span>
                </div>
                <div class="flex-grow-1 min-w-0">
                  <h4 class="font-xs fw-bold text-dark-blue text-truncate mb-1">
                    Taller de Git & GitHub Avanzado
                  </h4>
                  <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <span class="text-muted font-xxs text-truncate">
                      <i class="bi bi-geo-alt me-1"></i>Lab. de Sistemas
                    </span>
                    <span
                      class="badge bg-success-subtle text-success rounded-pill font-xxs px-2.5 py-0.5"
                    >
                      Cupos Libres
                    </span>
                  </div>
                </div>
              </div>

              <!-- Evento 2 -->
              <div
                class="event-item-widget d-flex align-items-center gap-3 py-2 px-2.5 rounded-3 bg-light-hover"
              >
                <div
                  class="text-center flex-shrink-0 d-flex flex-column justify-content-center"
                  style="width: 50px;"
                >
                  <span
                    class="text-primary-accent fw-bold text-uppercase"
                    style="font-size: 0.65rem; letter-spacing: 1px;"
                    >Ago</span
                  >
                  <span class="fw-bold text-dark-blue fs-4 lh-1 mt-0.5">28</span>
                </div>
                <div class="flex-grow-1 min-w-0">
                  <h4 class="font-xs fw-bold text-dark-blue text-truncate mb-1">
                    Torneo E-Sports: League of Legends
                  </h4>
                  <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <span class="text-muted font-xxs text-truncate">
                      <i class="bi bi-geo-alt me-1"></i>Auditorio Central
                    </span>
                    <span
                      class="badge bg-primary-subtle text-primary rounded-pill font-xxs px-2.5 py-0.5"
                    >
                      Inscripciones
                    </span>
                  </div>
                </div>
              </div>

              <!-- Evento 3 -->
              <div
                class="event-item-widget d-flex align-items-center gap-3 py-2 px-2.5 rounded-3 bg-light-hover"
              >
                <div
                  class="text-center flex-shrink-0 d-flex flex-column justify-content-center"
                  style="width: 50px;"
                >
                  <span
                    class="text-primary-accent fw-bold text-uppercase"
                    style="font-size: 0.65rem; letter-spacing: 1px;"
                    >Sep</span
                  >
                  <span class="fw-bold text-dark-blue fs-4 lh-1 mt-0.5">02</span>
                </div>
                <div class="flex-grow-1 min-w-0">
                  <h4 class="font-xs fw-bold text-dark-blue text-truncate mb-1">
                    Seminario Python & Data Science
                  </h4>
                  <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <span class="text-muted font-xxs text-truncate">
                      <i class="bi bi-geo-alt me-1"></i>Aula Magna
                    </span>
                    <span
                      class="badge bg-warning-subtle text-warning rounded-pill font-xxs px-2.5 py-0.5"
                    >
                      Pocos Cupos
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer decorativo -->
            <div class="mt-3.5 pt-3 border-top text-center">
              <a
                routerLink="/eventos"
                class="text-decoration-none font-xs fw-bold text-primary hover-primary d-inline-flex align-items-center gap-1"
              >
                Ver calendario completo <i class="bi bi-chevron-right"></i>
              </a>
            </div>
          </div>
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

      .calendar-preview-panel {
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .calendar-widget-card {
        width: 100%;
        max-width: 440px;
        background: #ffffff;
        border: 1px solid #cbd8e0;
        border-radius: 16px;
        box-shadow: 0 10px 30px rgba(36, 60, 76, 0.04);
        padding: 24px 28px;
      }

      .widget-title-text {
        font-size: 0.95rem;
        font-family: 'Space Grotesk', sans-serif;
      }

      .event-item-widget {
        transition: all 0.2s ease;
        border: 1px solid transparent !important;
      }

      .bg-light-hover:hover {
        background-color: #f8fafc;
        border-color: #cbd8e0 !important;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(36, 60, 76, 0.02);
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
    this.api
      .get<HealthResponse>('/health')
      .pipe(timeout(8000)) // Evita quedar en "cargando" indefinido si el backend no responde.
      .subscribe({
        next: (res) => {
          this.health.set(res);
          this.loading.set(false);
        },
        error: (err) => {
          const mensaje =
            err?.name === 'TimeoutError'
              ? 'El backend no respondió a tiempo'
              : err?.message || 'No se pudo conectar al backend';
          this.error.set(mensaje);
          this.loading.set(false);
        },
      });
  }
}
