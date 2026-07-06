import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Evento, EventoService } from '../../../../core/services/evento.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.css',
})
export class EventListComponent implements OnInit {
  private eventoService = inject(EventoService);
  private toastService = inject(ToastService);

  readonly eventos = signal<Evento[]>([]);
  readonly loading = signal(true);
  readonly eliminandoId = signal<string | null>(null);

  // Estados de filtrado y ordenamiento reactivos
  readonly filtroEstado = signal<string>('TODOS');
  readonly criterioOrden = signal<string>('FECHA_ASC');
  readonly buscarTexto = signal<string>('');

  // Listado filtrado y ordenado reactivamente en el cliente
  readonly eventosFiltrados = computed(() => {
    let list = this.eventos();

    // 1. Filtrado por texto de búsqueda (título o ubicación)
    const query = this.buscarTexto().toLowerCase().trim();
    if (query) {
      list = list.filter(
        (e) =>
          e.titulo.toLowerCase().includes(query) ||
          (e.ubicacion && e.ubicacion.toLowerCase().includes(query)),
      );
    }

    // 2. Filtrado por estado de publicación
    const estado = this.filtroEstado();
    if (estado !== 'TODOS') {
      list = list.filter((e) => e.estado === estado);
    }

    // 3. Ordenamiento según el criterio seleccionado
    const criterio = this.criterioOrden();
    return [...list].sort((a, b) => {
      if (criterio === 'FECHA_ASC') {
        const dA = a.fecha ? new Date(a.fecha).getTime() : 0;
        const dB = b.fecha ? new Date(b.fecha).getTime() : 0;
        return dA - dB;
      }
      if (criterio === 'FECHA_DESC') {
        const dA = a.fecha ? new Date(a.fecha).getTime() : 0;
        const dB = b.fecha ? new Date(b.fecha).getTime() : 0;
        return dB - dA;
      }
      if (criterio === 'TITULO_ASC') {
        return a.titulo.localeCompare(b.titulo);
      }
      if (criterio === 'OCUPACION_DESC') {
        const countA = a.inscripciones
          ? a.inscripciones.filter((i) => i.estado !== 'CANCELADO').length
          : 0;
        const countB = b.inscripciones
          ? b.inscripciones.filter((i) => i.estado !== 'CANCELADO').length
          : 0;
        const pctA = a.cupo_maximo > 0 ? countA / a.cupo_maximo : 0;
        const pctB = b.cupo_maximo > 0 ? countB / b.cupo_maximo : 0;
        return pctB - pctA; // Mayor tasa de ocupación primero
      }
      if (criterio === 'CREACION_DESC') {
        const cA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const cB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return cB - cA; // Más recientes creados primero
      }
      return 0;
    });
  });

  ngOnInit(): void {
    this.cargarEventos();
  }

  cargarEventos(): void {
    this.loading.set(true);
    this.eventoService.obtenerTodos({ todos: true }).subscribe({
      next: (data) => {
        this.eventos.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.toastService.error('Error al cargar los eventos');
        this.loading.set(false);
      },
    });
  }

  obtenerCantidadInscriptos(evento: Evento): number {
    if (!evento.inscripciones) return 0;
    return evento.inscripciones.filter((ins) => ins.estado !== 'CANCELADO').length;
  }

  confirmarEliminar(evento: Evento): void {
    if (!confirm(`¿Eliminar el evento "${evento.titulo}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    this.eliminandoId.set(evento.id);
    this.eventoService.eliminar(evento.id).subscribe({
      next: () => {
        this.toastService.success('Evento eliminado correctamente');
        this.eliminandoId.set(null);
        this.cargarEventos();
      },
      error: () => {
        this.toastService.error('Error al eliminar el evento');
        this.eliminandoId.set(null);
      },
    });
  }

  // Métodos auxiliares para actualizar filtros desde la UI
  actualizarBuscar(val: string): void {
    this.buscarTexto.set(val);
  }

  actualizarEstado(val: string): void {
    this.filtroEstado.set(val);
  }

  actualizarOrden(val: string): void {
    this.criterioOrden.set(val);
  }
}
