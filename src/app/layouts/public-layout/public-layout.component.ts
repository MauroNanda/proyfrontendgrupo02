import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

// Layout PÚBLICO — envuelve las rutas del Asistente.
// Esqueleto Fase 0: navbar mínima sin estilos custom (Bootstrap defaults).
// El diseño definitivo (colores, logo, items) lo aporta la fase de diseño.

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-light border-bottom">
      <div class="container">
        <a class="navbar-brand fw-bold" routerLink="/">Convoca</a>
        <div class="d-flex gap-2">
          <a class="btn btn-outline-primary btn-sm" routerLink="/login">Ingresar</a>
          <a class="btn btn-primary btn-sm" routerLink="/registro">Registrarme</a>
        </div>
      </div>
    </nav>

    <main class="container py-4">
      <router-outlet />
    </main>

    <footer class="border-top mt-5 py-3 text-center text-muted small">
      Convoca — Grupo G02 · Facultad de Ingeniería · UNJu
    </footer>
  `,
})
export class PublicLayoutComponent {}
