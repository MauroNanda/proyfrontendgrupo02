import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InscripcionService } from '../../../core/services/inscripcion.service';
import { EventoService, Evento } from '../../../core/services/evento.service';
import { ToastService } from '../../../core/services/toast.service';
import { ExportService } from '../../../core/services/export.service';

@Component({
  selector: 'app-attendee-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './attendee-list.component.html',
  styleUrls: ['./attendee-list.component.scss'],
})
export class AttendeeListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private inscripcionService = inject(InscripcionService);
  private eventoService = inject(EventoService);
  private toastService = inject(ToastService);
  private exportService = inject(ExportService);

  eventoId = '';
  readonly evento = signal<Evento | null>(null);
  readonly inscriptos = signal<any[]>([]);
  readonly loading = signal(true);
  readonly actionLoading = signal(false);
  readonly count = signal(0);

  // Estadísticas reactivas de inscripciones
  readonly stats = signal<any>({ CONFIRMADO: 0, ESPERA: 0, ASISTIO: 0, CANCELADO: 0 });
  readonly inscriptosTotales = computed(() => {
    const s = this.stats();
    return (s.CONFIRMADO || 0) + (s.ASISTIO || 0) + (s.ESPERA || 0);
  });
  readonly checkinPct = computed(() => {
    const totalCupo = this.evento()?.cupo_maximo || 1;
    const checkedIn = this.stats().ASISTIO || 0;
    return Math.min(Math.round((checkedIn / totalCupo) * 100), 100);
  });

  search = '';
  readonly estadoFiltro = signal('');
  readonly page = signal(1);
  readonly limit = 10;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventoId = id;
      this.cargarEvento();
      this.cargarInscriptos();
    } else {
      this.toastService.error('ID de evento no válido');
    }
  }

  cargarEvento(): void {
    this.eventoService.obtenerPorId(this.eventoId).subscribe({
      next: (data) => this.evento.set(data),
      error: (err) => console.error('Error al cargar datos del evento', err),
    });
  }

  cargarInscriptos(): void {
    this.loading.set(true);
    this.inscripcionService
      .obtenerInscriptosPorEvento(this.eventoId, {
        search: this.search,
        estado: this.estadoFiltro() || undefined,
        page: this.page(),
        limit: this.limit,
      })
      .subscribe({
        next: (res) => {
          this.inscriptos.set(res.rows);
          this.count.set(res.count);
          if (res.stats) {
            this.stats.set(res.stats);
          }
          this.loading.set(false);
        },
        error: (err) => {
          this.toastService.error('Error al cargar lista de inscriptos');
          this.loading.set(false);
        },
      });
  }

  buscar(): void {
    this.page.set(1);
    this.cargarInscriptos();
  }

  filtrarEstado(estado: string): void {
    this.estadoFiltro.set(estado);
    this.page.set(1);
    this.cargarInscriptos();
  }

  checkInManual(id: string, nombreUsuario: string): void {
    if (!confirm(`¿Estás seguro de registrar la asistencia manual para ${nombreUsuario}?`)) {
      return;
    }

    this.actionLoading.set(true);
    this.inscripcionService.checkInManual(id).subscribe({
      next: () => {
        this.toastService.success(`Asistencia registrada con éxito para ${nombreUsuario}`);
        this.inscriptos.update((list) =>
          list.map((item) => (item.id === id ? { ...item, estado: 'ASISTIO' } : item)),
        );
        this.stats.update((s) => ({
          ...s,
          CONFIRMADO: Math.max(0, (s.CONFIRMADO || 0) - 1),
          ASISTIO: (s.ASISTIO || 0) + 1,
        }));
        this.actionLoading.set(false);
      },
      error: (err) => {
        this.toastService.error(err.error?.error?.message || 'Error al registrar asistencia');
        this.actionLoading.set(false);
      },
    });
  }

  obtenerIniciales(nombre: string): string {
    if (!nombre) return 'U';
    const parts = nombre.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  }

  obtenerColorAvatar(nombre: string): string {
    if (!nombre) return '#5289ad';
    const colors = ['#5289ad', '#8b5cf6', '#22c55e', '#ef4444', '#3b82f6', '#ec4899', '#f59e0b'];
    let hash = 0;
    for (let i = 0; i < nombre.length; i++) {
      hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }

  get totalPages(): number {
    return Math.ceil(this.count() / this.limit);
  }

  cambiarPagina(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.page.set(p);
    this.cargarInscriptos();
  }

  exportarExcel(): void {
    if (this.inscriptos().length === 0) {
      this.toastService.error('No hay inscriptos para exportar');
      return;
    }

    const dataToExport = this.inscriptos().map((item, idx) => ({
      Nº: idx + 1,
      Nombre: item.usuario?.nombre || 'Desconocido',
      Email: item.usuario?.email || 'Sin email',
      'Fecha Inscripción': item.createdAt ? new Date(item.createdAt).toLocaleString('es-ES') : '',
      Estado: item.estado,
    }));

    const eventTitle = this.evento()?.titulo || 'evento';
    this.exportService.exportarExcel(
      dataToExport,
      `inscriptos_${eventTitle.toLowerCase().replace(/\s+/g, '_')}`,
    );
    this.toastService.success('Listado exportado correctamente');
  }
}
