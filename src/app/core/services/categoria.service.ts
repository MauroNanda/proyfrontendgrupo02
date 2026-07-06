import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
  Eventos?: any[];
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private api = inject(ApiService);

  getAll(): Observable<Categoria[]> {
    return this.api.get<Categoria[]>('/categorias');
  }

  create(data: Partial<Categoria>): Observable<Categoria> {
    return this.api.post<Categoria>('/categorias', data);
  }

  update(id: string, data: Partial<Categoria>): Observable<Categoria> {
    return this.api.put<Categoria>(`/categorias/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/categorias/${id}`);
  }
}
