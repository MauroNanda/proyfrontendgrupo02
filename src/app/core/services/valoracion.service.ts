import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Valoracion {
  id: string;
  usuario_id: string;
  evento_id: string;
  puntuacion: number;
  comentario: string | null;
}

export interface GuardarValoracionDto {
  evento_id: string;
  puntuacion: number;
  comentario?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ValoracionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/valoraciones`;

  guardar(datos: GuardarValoracionDto): Observable<Valoracion> {
    return this.http.post<Valoracion>(this.apiUrl, datos);
  }

  obtenerMiValoracion(eventoId: string): Observable<Valoracion | null> {
    return this.http.get<Valoracion | null>(`${this.apiUrl}/evento/${eventoId}`);
  }
}
