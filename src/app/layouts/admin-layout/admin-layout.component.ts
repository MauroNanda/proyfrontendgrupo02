import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

// Layout ADMIN — envuelve las rutas del Organizador (/admin/*).
// Sidebar fija con navegación + área de contenido principal.
// Protegido por roleGuard en app.routes.ts.

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="d-flex" style="min-height: 100vh;">
      <!-- Sidebar -->
      <aside class="sidebar d-flex flex-column">
        <!-- Logo -->
        <div class="sidebar-header">
          <span class="sidebar-logo">C</span>
          <div>
            <div class="sidebar-brand">convoca</div>
            <div class="sidebar-label">ORGANIZADOR</div>
          </div>
        </div>

        <!-- Navegación principal -->
        <nav class="nav flex-column gap-1 px-3 flex-grow-1">
          <span class="sidebar-section-title">General</span>
          <a
            class="nav-link d-flex align-items-center gap-2"
            routerLink="/admin/dashboard"
            routerLinkActive="active"
          >
            <i class="bi bi-speedometer2"></i> Dashboard
          </a>

          <span class="sidebar-section-title mt-3">Gestión</span>
          <a
            class="nav-link d-flex align-items-center gap-2"
            routerLink="/admin/eventos"
            routerLinkActive="active"
          >
            <i class="bi bi-calendar-event"></i> Mis Eventos
          </a>
          <a
            class="nav-link d-flex align-items-center gap-2"
            routerLink="/admin/categorias"
            routerLinkActive="active"
          >
            <i class="bi bi-tags"></i> Categorías
          </a>
          <a
            class="nav-link d-flex align-items-center gap-2"
            routerLink="/admin/crear-evento"
            routerLinkActive="active"
          >
            <i class="bi bi-plus-lg"></i> Crear Evento
          </a>
          <a
            class="nav-link d-flex align-items-center gap-2"
            routerLink="/admin/inscriptos"
            routerLinkActive="active"
          >
            <i class="bi bi-people"></i> Inscriptos
          </a>

          <span class="sidebar-section-title mt-3">Análisis</span>
          <a
            class="nav-link d-flex align-items-center gap-2"
            routerLink="/admin/reportes"
            routerLinkActive="active"
          >
            <i class="bi bi-graph-up"></i> Reportes
          </a>
        </nav>

        <!-- Usuario -->
        <div class="sidebar-user">
          <span class="sidebar-avatar">U</span>
          <div>
            <div class="fw-semibold small">Usuario</div>
            <div class="sidebar-role">Organizador</div>
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
      .sidebar-header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 1.25rem 1.25rem 1.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        margin-bottom: 0.75rem;
      }

      .sidebar-logo {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background-color: rgba(255, 255, 255, 0.12);
        color: white;
        font-weight: 700;
        font-size: 18px;
        font-family: 'Space Grotesk', sans-serif;
      }

      .sidebar-brand {
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 700;
        font-size: 1.1rem;
        line-height: 1.2;
      }

      .sidebar-label {
        font-size: 9px;
        letter-spacing: 1.5px;
        opacity: 0.45;
        font-weight: 600;
      }

      .sidebar-section-title {
        font-size: 0.6875rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: rgba(255, 255, 255, 0.35);
        padding: 4px 16px;
        margin-top: 0.5rem;
      }

      .sidebar-user {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 1rem 1.25rem;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        margin-top: auto;
      }

      .sidebar-avatar {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background-color: rgba(82, 137, 173, 0.7);
        color: white;
        font-weight: 600;
        font-size: 13px;
      }

      .sidebar-role {
        font-size: 0.6875rem;
        opacity: 0.5;
      }
    `,
  ],
})
export class AdminLayoutComponent {}
