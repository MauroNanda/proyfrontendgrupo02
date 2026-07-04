import { Component, OnInit } from '@angular/core';
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
  eventos: Evento[] = [];
  eventosFiltrados: Evento[] = [];

  filtroEstado = '';

  constructor(private eventoService: EventoService) {}

  ngOnInit(): void {
    this.eventoService.obtenerTodos().subscribe({
      next: (data) => {
        this.eventos = data;
        this.eventosFiltrados = data;
      },
      error: (err) => {
        console.log('Error cargando eventos', err);
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
}
