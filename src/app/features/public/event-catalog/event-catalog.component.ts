import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EventoService, Evento } from '../../../core/services/evento.service';
import { CategoriaService, Categoria } from '../../../core/services/categoria.service';
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
  private readonly categoriaService = inject(CategoriaService);
  private readonly destroyRef = inject(DestroyRef);

  eventos: Evento[] = [];
  eventosFiltrados: Evento[] = [];
  categorias: Categoria[] = [];

  filtroEstado = '';
  filtroCategoria = '';

  readonly cargando = signal(true);
  readonly error = signal(false);

  ngOnInit(): void {
    this.cargando.set(true);

    // Cargar categorías
    this.categoriaService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.categorias = data;
        },
        error: (err) => {
          console.error('Error cargando categorías', err);
        },
      });

    // Cargar eventos
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
    let temp = this.eventos;

    if (this.filtroEstado) {
      temp = temp.filter((evento) => evento.estado === this.filtroEstado);
    }

    if (this.filtroCategoria) {
      temp = temp.filter((evento) =>
        evento.categorias?.some((c) => c.nombre === this.filtroCategoria),
      );
    }

    this.eventosFiltrados = temp;
  }

  cambiarFiltro(estado: string): void {
    this.filtroEstado = estado;
    this.filtrarEventos();
  }

  cambiarFiltroCategoria(categoria: string): void {
    this.filtroCategoria = categoria;
    this.filtrarEventos();
  }

  trackByEventoId(_index: number, evento: Evento): string {
    return evento.id;
  }
}
