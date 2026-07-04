import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface Evento {
  id: string;
  titulo: string;
  descripcion?: string;
  fecha?: string;
  ubicacion?: string;
  cupo_maximo: number;
  estado: 'BORRADOR' | 'PUBLICADO' | 'CANCELADO';
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class EventoService {
  private api = inject(ApiService);

  obtenerPorId(id: string): Observable<Evento> {
    return this.api.get<Evento>(`/eventos/${id}`);
  }

  obtenerTodos(): Observable<Evento[]> {
    return this.api.get<Evento[]>('/eventos');
  }
}
