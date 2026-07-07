import { Pipe, PipeTransform } from '@angular/core';

/** Traduce códigos de estado de evento a etiquetas legibles en español. */
@Pipe({
  name: 'estadoEvento',
  standalone: true,
})
export class EstadoEventoPipe implements PipeTransform {
  private readonly etiquetas: Record<string, string> = {
    PUBLICADO: 'Publicado',
    BORRADOR: 'Borrador',
    CANCELADO: 'Cancelado',
  };

  transform(valor: string | null | undefined): string {
    if (!valor) return '';
    return this.etiquetas[valor] ?? valor;
  }
}
