import { Injectable, signal } from '@angular/core';

type Tema = 'light' | 'dark';

// Maneja el modo claro/oscuro. Aplica el atributo data-bs-theme en <html>:
// Bootstrap 5.3 lo usa para sus componentes y nuestras variables --cv-* también
// (ver styles.scss). Recuerda la elección del usuario en localStorage y, si no
// eligió, arranca según la preferencia del sistema operativo.
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'convoca-tema';

  readonly tema = signal<Tema>('light');

  constructor() {
    const guardado = localStorage.getItem(this.STORAGE_KEY) as Tema | null;
    const prefiereOscuro = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    this.aplicar(guardado ?? (prefiereOscuro ? 'dark' : 'light'));
  }

  toggle(): void {
    const nuevo: Tema = this.tema() === 'dark' ? 'light' : 'dark';
    localStorage.setItem(this.STORAGE_KEY, nuevo);
    this.aplicar(nuevo);
  }

  private aplicar(tema: Tema): void {
    this.tema.set(tema);
    document.documentElement.setAttribute('data-bs-theme', tema);
  }
}
