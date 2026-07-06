import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EventoService, Evento } from '../../../core/services/evento.service';
import { InscripcionService, InscripcionEstado } from '../../../core/services/inscripcion.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ExportService } from '../../../core/services/export.service';

import { CountdownComponent } from '../../../shared/components/countdown/countdown.component';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, CountdownComponent],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss'],
})
export class EventDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventoService = inject(EventoService);
  private inscripcionService = inject(InscripcionService);
  protected authService = inject(AuthService);
  private toastService = inject(ToastService);
  private exportService = inject(ExportService);

  readonly evento = signal<Evento | null>(null);
  readonly inscripcion = signal<InscripcionEstado>({
    inscrito: false,
    estado: null,
    qr_token: null,
  });
  readonly qrCodeDataUrl = signal<string>('');
  readonly loading = signal(true);
  readonly actionLoading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.route.paramMap.subscribe({
      next: (params) => {
        const id = params.get('id');
        if (!id) {
          this.error.set('ID de evento no válido');
          this.loading.set(false);
          return;
        }
        this.cargarDatos(id);
      },
    });
  }

  cargarDatos(eventoId: string): void {
    this.loading.set(true);
    this.eventoService.obtenerPorId(eventoId).subscribe({
      next: (evt) => {
        this.evento.set(evt);
        this.error.set(null);

        // Si está autenticado, cargar su estado de inscripción
        if (this.authService.isLoggedIn()) {
          this.cargarEstadoInscripcion(eventoId);
        } else {
          this.loading.set(false);
        }
      },
      error: (err) => {
        // Fallback a mock en caso de que no exista el evento en BD o endpoints no listos
        console.warn('No se pudo cargar el evento de la API. Usando datos simulados.', err);
        this.cargarMock(eventoId);
      },
    });
  }

  cargarEstadoInscripcion(eventoId: string): void {
    this.inscripcionService.obtenerEstado(eventoId).subscribe({
      next: (estado) => {
        this.inscripcion.set(estado);
        this.generarQrLocal(estado.qr_token);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando estado de inscripción:', err);
        this.loading.set(false);
      },
    });
  }

  cargarMock(eventoId: string): void {
    const mockEvento: Evento = {
      id: eventoId,
      titulo: 'Hackathon Universitaria Convoca 2026',
      cupo_maximo: 50,
      estado: 'PUBLICADO',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.evento.set(mockEvento);
    this.error.set(null);

    if (this.authService.isLoggedIn()) {
      this.cargarEstadoInscripcion(eventoId);
    } else {
      this.loading.set(false);
    }
  }

  inscribirse(): void {
    const evt = this.evento();
    if (!evt) return;

    if (!this.authService.isLoggedIn()) {
      this.toastService.warning('Debes iniciar sesión para inscribirte');
      this.router.navigate(['/login']);
      return;
    }

    this.actionLoading.set(true);
    this.inscripcionService.inscribirse(evt.id).subscribe({
      next: (res) => {
        this.toastService.success(
          res.estado === 'ESPERA'
            ? 'Cupo lleno. Te has registrado en la LISTA DE ESPERA.'
            : '¡Inscripción CONFIRMADA con éxito!',
        );
        this.cargarEstadoInscripcion(evt.id);
        this.actionLoading.set(false);
      },
      error: () => {
        this.actionLoading.set(false);
      },
    });
  }

  cancelarInscripcion(): void {
    const evt = this.evento();
    if (!evt) return;

    if (!confirm('¿Estás seguro de que deseas cancelar tu inscripción a este evento?')) {
      return;
    }

    this.actionLoading.set(true);
    this.inscripcionService.cancelar(evt.id).subscribe({
      next: () => {
        this.toastService.info('Inscripción cancelada.');
        this.cargarEstadoInscripcion(evt.id);
        this.actionLoading.set(false);
      },
      error: () => {
        this.actionLoading.set(false);
      },
    });
  }

  private generarQrLocal(token: string | null): void {
    if (!token) {
      this.qrCodeDataUrl.set('');
      return;
    }
    QRCode.toDataURL(token, { width: 200, margin: 1 })
      .then((url: string) => {
        this.qrCodeDataUrl.set(url);
      })
      .catch((err: unknown) => {
        console.error('Error generando QR local:', err);
        this.qrCodeDataUrl.set('');
      });
  }

  descargarPdf(): void {
    const eventTitle = this.evento()?.titulo || 'pase_acceso';
    this.exportService.descargarPdf(
      'ticket-access-pass',
      `ticket_${eventTitle.toLowerCase().replace(/\s+/g, '_')}`,
    );
    this.toastService.success('Pase descargado en PDF');
  }

  // Formato que espera Google Calendar en `dates`: YYYYMMDDTHHMMSSZ (UTC).
  private formatearFechaGoogle(fecha: Date): string {
    return fecha
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}Z$/, 'Z');
  }

  agregarAGoogleCalendar(): void {
    const evento = this.evento();

    if (!evento?.fecha) {
      this.toastService.warning('Este evento no tiene una fecha definida.');
      return;
    }

    const inicio = new Date(evento.fecha);

    // Duración estimada de 2 horas
    const fin = new Date(inicio);
    fin.setHours(fin.getHours() + 2);

    const url =
      'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      `&text=${encodeURIComponent(evento.titulo)}` +
      `&dates=${this.formatearFechaGoogle(inicio)}/${this.formatearFechaGoogle(fin)}` +
      `&details=${encodeURIComponent(evento.descripcion ?? '')}` +
      `&location=${encodeURIComponent(evento.ubicacion ?? '')}`;

    // noopener: la pestaña nueva no puede acceder a window.opener (evita tabnabbing).
    window.open(url, '_blank', 'noopener');
  }
}
