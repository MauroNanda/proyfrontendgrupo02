import { Component, OnInit, inject, signal } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

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
  template: `
    <section class="hero-section">
      <div class="container text-center">
        <h1 class="hero-title">
          Todo lo que pasa en tu facu,
          <span class="hero-highlight">en un lugar.</span>
        </h1>
        <p class="hero-subtitle">
          Explorá charlas, talleres, hackathons y más. Inscribite en segundos.
        </p>
      </div>
    </section>

    <div class="container" style="max-width: 540px; padding-bottom: 3rem;">
      <section class="card">
        <div class="card-body">
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
              style="font-size: 1.25rem;"
            ></i>
            <h2 class="h6 mb-0">Estado del sistema</h2>
          </div>

          @if (loading()) {
            <p class="text-muted mb-0 small">Verificando conexión...</p>
          } @else if (error()) {
            <div class="alert alert-danger py-2 px-3 mb-0 small">
              {{ error() }}
            </div>
          } @else if (health()) {
            <div class="d-flex flex-column gap-1 small">
              <div class="d-flex justify-content-between">
                <span class="text-muted">API</span>
                <span class="fw-medium">{{ health()!.status }}</span>
              </div>
              <div class="d-flex justify-content-between">
                <span class="text-muted">Base de datos</span>
                <span class="fw-medium">{{ health()!.database }}</span>
              </div>
              <div class="d-flex justify-content-between">
                <span class="text-muted">Entorno</span>
                <span class="fw-medium">{{ health()!.environment }}</span>
              </div>
            </div>
          }
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      .hero-section {
        padding: 3.5rem 0 2.5rem;
        background-color: #e2e8f0;
        border-bottom: 1px solid rgba(172, 188, 191, 0.25);
        margin-bottom: 2rem;
      }

      .hero-title {
        font-size: 2.25rem;
        line-height: 1.25;
        max-width: 500px;
        margin: 0 auto 1rem;
      }

      .hero-highlight {
        color: var(--bs-primary);
      }

      .hero-subtitle {
        color: #698696;
        font-size: 1.05rem;
        max-width: 420px;
        margin: 0 auto;
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
    `,
  ],
})
export class HomeComponent implements OnInit {
  private readonly api = inject(ApiService);

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
