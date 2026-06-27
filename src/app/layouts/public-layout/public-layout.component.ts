import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

// Layout PÚBLICO — envuelve las rutas del Asistente.
// Navbar con logo, búsqueda, campana de notificaciones y avatar.
// Diseño basado en mockups (pantalla 1: Landing).

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm sticky-top">
      <div class="container">
        <!-- Logo -->
        <a class="navbar-brand d-flex align-items-center gap-2 fw-bold" routerLink="/">
          <span class="navbar-logo">C</span>
          <span>convoca</span>
          <span class="badge bg-primary bg-opacity-10 text-primary ms-1" style="font-size: 10px;"
            >BETA</span
          >
        </a>

        <!-- Toggler mobile -->
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarPublic"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Nav items -->
        <div class="collapse navbar-collapse" id="navbarPublic">
          <!-- Buscador central -->
          <div class="mx-auto" style="max-width: 400px; width: 100%;">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-white border-end-0">
                <i class="bi bi-search text-muted"></i>
                🔍
              </span>
              <input
                type="text"
                class="form-control border-start-0"
                placeholder="Buscar eventos, talleres, charlas..."
              />
            </div>
          </div>

          <!-- Acciones -->
          <div class="d-flex align-items-center gap-3 ms-auto">
            <a
              routerLink="/eventos"
              routerLinkActive="fw-semibold text-primary"
              class="nav-link text-muted d-none d-lg-block"
              >Eventos</a
            >
            <button class="btn btn-link position-relative p-1" title="Notificaciones">
              🔔
              <span
                class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                style="font-size: 9px;"
                >3</span
              >
            </button>
            <a class="btn btn-outline-primary btn-sm" routerLink="/login">Ingresar</a>
            <a class="btn btn-accent btn-sm" routerLink="/registro">Registrarme</a>
          </div>
        </div>
      </div>
    </nav>

    <main>
      <router-outlet />
    </main>

    <footer class="border-top mt-5 py-4 text-center text-muted small bg-white">
      <div class="container">&copy; 2025 Convoca · Facultad de Ingeniería · UNJu</div>
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
        background-color: var(--bs-primary);
        color: white;
        font-weight: 700;
        font-size: 16px;
        font-family: 'Space Grotesk', sans-serif;
      }
      .navbar-brand {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 1.25rem;
      }
    `,
  ],
})
export class PublicLayoutComponent {}
