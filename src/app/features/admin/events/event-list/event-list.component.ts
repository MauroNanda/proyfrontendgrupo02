import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { Evento, EventoService } from '../../../../core/services/evento.service';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.css',
})
export class EventListComponent implements OnInit {
  private eventoService = inject(EventoService);

  eventos: Evento[] = [];

  ngOnInit(): void {
    this.cargarEventos();
  }

  cargarEventos(): void {
    this.eventoService.obtenerTodos().subscribe({
      next: (data) => {
        this.eventos = data;
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
}
