import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { NotificacionService, Notificacion } from '../../core/services/notificacion.service';
import { EventoService, Evento } from '../../core/services/evento.service';
import { PushService } from '../../core/services/push.service';
import { ToastService } from '../../core/services/toast.service';

// Layout PÚBLICO — envuelve las rutas del Asistente.
// Navbar con logo, búsqueda, notificaciones y acciones de auth.

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="navbar navbar-expand-lg bg-white border-bottom sticky-top">
      <div class="container">
        <!-- Logo -->
        <a class="navbar-brand d-flex align-items-center gap-2" routerLink="/">
          <img src="/assets/brand/logo.svg" alt="Convoca" class="navbar-logo-img" height="36" />
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
          <div class="mx-auto search-wrapper position-relative">
            <div class="input-group input-group-sm">
              <span class="input-group-text search-icon">
                <i class="bi bi-search"></i>
              </span>
              <input
                type="text"
                class="form-control search-input"
                placeholder="Buscar eventos, talleres, charlas..."
                [value]="queryText()"
                (input)="onSearchInput($event)"
                (focus)="onSearchFocus()"
                (blur)="onSearchBlur()"
              />
            </div>

            <!-- Panel de Sugerencias -->
            <div
              *ngIf="showSuggestions() && sugerencias().length > 0"
              class="suggestions-panel shadow-lg border rounded-4 bg-white p-2"
            >
              <div
                *ngFor="let item of sugerencias()"
                class="suggestion-item p-2 rounded-3 d-flex align-items-center gap-2"
                [routerLink]="['/eventos', item.id]"
                (mousedown)="selectSuggestion(item)"
              >
                <i class="bi bi-calendar-event text-muted-blue font-sm"></i>
                <div class="flex-grow-1 min-w-0">
                  <div class="font-xs fw-semibold text-dark-blue text-truncate">
                    {{ item.titulo }}
                  </div>
                  <div class="font-xxs text-muted" *ngIf="item.fecha">
                    {{ item.fecha | date: 'd MMM y · HH:mm' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Sugerencias Loading o Empty State -->
            <div
              *ngIf="
                showSuggestions() &&
                queryText().length >= 3 &&
                sugerencias().length === 0 &&
                !loadingSuggestions()
              "
              class="suggestions-panel shadow-lg border rounded-4 bg-white p-3 text-center text-muted font-xs"
            >
              No se encontraron eventos.
            </div>
            <div
              *ngIf="showSuggestions() && loadingSuggestions()"
              class="suggestions-panel shadow-lg border rounded-4 bg-white p-3 text-center text-muted font-xs"
            >
              <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
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

            <!-- Contenedor Campana + Dropdown -->
            <div class="position-relative" *ngIf="authService.isLoggedIn()">
              <button
                class="btn btn-icon position-relative"
                title="Notificaciones"
                (click)="toggleNotifications()"
              >
                <i class="bi bi-bell"></i>
                <span *ngIf="unreadCount() > 0" class="notification-count-badge">
                  {{ unreadCount() }}
                </span>
              </button>

              <!-- Panel flotante de notificaciones -->
              <div
                *ngIf="showNotifications()"
                class="notifications-dropdown shadow-lg border rounded-4 bg-white p-3"
              >
                <div
                  class="d-flex align-items-center justify-content-between pb-2 border-bottom mb-2"
                >
                  <span class="fw-bold font-xs text-dark-blue">Notificaciones</span>
                  <button
                    *ngIf="unreadCount() > 0"
                    (click)="marcarTodasLeidas()"
                    class="btn-clean font-xxs text-primary fw-semibold"
                  >
                    Marcar todas leídas
                  </button>
                </div>

                <div class="notifications-list">
                  <div *ngIf="loadingNotifs()" class="text-center py-3">
                    <div class="spinner-border spinner-border-sm text-muted" role="status"></div>
                  </div>

                  <div
                    *ngIf="!loadingNotifs() && notificaciones().length === 0"
                    class="text-center py-3 text-muted font-xxs"
                  >
                    No tenés notificaciones.
                  </div>

                  <div *ngIf="!loadingNotifs() && notificaciones().length > 0">
                    <div
                      *ngFor="let item of notificaciones()"
                      class="notification-item p-2 rounded-3 mb-2 d-flex gap-2.5"
                      [class.unread]="!item.leida"
                      (click)="!item.leida && marcarLeida(item.id)"
                    >
                      <!-- Icono según tipo -->
                      <div class="notif-icon-box" [ngClass]="item.tipo.toLowerCase()">
                        <i
                          [class]="
                            item.tipo === 'INSCRIPCION'
                              ? 'bi bi-journal-check'
                              : item.tipo === 'CUPO_LIBERADO'
                                ? 'bi bi-unlock'
                                : item.tipo === 'RECORDATORIO'
                                  ? 'bi bi-alarm'
                                  : 'bi bi-bell'
                          "
                        ></i>
                      </div>

                      <!-- Contenido -->
                      <div class="flex-grow-1 min-w-0">
                        <div class="d-flex align-items-start justify-content-between gap-2">
                          <span class="font-xxs fw-bold text-dark-blue text-truncate">{{
                            item.titulo
                          }}</span>
                          <span *ngIf="!item.leida" class="unread-dot"></span>
                        </div>
                        <p class="font-xxs text-muted mb-1 text-wrap-custom">{{ item.mensaje }}</p>
                        <span class="font-xxs text-muted opacity-75">{{
                          item.createdAt | date: 'd MMM, HH:mm'
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="border-top pt-2 mt-2">
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2"
                    [disabled]="activandoPush()"
                    (click)="activarNotificacionesPush()"
                  >
                    @if (activandoPush()) {
                      <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
                      Activando...
                    } @else {
                      <i class="bi bi-bell-fill"></i>
                      Alertas del navegador
                    }
                  </button>
                  <p class="font-xxs text-muted mb-0 mt-2 text-center">
                    Recibí avisos aunque no tengas la pestaña abierta.
                  </p>
                </div>
              </div>
            </div>

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
      .navbar-logo-img {
        height: 36px;
        width: auto;
        display: block;
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

      .notification-count-badge {
        position: absolute;
        top: 2px;
        right: 2px;
        min-width: 16px;
        height: 16px;
        padding: 0 4px;
        font-size: 9px;
        font-weight: 700;
        color: white;
        background-color: #ef4444;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
      }

      .notifications-dropdown {
        position: absolute;
        top: 42px;
        right: 0;
        width: 320px;
        z-index: 1050;
        max-height: 380px;
        overflow-y: auto;
      }

      .notifications-list {
        max-height: 300px;
        overflow-y: auto;
      }

      .btn-clean {
        background: none;
        border: none;
        padding: 0;
        color: #5289ad;
        cursor: pointer;
        &:hover {
          text-decoration: underline;
        }
      }

      .font-xxs {
        font-size: 0.725rem !important;
      }

      .font-xs {
        font-size: 0.825rem !important;
      }

      .text-dark-blue {
        color: #243c4c;
      }

      .notification-item {
        cursor: pointer;
        background-color: #f8fafc;
        border-left: 3px solid transparent;
        transition: background-color 0.15s ease;
        &:hover {
          background-color: #f1f5f9;
        }
        &.unread {
          background-color: #ffffff;
          border-left-color: #5289ad;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        }
      }

      .notif-icon-box {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: 6px;
        font-size: 1rem;
        flex-shrink: 0;
        &.inscripcion {
          background-color: rgba(34, 197, 94, 0.1);
          color: #22c55e;
        }
        &.cupo_liberado {
          background-color: rgba(139, 92, 246, 0.1);
          color: #8b5cf6;
        }
        &.recordatorio {
          background-color: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }
        &.evento_nuevo {
          background-color: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }
      }

      .unread-dot {
        width: 6px;
        height: 6px;
        background-color: #ef4444;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .text-wrap-custom {
        white-space: normal;
        word-break: break-word;
        line-height: 1.3;
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

      .suggestions-panel {
        position: absolute;
        top: 36px;
        left: 0;
        width: 100%;
        z-index: 1100;
        max-height: 280px;
        overflow-y: auto;
        box-shadow:
          0 10px 15px -3px rgba(0, 0, 0, 0.1),
          0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
      }

      .suggestion-item {
        cursor: pointer;
        transition: background-color 0.15s ease;
        text-decoration: none;
        &:hover {
          background-color: #f1f5f9;
        }
      }

      .text-muted-blue {
        color: #698696;
      }
    `,
  ],
})
export class PublicLayoutComponent implements OnInit, OnDestroy {
  readonly authService = inject(AuthService);
  private readonly notifService = inject(NotificacionService);
  private readonly eventoService = inject(EventoService);
  private readonly pushService = inject(PushService);
  private readonly toastService = inject(ToastService);

  readonly showNotifications = signal(false);
  readonly notificaciones = signal<Notificacion[]>([]);
  readonly unreadCount = signal(0);
  readonly loadingNotifs = signal(false);
  readonly activandoPush = signal(false);

  // Autocomplete Signals y RxJS
  readonly queryText = signal('');
  readonly sugerencias = signal<Evento[]>([]);
  readonly showSuggestions = signal(false);
  readonly loadingSuggestions = signal(false);
  private readonly searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.cargarNotificaciones();
    }

    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        switchMap((term) => {
          if (term.length < 3) {
            this.sugerencias.set([]);
            this.loadingSuggestions.set(false);
            return [];
          }
          this.loadingSuggestions.set(true);
          return this.eventoService.obtenerTodos({ search: term });
        }),
      )
      .subscribe({
        next: (results) => {
          this.sugerencias.set(results);
          this.loadingSuggestions.set(false);
        },
        error: (err) => {
          console.error('Error al buscar sugerencias:', err);
          this.loadingSuggestions.set(false);
        },
      });
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  onSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.queryText.set(val);
    if (val.length >= 3) {
      this.showSuggestions.set(true);
      this.searchSubject.next(val);
    } else {
      this.sugerencias.set([]);
      this.showSuggestions.set(false);
    }
  }

  onSearchFocus(): void {
    if (this.queryText().length >= 3) {
      this.showSuggestions.set(true);
    }
  }

  onSearchBlur(): void {
    // Retrasar cierre para que haga efecto el routerLink en el click
    setTimeout(() => {
      this.showSuggestions.set(false);
    }, 200);
  }

  selectSuggestion(item: Evento): void {
    this.queryText.set('');
    this.sugerencias.set([]);
    this.showSuggestions.set(false);
  }

  cargarNotificaciones(): void {
    this.loadingNotifs.set(true);
    this.notifService.obtenerNotificaciones({ limit: 15 }).subscribe({
      next: (res) => {
        this.notificaciones.set(res.data.rows);
        this.unreadCount.set(res.data.unreadCount);
        this.loadingNotifs.set(false);
      },
      error: (err) => {
        console.error('Error al cargar notificaciones:', err);
        this.loadingNotifs.set(false);
      },
    });
  }

  toggleNotifications(): void {
    this.showNotifications.update((val) => !val);
    if (this.showNotifications()) {
      this.cargarNotificaciones();
    }
  }

  marcarLeida(id: string): void {
    this.notifService.marcarComoLeida(id).subscribe({
      next: (res) => {
        // Actualizar localmente
        this.notificaciones.update((list) =>
          list.map((item) => (item.id === id ? { ...item, leida: true } : item)),
        );
        this.unreadCount.update((count) => Math.max(0, count - 1));
      },
      error: (err) => console.error('Error al marcar leída:', err),
    });
  }

  marcarTodasLeidas(): void {
    this.notifService.marcarTodasComoLeidas().subscribe({
      next: () => {
        this.notificaciones.update((list) => list.map((item) => ({ ...item, leida: true })));
        this.unreadCount.set(0);
      },
      error: (err) => console.error('Error al marcar todas leídas:', err),
    });
  }

  async activarNotificacionesPush(): Promise<void> {
    if (!this.pushService.navegadorCompatible()) {
      this.toastService.error('Tu navegador no soporta notificaciones push.');
      return;
    }

    this.activandoPush.set(true);
    try {
      await this.pushService.activarNotificaciones();
      this.toastService.success('Alertas del navegador activadas correctamente.');
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'No se pudieron activar las alertas.';
      this.toastService.error(mensaje);
    } finally {
      this.activandoPush.set(false);
    }
  }
}
