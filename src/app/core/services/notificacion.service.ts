import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface Notificacion {
  id: string;
  usuario_id: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  tipo: 'INSCRIPCION' | 'RECORDATORIO' | 'CUPO_LIBERADO' | 'EVENTO_NUEVO';
  createdAt: string;
  updatedAt: string;
}

export interface NotificacionesResponse {
  status: string;
  data: {
    rows: Notificacion[];
    count: number;
    unreadCount: number;
  };
}

export interface GenericResponse<T> {
  status: string;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class NotificacionService {
  private api = inject(ApiService);

  /**
   * Obtiene las notificaciones del usuario logueado.
   */
  obtenerNotificaciones(filtros?: {
    leida?: boolean;
    limit?: number;
    page?: number;
  }): Observable<NotificacionesResponse> {
    const params: any = {};
    if (filtros) {
      if (filtros.leida !== undefined) params.leida = filtros.leida.toString();
      if (filtros.limit) params.limit = filtros.limit.toString();
      if (filtros.page) params.page = filtros.page.toString();
    }
    return this.api.get<NotificacionesResponse>('/notificaciones', params);
  }

  /**
   * Marca una notificación como leída.
   */
  marcarComoLeida(id: string): Observable<GenericResponse<Notificacion>> {
    return this.api.put<GenericResponse<Notificacion>>(`/notificaciones/${id}/leida`, {});
  }

  /**
   * Marca todas las notificaciones como leídas.
   */
  marcarTodasComoLeidas(): Observable<GenericResponse<{ success: boolean }>> {
    return this.api.put<GenericResponse<{ success: boolean }>>('/notificaciones/leer-todas', {});
  }
}
