import { Pipe, PipeTransform } from '@angular/core';

/** Traduce estados de inscripción a texto para la UI. */
@Pipe({
  name: 'estadoInscripcion',
  standalone: true,
})
export class EstadoInscripcionPipe implements PipeTransform {
  private readonly etiquetas: Record<string, string> = {
    CONFIRMADO: 'Confirmado',
    ESPERA: 'Lista de espera',
    CANCELADO: 'Cancelado',
    ASISTIO: 'Asistió',
  };

  transform(valor: string | null | undefined): string {
    if (!valor) return '';
    return this.etiquetas[valor] ?? valor;
  }
}
