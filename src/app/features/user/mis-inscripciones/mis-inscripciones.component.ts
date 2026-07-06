import { Component, DestroyRef, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InscripcionService } from '../../../core/services/inscripcion.service';
import { ToastService } from '../../../core/services/toast.service';
import { ExportService } from '../../../core/services/export.service';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-mis-inscripciones',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mis-inscripciones.component.html',
  styleUrl: './mis-inscripciones.component.css',
})
export class MisInscripcionesComponent implements OnInit {
  private inscripcionService = inject(InscripcionService);
  private toastService = inject(ToastService);
  private exportService = inject(ExportService);
  private destroyRef = inject(DestroyRef);

  inscripciones = signal<any[]>([]);
  cargando = signal(true);
  error = signal(false);
  cancelandoId = signal<string | null>(null);

  // Modal de pase
  mostrarModalPase = signal(false);
  selectedInscripcion = signal<any | null>(null);
  selectedQrDataUrl = signal<string>('');

  ngOnInit() {
    this.cargarInscripciones();
  }

  cargarInscripciones() {
    this.cargando.set(true);
    this.inscripcionService
      .obtenerMisInscripciones()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.inscripciones.set(data);
          this.cargando.set(false);
        },
        error: () => {
          this.toastService.error('Error al cargar tus inscripciones');
          this.error.set(true);
          this.cargando.set(false);
        },
      });
  }

  cancelarInscripcion(eventoId: string) {
    if (!confirm('¿Estás seguro de que deseas cancelar esta inscripción?')) {
      return;
    }

    this.cancelandoId.set(eventoId);
    this.inscripcionService
      .cancelar(eventoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.success('Inscripción cancelada.');
          this.cancelandoId.set(null);
          this.cargarInscripciones();
        },
        error: () => {
          this.cancelandoId.set(null);
        },
      });
  }

  abrirModalPase(ins: any) {
    this.selectedInscripcion.set(ins);
    this.mostrarModalPase.set(true);

    if (ins.qr_token) {
      QRCode.toDataURL(ins.qr_token, { width: 200, margin: 1 })
        .then((url: string) => {
          this.selectedQrDataUrl.set(url);
        })
        .catch((err: unknown) => {
          console.error('Error generando QR de ticket:', err);
          this.selectedQrDataUrl.set('');
        });
    } else {
      this.selectedQrDataUrl.set('');
    }
  }

  cerrarModalPase() {
    this.mostrarModalPase.set(false);
    this.selectedInscripcion.set(null);
    this.selectedQrDataUrl.set('');
  }

  descargarPdf(ins: any) {
    const eventTitle = ins.evento.titulo || 'pase_acceso';
    setTimeout(() => {
      this.exportService.descargarPdf(
        'ticket-capture',
        `ticket_${eventTitle.toLowerCase().replace(/\s+/g, '_')}`,
      );
      this.toastService.success('Pase descargado en PDF');
    }, 150);
  }

  esFechaFutura(fechaISO: string | undefined): boolean {
    if (!fechaISO) return false;
    return new Date(fechaISO) > new Date();
  }

  trackByInscripcionId(_index: number, ins: any): string {
    return ins.id;
  }
}
