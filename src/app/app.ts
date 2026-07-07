import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly title = signal('convoca-frontend');

  // Inyectarlo acá lo instancia al arrancar la app: aplica el tema guardado
  // (o el del sistema) antes de mostrar las pantallas.
  private readonly theme = inject(ThemeService);
}
