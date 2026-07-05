import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EventoService, Evento } from '../../../core/services/evento.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-event-catalog',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './event-catalog.component.html',
  styleUrl: './event-catalog.component.css',
})
export class EventCatalogComponent implements OnInit {
  private readonly eventoService = inject(EventoService);
  private readonly destroyRef = inject(DestroyRef);

  eventos: Evento[] = [];
  eventosFiltrados: Evento[] = [];

  filtroEstado = '';

  readonly cargando = signal(true);
  readonly error = signal(false);

  ngOnInit(): void {
    this.cargando.set(true);
    this.eventoService
      .obtenerTodos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.eventos = data;
          this.eventosFiltrados = data;
          this.cargando.set(false);
        },
        error: (err) => {
          console.error('Error cargando eventos', err);
          this.error.set(true);
          this.cargando.set(false);
        },
      });
  }

  filtrarEventos() {
    if (!this.filtroEstado) {
      this.eventosFiltrados = this.eventos;
      return;
    }

    this.eventosFiltrados = this.eventos.filter((evento) => evento.estado === this.filtroEstado);
  }

  cambiarFiltro(estado: string): void {
    this.filtroEstado = estado;
    this.filtrarEventos();
  }

  // trackBy para evitar re-render completo del grid al filtrar.
  trackByEventoId(_index: number, evento: Evento): string {
    return evento.id;
  }
}
