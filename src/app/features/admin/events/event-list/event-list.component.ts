import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

import { Evento, EventoService } from '../../../../core/services/evento.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.css',
})
export class EventListComponent implements OnInit {
  private eventoService = inject(EventoService);
  private toastService = inject(ToastService);

  readonly eventos = signal<Evento[]>([]);
  readonly loading = signal(true);
  readonly eliminandoId = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarEventos();
  }

  cargarEventos(): void {
    this.loading.set(true);
    this.eventoService.obtenerTodos().subscribe({
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
}
