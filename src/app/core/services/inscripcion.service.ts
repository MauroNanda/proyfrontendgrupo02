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

  /**
   * Obtiene la lista de inscriptos para un evento específico (solo Organizador).
   */
  obtenerInscriptosPorEvento(
    eventoId: string,
    filtros?: { estado?: string; search?: string; limit?: number; page?: number },
  ): Observable<{ count: number; rows: any[]; stats?: any }> {
    const params: any = {};
    if (filtros) {
      if (filtros.estado) params.estado = filtros.estado;
      if (filtros.search) params.search = filtros.search;
      if (filtros.limit) params.limit = filtros.limit.toString();
      if (filtros.page) params.page = filtros.page.toString();
    }
    return this.api.get<{ count: number; rows: any[]; stats?: any }>(
      `/inscripciones/evento/${eventoId}`,
      params,
    );
  }

  /**
   * Realiza el check-in manual de un inscripto (solo Organizador).
   */
  checkInManual(id: string): Observable<{ message: string; inscripcion: Inscripcion }> {
    return this.api.post<{ message: string; inscripcion: Inscripcion }>(
      `/inscripciones/${id}/check-in-manual`,
      {},
    );
  }

  /**
   * Obtiene la lista de inscripciones del asistente logueado con detalles de evento.
   */
  obtenerMisInscripciones(): Observable<any[]> {
    return this.api.get<any[]>('/inscripciones/mis-inscripciones');
  }
}
