import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExportService } from '../../../../core/services/export.service';
import { EventoService, Evento } from '../../../../core/services/evento.service';
import { InscripcionService } from '../../../../core/services/inscripcion.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-test-export',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './test-export.html',
  styleUrls: ['./test-export.scss'],
})
export class TestExport implements OnInit {
  private readonly exportService = inject(ExportService);
  private readonly eventoService = inject(EventoService);
  private readonly inscripcionService = inject(InscripcionService);
  private readonly toastService = inject(ToastService);

  // Catálogo de eventos del sistema
  readonly eventos = signal<Evento[]>([]);
  readonly cargandoEventos = signal(true);

  // Evento actualmente seleccionado para reporte de asistentes
  readonly eventoSeleccionadoId = signal<string>('');
  readonly inscriptos = signal<any[]>([]);
  readonly cargandoInscriptos = signal(false);
  readonly totalInscriptos = signal<number>(0);

  // Estadísticas del evento seleccionado
  readonly stats = signal({
    confirmados: 0,
    espera: 0,
    asistio: 0,
    cancelado: 0,
  });

  // Campos para la edición interactiva del ticket (PDF)
  readonly previewNombre = signal<string>('Sebastian Villalba');
  readonly previewEvento = signal<string>('Conferencia Anual de Tech 2026');
  readonly previewOrganizador = signal<string>('Gestión Global de Eventos S.A.');
  readonly previewUuid = signal<string>('UUID-943CC9-2026');

  ngOnInit(): void {
    this.cargarEventos();
  }

  cargarEventos(): void {
    this.cargandoEventos.set(true);
    this.eventoService.obtenerTodos({ todos: true }).subscribe({
      next: (data) => {
        this.eventos.set(data);
        this.cargandoEventos.set(false);
      },
      error: (err) => {
        console.error('Error cargando eventos para reportes:', err);
        this.toastService.error('Error al cargar la lista de eventos.');
        this.cargandoEventos.set(false);
      },
    });
  }

  onEventoSeleccionado(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const id = target.value;
    this.eventoSeleccionadoId.set(id);

    if (!id) {
      this.inscriptos.set([]);
      this.totalInscriptos.set(0);
      this.stats.set({ confirmados: 0, espera: 0, asistio: 0, cancelado: 0 });
      return;
    }

    this.cargandoInscriptos.set(true);
    this.inscripcionService.obtenerInscriptosPorEvento(id).subscribe({
      next: (res) => {
        const rows = res.rows || [];
        this.inscriptos.set(rows);
        this.totalInscriptos.set(res.count || 0);

        let conf = 0,
          esp = 0,
          asis = 0,
          canc = 0;
        rows.forEach((ins: any) => {
          if (ins.estado === 'CONFIRMADO') conf++;
          else if (ins.estado === 'ESPERA') esp++;
          else if (ins.estado === 'ASISTIO') asis++;
          else if (ins.estado === 'CANCELADO') canc++;
        });

        this.stats.set({
          confirmados: conf,
          espera: esp,
          asistio: asis,
          cancelado: canc,
        });

        // Actualizar la vista previa del pase con los datos del evento real
        const seleccionado = this.eventos().find((e) => e.id === id);
        if (seleccionado) {
          this.previewEvento.set(seleccionado.titulo);
          this.previewOrganizador.set(seleccionado.ubicacion || 'Dirección de Eventos');

          if (rows.length > 0) {
            const primerAsistente = rows[0];
            this.previewNombre.set(primerAsistente.usuario?.nombre || 'Sin nombre');
            this.previewUuid.set(`ID-${primerAsistente.id.substring(0, 8).toUpperCase()}`);
          } else {
            this.previewNombre.set('Nombre de Asistente');
            this.previewUuid.set('SIN-INSCRIPTOS');
          }
        }

        this.cargandoInscriptos.set(false);
      },
      error: (err) => {
        console.error('Error cargando asistentes del evento:', err);
        this.toastService.error('Error al cargar asistentes del evento.');
        this.cargandoInscriptos.set(false);
      },
    });
  }

  exportarEventosExcel(): void {
    const listado = this.eventos();
    if (listado.length === 0) {
      this.toastService.warning('No hay eventos para exportar.');
      return;
    }

    const rowsExcel = listado.map((e) => ({
      ID: e.id,
      Título: e.titulo,
      Fecha: e.fecha ? new Date(e.fecha).toLocaleString('es-AR') : 'Sin fecha',
      Ubicación: e.ubicacion || 'Sin ubicación',
      'Cupo Máximo': e.cupo_maximo,
      Estado: e.estado,
      'Creado El': e.createdAt ? new Date(e.createdAt).toLocaleDateString('es-AR') : '—',
    }));

    this.exportService.exportarExcel(rowsExcel, `reporte_eventos_general`);
    this.toastService.success('Excel de eventos generado exitosamente.');
  }

  exportarAsistentesExcel(): void {
    const listado = this.inscriptos();
    const id = this.eventoSeleccionadoId();
    const seleccionado = this.eventos().find((e) => e.id === id);

    if (!seleccionado || listado.length === 0) {
      this.toastService.warning('Seleccioná un evento con inscripciones activas.');
      return;
    }

    const rowsExcel = listado.map((ins) => ({
      'ID Inscripción': ins.id,
      Nombre: ins.usuario?.nombre || 'Sin nombre',
      Email: ins.usuario?.email || 'Sin email',
      Rol: ins.usuario?.rol || 'ASISTENTE',
      Estado: ins.estado,
      'Fecha Registro': ins.createdAt ? new Date(ins.createdAt).toLocaleString('es-AR') : '—',
    }));

    const nameFile = `asistentes_${seleccionado.titulo.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
    this.exportService.exportarExcel(rowsExcel, nameFile);
    this.toastService.success('Listado de asistentes exportado a Excel.');
  }

  descargarPasePdf(): void {
    const nameFile = `pase_${this.previewNombre().toLowerCase().replace(/\s+/g, '_')}`;
    this.exportService.descargarPdf('ticket-enterprise-preview', nameFile);
    this.toastService.success('Pase descargado como PDF.');
  }
}
