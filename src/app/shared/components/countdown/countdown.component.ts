import { Component, Input, signal } from '@angular/core';

@Component({
  selector: 'app-countdown',
  standalone: true,
  templateUrl: './countdown.component.html',
})
export class CountdownComponent {
  @Input() fecha!: string;

  tiempo = signal<string>('calculando...');

  ngOnInit() {
    this.actualizar();
    setInterval(() => this.actualizar(), 1000);
  }

  actualizar() {
    const ahora = new Date().getTime();
    const evento = new Date(this.fecha).getTime();

    const diff = evento - ahora;

    if (diff <= 0) {
      this.tiempo.set('Evento iniciado');
      return;
    }

    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((diff / (1000 * 60)) % 60);

    this.tiempo.set(`${dias}d ${horas}h ${minutos}m`);
  }
}
