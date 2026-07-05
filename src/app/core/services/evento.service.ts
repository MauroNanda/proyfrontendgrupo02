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
  categorias?: any[];
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

  obtenerTodos(params?: {
    todos?: boolean;
    search?: string;
    categoria?: string;
  }): Observable<Evento[]> {
    return this.api.get<Evento[]>('/eventos', params as Record<string, string | number | boolean>);
  }

  crear(datos: Partial<Evento>): Observable<Evento> {
    return this.api.post<Evento>('/eventos', datos);
  }

  actualizar(id: string, datos: Partial<Evento>): Observable<Evento> {
    return this.api.put<Evento>(`/eventos/${id}`, datos);
  }

  eliminar(id: string): Observable<void> {
    return this.api.delete<void>(`/eventos/${id}`);
  }
}
