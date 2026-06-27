import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

// Layout ADMIN — envuelve las rutas del Organizador (/admin/*).
// Sidebar fija con navegación + área de contenido principal.
// Diseño basado en mockups (pantallas 7-10: Dashboard, Eventos, Inscriptos).
// Protegido por roleGuard en app.routes.ts.

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="d-flex" style="min-height: 100vh;">
      <!-- Sidebar -->
      <aside class="sidebar d-flex flex-column p-3">
        <!-- Logo -->
        <div class="d-flex align-items-center gap-2 mb-4 px-2">
          <span class="sidebar-logo">C</span>
          <div>
            <div class="fw-bold" style="font-family: 'Space Grotesk', sans-serif;">convoca</div>
            <div class="text-uppercase" style="font-size: 10px; letter-spacing: 1px; opacity: 0.6;">
              Panel Admin
            </div>
          </div>
        </div>

        <!-- Navegación -->
        <nav class="nav flex-column gap-1 flex-grow-1">
          <a
            class="nav-link d-flex align-items-center gap-2"
            routerLink="/admin/dashboard"
            routerLinkActive="active"
          >
            📊 Dashboard
          </a>
          <a
            class="nav-link d-flex align-items-center gap-2"
            routerLink="/admin/eventos"
            routerLinkActive="active"
          >
            📅 Mis Eventos
          </a>
          <a
            class="nav-link d-flex align-items-center gap-2"
            routerLink="/admin/crear-evento"
            routerLinkActive="active"
          >
            ➕ Crear Evento
          </a>
          <a
            class="nav-link d-flex align-items-center gap-2"
            routerLink="/admin/inscriptos"
            routerLinkActive="active"
          >
            👥 Inscriptos
          </a>
          <a
            class="nav-link d-flex align-items-center gap-2"
            routerLink="/admin/reportes"
            routerLinkActive="active"
          >
            📈 Reportes
          </a>
        </nav>

        <!-- Usuario en sidebar -->
        <div class="border-top border-secondary pt-3 mt-3 px-2">
          <div class="d-flex align-items-center gap-2">
            <span class="sidebar-avatar">RS</span>
            <div>
              <div class="fw-semibold small">Prof. Roberto Sánchez</div>
              <div style="font-size: 11px; opacity: 0.6;">Organizador</div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Contenido principal -->
      <main class="flex-grow-1 p-4" style="background-color: var(--bs-light);">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [
    `
      .sidebar-logo {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background-color: rgba(255, 255, 255, 0.15);
        color: white;
        font-weight: 700;
        font-size: 18px;
        font-family: 'Space Grotesk', sans-serif;
      }
      .sidebar-avatar {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background-color: #5289ad;
        color: white;
        font-weight: 600;
        font-size: 13px;
      }
    `,
  ],
})
export class AdminLayoutComponent {}
