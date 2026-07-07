import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

// Layout ADMIN — envuelve las rutas del Organizador (/admin/*).
// Sidebar fija con navegación + área de contenido principal.
// Protegido por roleGuard en app.routes.ts.

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="admin-shell d-flex flex-column flex-lg-row" style="min-height: 100vh;">
      <!-- Barra superior solo en mobile (sidebar oculta por defecto) -->
      <header
        class="admin-mobile-bar d-flex d-lg-none align-items-center gap-3 px-3 py-2 border-bottom"
        style="background-color: var(--cv-card);"
      >
        <button
          type="button"
          class="btn btn-outline-secondary btn-sm"
          (click)="abrirSidebar()"
          aria-label="Abrir menú del panel"
        >
          <i class="bi bi-list fs-5"></i>
        </button>
        <span class="fw-semibold small" style="color: var(--cv-text);">Panel Organizador</span>
      </header>

      @if (sidebarAbierto()) {
        <button
          type="button"
          class="sidebar-backdrop d-lg-none"
          aria-label="Cerrar menú"
          (click)="cerrarSidebar()"
        ></button>
      }

      <!-- Sidebar -->
      <aside class="sidebar d-flex flex-column" [class.sidebar-open]="sidebarAbierto()">
        <div class="d-flex d-lg-none align-items-center justify-content-between px-3 pt-3">
          <span class="small fw-semibold text-white-50">Menú</span>
          <button
            type="button"
            class="btn btn-sm btn-outline-light"
            (click)="cerrarSidebar()"
            aria-label="Cerrar menú"
          >
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <!-- Logo -->
        <a
          class="sidebar-header text-decoration-none text-white"
          routerLink="/admin/dashboard"
          (click)="cerrarSidebar()"
        >
          <img src="/assets/brand/logo.svg" alt="Convoca" class="sidebar-logo-img" height="36" />
          <div>
            <div class="sidebar-brand">convoca</div>
            <div class="sidebar-label">ORGANIZADOR</div>
          </div>
        </a>

        <!-- Navegación principal -->
        <nav class="nav flex-column gap-1 px-3 flex-grow-1">
          <span class="sidebar-section-title">General</span>
          <a
            class="nav-link d-flex align-items-center gap-2"
            routerLink="/admin/dashboard"
            routerLinkActive="active"
            (click)="cerrarSidebar()"
          >
            <i class="bi bi-speedometer2"></i> Dashboard
          </a>

          <span class="sidebar-section-title mt-3">Gestión</span>
          <a
            class="nav-link d-flex align-items-center gap-2"
            routerLink="/admin/eventos"
            routerLinkActive="active"
            (click)="cerrarSidebar()"
          >
            <i class="bi bi-calendar-event"></i> Mis Eventos
          </a>
          <a
            class="nav-link d-flex align-items-center gap-2"
            routerLink="/admin/categorias"
            routerLinkActive="active"
            (click)="cerrarSidebar()"
          >
            <i class="bi bi-tags"></i> Categorías
          </a>
          <a
            class="nav-link d-flex align-items-center gap-2"
            routerLink="/admin/eventos/crear"
            routerLinkActive="active"
            (click)="cerrarSidebar()"
          >
            <i class="bi bi-plus-lg"></i> Crear Evento
          </a>

          <span class="sidebar-section-title mt-3">Análisis</span>
          <a
            class="nav-link d-flex align-items-center gap-2"
            routerLink="/admin/test-export"
            routerLinkActive="active"
            (click)="cerrarSidebar()"
          >
            <i class="bi bi-graph-up"></i> Reportes
          </a>
          <a
            class="nav-link d-flex align-items-center gap-2"
            routerLink="/admin/accesos"
            routerLinkActive="active"
            (click)="cerrarSidebar()"
          >
            <i class="bi bi-shield-lock"></i> Accesos
          </a>

          <span class="sidebar-section-title mt-3">Sitio</span>
          <div
            class="nav-link d-flex align-items-center justify-content-between gap-2 tema-switch-admin"
          >
            <label
              class="d-flex align-items-center gap-2 mb-0 flex-grow-1"
              for="temaSwitchAdmin"
              style="cursor: pointer;"
            >
              <i
                class="bi"
                [ngClass]="theme.tema() === 'dark' ? 'bi-moon-stars-fill' : 'bi-sun-fill'"
              ></i>
              Tema
            </label>
            <div class="form-check form-switch m-0 p-0">
              <input
                class="form-check-input m-0"
                type="checkbox"
                role="switch"
                id="temaSwitchAdmin"
                [checked]="theme.tema() === 'dark'"
                (change)="theme.toggle()"
                style="cursor: pointer;"
              />
            </div>
          </div>
          <a
            class="nav-link d-flex align-items-center gap-2"
            routerLink="/"
            (click)="cerrarSidebar()"
          >
            <i class="bi bi-arrow-left-square"></i> Volver al Sitio
          </a>
        </nav>

        <!-- Usuario -->
        <div class="sidebar-user" *ngIf="authService.currentUser()">
          <span class="sidebar-avatar">
            {{ obtenerInicial(authService.currentUser()?.nombre) }}
          </span>
          <div>
            <div class="fw-semibold small text-truncate" style="max-width: 155px;">
              {{ authService.currentUser()?.nombre }}
            </div>
            <div class="sidebar-role">
              {{ authService.currentUser()?.rol | titlecase }}
            </div>
          </div>
        </div>
      </aside>

      <!-- Contenido principal -->
      <main class="flex-grow-1 p-3 p-lg-4" style="background-color: var(--cv-bg);">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [
    `
      .admin-mobile-bar {
        position: sticky;
        top: 0;
        z-index: 1020;
      }

      .sidebar-backdrop {
        position: fixed;
        inset: 0;
        border: 0;
        background: rgba(15, 23, 42, 0.45);
        z-index: 1030;
      }

      @media (max-width: 991.98px) {
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          z-index: 1040;
          transform: translateX(-100%);
          transition: transform 0.25s ease;
        }

        .sidebar.sidebar-open {
          transform: translateX(0);
        }
      }

      .sidebar-header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 1.25rem 1.25rem 1.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        margin-bottom: 0.75rem;
      }

      .sidebar-logo-img {
        height: 36px;
        width: auto;
        display: block;
        flex-shrink: 0;
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
        background-color: rgba(var(--cv-primary-rgb), 0.7);
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
export class AdminLayoutComponent {
  protected readonly authService = inject(AuthService);
  protected readonly theme = inject(ThemeService);
  readonly sidebarAbierto = signal(false);

  abrirSidebar(): void {
    this.sidebarAbierto.set(true);
  }

  cerrarSidebar(): void {
    this.sidebarAbierto.set(false);
  }

  obtenerInicial(nombre: string | undefined): string {
    if (!nombre) return 'U';
    return nombre.charAt(0).toUpperCase();
  }
}
