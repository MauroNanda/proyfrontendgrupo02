import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

// Layout ADMIN — envuelve las rutas del Organizador (/admin/*).
// Esqueleto Fase 0: sidebar mínima sin estilos custom.
// Protegido por roleGuard en app.routes.ts.

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink],
  template: `
    <div class="d-flex" style="min-height: 100vh;">
      <aside class="bg-dark text-white p-3" style="width: 220px;">
        <h5 class="mb-4">Convoca <small class="text-muted">admin</small></h5>
        <nav class="nav flex-column">
          <a class="nav-link text-white" routerLink="/admin/dashboard">Dashboard</a>
          <a class="nav-link text-white" routerLink="/admin/eventos">Eventos</a>
          <a class="nav-link text-white" routerLink="/admin/inscriptos">Inscriptos</a>
        </nav>
      </aside>
      <main class="flex-grow-1 p-4 bg-light">
        <router-outlet />
      </main>
    </div>
  `,
})
export class AdminLayoutComponent {}
