import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Acceso {
  id: string;
  fecha: string;
  ip: string | null;
  user_agent: string | null;
  exitoso: boolean;
  usuario?: {
    id: string;
    nombre: string;
    email: string;
  } | null;
}

@Injectable({ providedIn: 'root' })
export class AccesoService {
  private api = inject(ApiService);

  listar(limite = 100): Observable<Acceso[]> {
    return this.api.get<Acceso[]>('/dashboard/accesos', { limite });
  }
}
