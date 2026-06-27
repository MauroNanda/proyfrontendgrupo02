import { Component, OnInit, inject, signal } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

// Página HOME de la vista Asistente.
// Fase 0: hace un GET /api/health al backend para verificar end-to-end:
//   - CORS funciona,
//   - JWT interceptor no rompe la request,
//   - Backend está corriendo y conectado a Neon.
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
    <section class="text-center py-5">
      <h1 class="display-5 fw-bold">Convoca</h1>
      <p class="lead text-muted">Eventos que mueven la facultad.</p>
    </section>

    <section class="card shadow-sm">
      <div class="card-body">
        <h2 class="h5 mb-3">Estado del Backend (smoke test)</h2>

        @if (loading()) {
          <p class="text-muted mb-0">Consultando /api/health...</p>
        } @else if (error()) {
          <div class="alert alert-danger mb-0">
            <strong>Error:</strong> {{ error() }}
          </div>
        } @else if (health()) {
          <ul class="list-unstyled mb-0">
            <li><strong>API:</strong> {{ health()!.status }}</li>
            <li><strong>Base de datos:</strong> {{ health()!.database }}</li>
            <li><strong>Entorno:</strong> {{ health()!.environment }}</li>
            <li><strong>Timestamp:</strong> {{ health()!.timestamp }}</li>
          </ul>
        }
      </div>
    </section>
  `,
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
