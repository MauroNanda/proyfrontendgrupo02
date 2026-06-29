import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface InscripcionEstado {
  inscrito: boolean;
  estado: 'CONFIRMADO' | 'ESPERA' | 'CANCELADO' | 'ASISTIO' | null;
  qr_token: string | null;
}

export interface Inscripcion {
  id: string;
  usuarioId: string;
  eventoId: string;
  estado: 'CONFIRMADO' | 'ESPERA' | 'CANCELADO' | 'ASISTIO';
  qr_token: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class InscripcionService {
  private api = inject(ApiService);

  /**
   * Obtiene el estado de inscripción del usuario actual para un evento.
   */
  obtenerEstado(eventoId: string): Observable<InscripcionEstado> {
    return this.api.get<InscripcionEstado>(`/inscripciones/estado/${eventoId}`);
  }

  /**
   * Inscribe al usuario actual en un evento.
   */
  inscribirse(eventoId: string): Observable<Inscripcion> {
    return this.api.post<Inscripcion>('/inscripciones', { eventoId });
  }

  /**
   * Cancela la inscripción del usuario actual para un evento.
   */
  cancelar(eventoId: string): Observable<Inscripcion> {
    return this.api.delete<Inscripcion>(`/inscripciones/${eventoId}`);
  }

  /**
   * Registra el check-in (asistencia) mediante un token QR.
   */
  checkIn(qrToken: string): Observable<{ message: string; inscripcion: Inscripcion }> {
    return this.api.post<{ message: string; inscripcion: Inscripcion }>('/inscripciones/check-in', {
      qr_token: qrToken,
    });
  }
}
