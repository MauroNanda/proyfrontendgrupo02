import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

// Layout PÚBLICO — envuelve las rutas del Asistente.
// Navbar con logo, búsqueda, notificaciones y acciones de auth.

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg bg-white border-bottom sticky-top">
      <div class="container">
        <!-- Logo -->
        <a class="navbar-brand d-flex align-items-center gap-2" routerLink="/">
          <span class="navbar-logo">C</span>
          <span class="brand-text">convoca</span>
        </a>

        <!-- Toggler mobile -->
        <button
          class="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarPublic"
        >
          <i class="bi bi-list fs-4"></i>
        </button>

        <!-- Nav items -->
        <div class="collapse navbar-collapse" id="navbarPublic">
          <!-- Buscador central -->
          <div class="mx-auto search-wrapper">
            <div class="input-group input-group-sm">
              <span class="input-group-text search-icon">
                <i class="bi bi-search"></i>
              </span>
              <input
                type="text"
                class="form-control search-input"
                placeholder="Buscar eventos, talleres, charlas..."
              />
            </div>
          </div>

          <!-- Acciones -->
          <div class="d-flex align-items-center gap-2 ms-auto">
            <a
              routerLink="/eventos"
              routerLinkActive="active"
              class="nav-link nav-item-custom d-none d-lg-block"
              >Eventos</a
            >

            <button class="btn btn-icon position-relative" title="Notificaciones">
              <i class="bi bi-bell"></i>
              <span class="notification-dot"></span>
            </button>

            <div class="nav-separator d-none d-lg-block"></div>

            @if (authService.isLoggedIn()) {
              <span class="user-greeting d-none d-lg-inline small text-muted">
                {{ authService.currentUser()?.nombre }}
              </span>
              @if (authService.isAdmin()) {
                <a
                  class="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
                  routerLink="/admin"
                >
                  <i class="bi bi-speedometer2"></i> Panel
                </a>
              }
              <button
                type="button"
                class="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
                (click)="authService.logout()"
              >
                <i class="bi bi-box-arrow-right"></i> Salir
              </button>
            } @else {
              <a class="btn btn-outline-secondary btn-sm" routerLink="/login">Ingresar</a>
              <a class="btn btn-primary btn-sm" routerLink="/registro">Registrarme</a>
            }
          </div>
        </div>
      </div>
    </nav>

    <main class="app-main">
      <router-outlet />
    </main>

    <footer class="app-footer">
      <div class="container">
        <span>&copy; 2026 Convoca · Facultad de Ingeniería · UNJu</span>
      </div>
    </footer>
  `,
  styles: [
    `
      .navbar-logo {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background-color: #5289ad;
        color: white;
        font-weight: 700;
        font-size: 16px;
        font-family: 'Space Grotesk', sans-serif;
      }

      .brand-text {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 1.2rem;
        font-weight: 700;
        color: var(--bs-dark);
      }

      .search-wrapper {
        max-width: 360px;
        width: 100%;
      }

      .search-icon {
        background-color: #e2e8f0;
        border: none;
        color: #698696;
        font-size: 0.8rem;
      }

      .search-input {
        background-color: #e2e8f0;
        border: none;
        font-size: 0.8125rem;

        &::placeholder {
          color: #acbcbf;
        }

        &:focus {
          background-color: #fff;
          border: 1px solid rgba(82, 137, 173, 0.3);
          box-shadow: 0 0 0 3px rgba(82, 137, 173, 0.08);
        }
      }

      .app-main {
        flex: 1;
      }

      :host {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }

      .nav-item-custom {
        font-size: 0.875rem;
        font-weight: 500;
        color: #698696;
        padding: 6px 12px;
        border-radius: 6px;
        transition: all 0.15s ease;

        &:hover,
        &.active {
          color: var(--bs-primary);
          background-color: rgba(82, 137, 173, 0.06);
        }
      }

      .btn-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 8px;
        border: none;
        background: transparent;
        color: #698696;
        font-size: 1.15rem;
        transition: all 0.15s ease;

        &:hover {
          background-color: rgba(82, 137, 173, 0.08);
          color: var(--bs-primary);
        }
      }

      .notification-dot {
        position: absolute;
        top: 6px;
        right: 6px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: var(--bs-danger);
        border: 2px solid white;
      }

      .nav-separator {
        width: 1px;
        height: 24px;
        background-color: #acbcbf;
        opacity: 0.4;
        margin: 0 4px;
      }

      .user-greeting {
        max-width: 140px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .app-footer {
        border-top: 1px solid rgba(172, 188, 191, 0.3);
        padding: 1.25rem 0;
        text-align: center;
        font-size: 0.8125rem;
        color: #698696;
        background-color: white;
        margin-top: auto;
      }
    `,
  ],
})
export class PublicLayoutComponent {
  readonly authService = inject(AuthService);
}
