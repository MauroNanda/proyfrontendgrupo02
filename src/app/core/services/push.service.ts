import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Servicio para activar Web Push en el navegador.
 *
 * Flujo (como lo pide T-13):
 * 1. Registramos el service worker (sw.js)
 * 2. Pedimos permiso al usuario
 * 3. Obtenemos la PushSubscription del navegador
 * 4. La enviamos al backend con POST /api/push/subscribe
 */
@Injectable({
  providedIn: 'root',
})
export class PushService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/push`;

  /** True si el navegador soporta service workers y push */
  navegadorCompatible(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }

  /** Pide permiso, suscribe y guarda en el backend */
  async activarNotificaciones(): Promise<void> {
    if (!this.navegadorCompatible()) {
      throw new Error('Tu navegador no soporta notificaciones push.');
    }

    const clavePublica = await this.obtenerClavePublica();
    if (!clavePublica) {
      throw new Error('El servidor no tiene configuradas las claves VAPID.');
    }

    const registro = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    const permiso = await Notification.requestPermission();
    if (permiso !== 'granted') {
      throw new Error('Necesitamos tu permiso para enviarte alertas.');
    }

    const suscripcion = await registro.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.convertirClaveVapid(clavePublica),
    });

    await firstValueFrom(this.http.post(`${this.apiUrl}/subscribe`, suscripcion.toJSON()));
  }

  /** Trae la clave del backend; si falla, usa environment como respaldo */
  private async obtenerClavePublica(): Promise<string | null> {
    if (environment.vapidPublicKey) {
      return environment.vapidPublicKey;
    }

    try {
      const resp = await firstValueFrom(
        this.http.get<{ publicKey: string }>(`${this.apiUrl}/vapid-public-key`),
      );
      return resp.publicKey;
    } catch {
      return null;
    }
  }

  /**
   * El navegador espera la clave VAPID en formato Uint8Array (base64 url-safe).
   * Es un paso estándar de Web Push, no inventamos nada raro acá.
   */
  private convertirClaveVapid(base64String: string): Uint8Array<ArrayBuffer> {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = window.atob(base64);
    const buffer = new ArrayBuffer(raw.length);
    const salida = new Uint8Array(buffer);

    for (let i = 0; i < raw.length; i += 1) {
      salida[i] = raw.charCodeAt(i);
    }

    return salida;
  }
}
