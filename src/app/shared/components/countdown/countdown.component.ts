import { Component, Input, OnDestroy, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-countdown',
  standalone: true,
  templateUrl: './countdown.component.html',
})
export class CountdownComponent implements OnInit, OnDestroy {
  @Input() fecha!: string;

  tiempo = signal<string>('calculando...');

  private intervalId: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.actualizar();
    this.intervalId = setInterval(() => this.actualizar(), 1000);
  }

  ngOnDestroy() {
    // Limpiar el intervalo para evitar fugas de memoria al destruir el componente.
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  actualizar() {
    const ahora = new Date().getTime();
    const evento = new Date(this.fecha).getTime();

    const diff = evento - ahora;

    if (diff <= 0) {
      this.tiempo.set('Evento iniciado');
      // Ya no hace falta seguir actualizando una vez iniciado el evento.
      if (this.intervalId !== null) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
      return;
    }

    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((diff / (1000 * 60)) % 60);

    this.tiempo.set(`${dias}d ${horas}h ${minutos}m`);
  }
}
