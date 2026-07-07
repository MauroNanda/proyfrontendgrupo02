import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventoService, Evento } from '../../../core/services/evento.service';
import { AuthService } from '../../../core/services/auth.service';

// Página HOME de la vista Asistente: hero + widget con los próximos eventos
// reales (los más cercanos, publicados y con fecha futura). Cada evento del
// widget lleva a su detalle.

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
          <div class="hero-features d-flex gap-4 mt-4 flex-wrap text-muted small">
            <span><i class="bi bi-qr-code-scan text-primary me-1.5"></i> Acreditación por QR</span>
            <span
              ><i class="bi bi-hourglass-split text-primary me-1.5"></i> Lista de espera
              automática</span
            >
            <span><i class="bi bi-bell text-primary me-1.5"></i> Avisos al instante</span>
          </div>
        </div>

        <!-- Columna del widget de próximos eventos -->
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

            <!-- Lista de eventos reales (los más próximos) -->
            <div class="d-flex flex-column gap-3">
              @if (cargando()) {
                <p class="text-muted font-xs text-center py-3 mb-0">Cargando eventos...</p>
              } @else if (proximos().length === 0) {
                <p class="text-muted font-xs text-center py-3 mb-0">
                  No hay eventos próximos por ahora.
                </p>
              } @else {
                @for (ev of proximos(); track ev.id) {
                  <a
                    [routerLink]="['/eventos', ev.id]"
                    class="event-item-widget d-flex align-items-center gap-3 py-2 px-2.5 rounded-3 bg-light-hover text-decoration-none"
                  >
                    <div
                      class="text-center flex-shrink-0 d-flex flex-column justify-content-center"
                      style="width: 50px;"
                    >
                      <span
                        class="text-primary-accent fw-bold text-uppercase"
                        style="font-size: 0.65rem; letter-spacing: 1px;"
                        >{{ mesAbrev(ev.fecha) }}</span
                      >
                      <span class="fw-bold text-dark-blue fs-4 lh-1 mt-0.5">{{
                        dia(ev.fecha)
                      }}</span>
                    </div>
                    <div class="flex-grow-1 min-w-0">
                      <h4 class="font-xs fw-bold text-dark-blue text-truncate mb-1">
                        {{ ev.titulo }}
                      </h4>
                      <div
                        class="d-flex align-items-center justify-content-between flex-wrap gap-2"
                      >
                        <span class="text-muted font-xxs text-truncate">
                          <i class="bi bi-geo-alt me-1"></i>{{ ev.ubicacion || 'A confirmar' }}
                        </span>
                        <span
                          class="badge rounded-pill font-xxs px-2.5 py-0.5"
                          [class]="cupo(ev).clase"
                        >
                          {{ cupo(ev).texto }}
                        </span>
                      </div>
                    </div>
                  </a>
                }
              }
            </div>

            <!-- Enlace al catálogo completo -->
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
        border-bottom: 1px solid var(--cv-border);
        background: var(--cv-card);
      }

      .hero-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 80px 24px;
        display: grid;
        grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
        gap: 48px;
        align-items: center;
      }

      @media (max-width: 768px) {
        .hero-container {
          /* minmax(0, 1fr) permite que la columna encoja bajo el contenido:
             sin esto, un título o ubicación largos estiran la columna y el
             widget se desborda por la derecha (el text-truncate no actúa). */
          grid-template-columns: minmax(0, 1fr);
          padding: 40px 24px;
          gap: 40px;
        }

        .calendar-widget-card {
          max-width: 100%;
          padding: 20px 16px;
        }

        /* El bloque de info del evento puede encoger para que el título y la
           ubicación se corten con "…" en vez de tocar el borde del card. */
        .event-item-widget .flex-grow-1 {
          min-width: 0;
        }
        .event-item-widget h4,
        .event-item-widget .text-truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Los tres beneficios se apilan en columna, alineados y con su ícono,
           en vez de envolver de a uno y dejar el último huérfano. */
        .hero-features {
          flex-direction: column;
          gap: 0.65rem !important;
          margin-top: 1.5rem;
          padding-top: 1.25rem;
          border-top: 1px solid var(--cv-border);
        }

        .hero-features span {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .hero-features span i {
          font-size: 1.05rem;
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
        color: var(--cv-text);
      }

      .hero-description-text {
        max-width: 520px;
        margin: 20px 0 0;
        font-size: 1.05rem;
        line-height: 1.6;
        color: var(--cv-text-muted);
      }

      .btn-primary-accent {
        background-color: var(--cv-primary);
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
          background-color: var(--cv-primary-hover);
        }
      }

      .btn-outline-accent {
        background-color: var(--cv-card);
        border: 1px solid var(--cv-border-strong);
        color: var(--cv-text);
        font-weight: 600;
        font-size: 0.925rem;
        border-radius: 8px;
        padding: 12px 22px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        transition: all 0.15s ease;

        &:hover {
          background-color: var(--cv-hover);
          border-color: var(--cv-border-strong);
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
        background: var(--cv-card);
        border: 1px solid var(--cv-border-strong);
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
        background-color: var(--cv-hover);
        border-color: var(--cv-border-strong) !important;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(36, 60, 76, 0.02);
      }

      .text-dark-blue {
        color: var(--cv-text) !important;
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
  protected readonly authService = inject(AuthService);
  private readonly eventoService = inject(EventoService);

  readonly proximos = signal<Evento[]>([]);
  readonly cargando = signal(true);

  ngOnInit(): void {
    // El backend ya devuelve solo eventos publicados con fecha futura,
    // ordenados por fecha ascendente. Tomamos los tres más próximos.
    this.eventoService.obtenerTodos().subscribe({
      next: (eventos) => {
        // Solo eventos publicados: en "Próximos" no tiene sentido mostrar
        // cancelados (no se puede hacer nada con ellos).
        this.proximos.set(eventos.filter((e) => e.estado === 'PUBLICADO').slice(0, 3));
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  mesAbrev(fecha?: string): string {
    if (!fecha) return '';
    return new Date(fecha)
      .toLocaleDateString('es-AR', { month: 'short' })
      .replace('.', '')
      .toUpperCase();
  }

  dia(fecha?: string): string {
    if (!fecha) return '';
    return String(new Date(fecha).getDate()).padStart(2, '0');
  }

  // Badge de cupo, calculado con las inscripciones que trae el listado.
  cupo(ev: Evento): { texto: string; clase: string } {
    if (ev.estado === 'CANCELADO') {
      return { texto: 'Cancelado', clase: 'bg-danger-subtle text-danger' };
    }
    const ocupados = (ev.inscripciones || []).filter((i) =>
      ['CONFIRMADO', 'ASISTIO'].includes(i.estado),
    ).length;
    const libres = (ev.cupo_maximo ?? 0) - ocupados;
    if (libres <= 0) return { texto: 'Lista de espera', clase: 'bg-primary-subtle text-primary' };
    if (libres <= 5) return { texto: 'Pocos cupos', clase: 'bg-warning-subtle text-warning' };
    return { texto: 'Cupos libres', clase: 'bg-success-subtle text-success' };
  }
}
