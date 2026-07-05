import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import { environment } from '../../../../environments/environment';

Chart.register(...registerables);

interface KpiData {
  totalUsuarios: number;
  totalEventos: number;
  totalInscripciones: number;
  promedioValoracion: number | null;
}

interface MesRow {
  mes: string;
  total: string;
}

interface EstadoRow {
  estado: string;
  total: string;
}

interface ChartData {
  inscripcionesPorMes: MesRow[];
  distribucionEstados: EstadoRow[];
  eventosPorEstado: EstadoRow[];
}

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const ESTADO_COLORES: Record<string, string> = {
  CONFIRMADO: '#2A5C8A',
  ASISTIO: '#3BAD7D',
  CANCELADO: '#E55A50',
  ESPERA: '#E8A217',
  PUBLICADO: '#2A5C8A',
  BORRADOR: '#698696',
};

@Component({
  selector: 'app-dashboard',
  imports: [],
  template: `
    <div class="dashboard-wrapper px-3 px-md-4 py-4">
      <!-- Header -->
      <div class="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 class="h4 fw-bold mb-0">Panel de Control</h1>
          <p class="text-muted small mb-0">Resumen del sistema en tiempo real</p>
        </div>
        <button class="btn btn-sm btn-outline-primary" (click)="recargar()" [disabled]="cargando()">
          <i class="bi bi-arrow-clockwise me-1"></i>Actualizar
        </button>
      </div>

      <!-- Estado de carga / error -->
      @if (cargando()) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="text-muted mt-3 small">Cargando métricas...</p>
        </div>
      }

      @if (error()) {
        <div class="alert alert-danger d-flex align-items-center gap-2" role="alert">
          <i class="bi bi-exclamation-triangle-fill"></i>
          <span>{{ error() }}</span>
        </div>
      }

      @if (!cargando() && !error()) {
        <!-- KPI Cards -->
        <div class="row g-3 mb-4">
          <div class="col-6 col-lg-3">
            <div class="kpi-card card border-0 shadow-sm h-100">
              <div class="card-body p-3">
                <div class="d-flex align-items-center gap-3">
                  <div class="kpi-icon bg-primary-subtle text-primary rounded-3 p-2">
                    <i class="bi bi-people-fill fs-4"></i>
                  </div>
                  <div>
                    <p class="kpi-label text-muted small mb-0">Usuarios</p>
                    <p class="kpi-value fw-bold mb-0">{{ kpis()?.totalUsuarios ?? '—' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-6 col-lg-3">
            <div class="kpi-card card border-0 shadow-sm h-100">
              <div class="card-body p-3">
                <div class="d-flex align-items-center gap-3">
                  <div class="kpi-icon bg-warning-subtle text-warning rounded-3 p-2">
                    <i class="bi bi-calendar-event-fill fs-4"></i>
                  </div>
                  <div>
                    <p class="kpi-label text-muted small mb-0">Eventos</p>
                    <p class="kpi-value fw-bold mb-0">{{ kpis()?.totalEventos ?? '—' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-6 col-lg-3">
            <div class="kpi-card card border-0 shadow-sm h-100">
              <div class="card-body p-3">
                <div class="d-flex align-items-center gap-3">
                  <div class="kpi-icon bg-success-subtle text-success rounded-3 p-2">
                    <i class="bi bi-ticket-perforated-fill fs-4"></i>
                  </div>
                  <div>
                    <p class="kpi-label text-muted small mb-0">Inscripciones</p>
                    <p class="kpi-value fw-bold mb-0">{{ kpis()?.totalInscripciones ?? '—' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-6 col-lg-3">
            <div class="kpi-card card border-0 shadow-sm h-100">
              <div class="card-body p-3">
                <div class="d-flex align-items-center gap-3">
                  <div class="kpi-icon bg-danger-subtle text-danger rounded-3 p-2">
                    <i class="bi bi-star-fill fs-4"></i>
                  </div>
                  <div>
                    <p class="kpi-label text-muted small mb-0">Valoración</p>
                    <p class="kpi-value fw-bold mb-0">
                      @if (kpis()?.promedioValoracion) {
                        {{ kpis()!.promedioValoracion }}<span class="fs-6 text-muted">/5</span>
                      } @else {
                        <span class="text-muted fs-6">Sin datos</span>
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Gráficos -->
        <div class="row g-3">
          <!-- Barra: inscripciones por mes -->
          <div class="col-12 col-lg-7">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body p-3">
                <h6 class="fw-semibold mb-3">
                  <i class="bi bi-bar-chart-fill text-primary me-2"></i>Inscripciones por mes
                </h6>
                <div style="position: relative; height: 240px;">
                  <canvas #barCanvas></canvas>
                </div>
              </div>
            </div>
          </div>

          <!-- Torta: distribución de estados -->
          <div class="col-12 col-lg-5">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body p-3">
                <h6 class="fw-semibold mb-3">
                  <i class="bi bi-pie-chart-fill text-warning me-2"></i>Estados de inscripciones
                </h6>
                <div style="position: relative; height: 240px;">
                  <canvas #doughnutCanvas></canvas>
                </div>
              </div>
            </div>
          </div>

          <!-- Barra: eventos por estado -->
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-body p-3">
                <h6 class="fw-semibold mb-3">
                  <i class="bi bi-calendar3 text-success me-2"></i>Eventos por estado
                </h6>
                <div style="position: relative; height: 160px;">
                  <canvas #eventoCanvas></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .dashboard-wrapper {
        max-width: 1200px;
      }
      .kpi-card {
        transition:
          transform 0.15s ease,
          box-shadow 0.15s ease;
      }
      .kpi-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(42, 92, 138, 0.12) !important;
      }
      .kpi-icon {
        min-width: 48px;
        min-height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .kpi-value {
        font-size: 1.5rem;
        line-height: 1.2;
      }
      .kpi-label {
        font-size: 0.75rem;
        letter-spacing: 0.03em;
      }
    `,
  ],
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('barCanvas') barCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('doughnutCanvas') doughnutCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('eventoCanvas') eventoCanvas!: ElementRef<HTMLCanvasElement>;

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/dashboard`;

  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly kpis = signal<KpiData | null>(null);

  private charts: Chart[] = [];

  ngAfterViewInit(): void {
    this.cargarDatos();
  }

  recargar(): void {
    this.charts.forEach((c) => c.destroy());
    this.charts = [];
    this.error.set(null);
    this.cargando.set(true);
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    this.charts.forEach((c) => c.destroy());
  }

  private cargarDatos(): void {
    forkJoin({
      kpis: this.http.get<KpiData>(`${this.apiUrl}/kpis`),
      graficos: this.http.get<ChartData>(`${this.apiUrl}/charts`),
    }).subscribe({
      next: ({ kpis, graficos }) => {
        this.kpis.set(kpis);
        this.cargando.set(false);
        // Necesitamos un tick para que Angular actualice el DOM con @if antes de acceder a los canvas
        setTimeout(() => this.crearGraficos(graficos), 0);
      },
      error: () => {
        this.error.set(
          'No se pudieron cargar las métricas. Verificá que el servidor esté corriendo.',
        );
        this.cargando.set(false);
      },
    });
  }

  private crearGraficos(data: ChartData): void {
    this.crearBarraMes(data.inscripcionesPorMes);
    this.crearTortaEstados(data.distribucionEstados);
    this.crearBarraEventos(data.eventosPorEstado);
  }

  private crearBarraMes(rows: MesRow[]): void {
    const labels = rows.map((r) => {
      const d = new Date(r.mes);
      return `${MESES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
    });
    const valores = rows.map((r) => parseInt(r.total, 10));

    this.charts.push(
      new Chart(this.barCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Inscripciones',
              data: valores,
              backgroundColor: '#2A5C8A',
              borderRadius: 6,
              borderSkipped: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } },
            x: { grid: { display: false } },
          },
        },
      }),
    );
  }

  private crearTortaEstados(rows: EstadoRow[]): void {
    const labels = rows.map((r) => r.estado);
    const valores = rows.map((r) => parseInt(r.total, 10));
    const colores = labels.map((l) => ESTADO_COLORES[l] ?? '#adb5bd');

    this.charts.push(
      new Chart(this.doughnutCanvas.nativeElement, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{ data: valores, backgroundColor: colores, borderWidth: 2 }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { padding: 12, font: { size: 12 } } },
          },
          cutout: '60%',
        },
      }),
    );
  }

  private crearBarraEventos(rows: EstadoRow[]): void {
    const labels = rows.map((r) => r.estado);
    const valores = rows.map((r) => parseInt(r.total, 10));
    const colores = labels.map((l) => ESTADO_COLORES[l] ?? '#adb5bd');

    this.charts.push(
      new Chart(this.eventoCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Eventos',
              data: valores,
              backgroundColor: colores,
              borderRadius: 6,
              borderSkipped: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          plugins: { legend: { display: false } },
          scales: {
            x: { beginAtZero: true, ticks: { stepSize: 1 } },
            y: { grid: { display: false } },
          },
        },
      }),
    );
  }
}
